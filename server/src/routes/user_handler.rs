use std::hash::{DefaultHasher, Hash, Hasher};

use crate::repository::user::{
    get_user, get_user_by_credentials, get_user_provider, insert_user, insert_user_credentials,
    insert_user_provider, update_password, ProviderUserRegisterInsert, RegisterRequest,
    UpdatePasswordRequest,
};
use crate::routes::auth_extractor::HasCookie;
use crate::services::google_auth::{
    self, construct_login_url, exchange_code_for_token, fetch_user_info, GoogleAuth,
    GoogleLoginState, GoogleLoginStateUrl,
};
use crate::services::token::{
    generate_cookie, generate_google_state_cookie, generate_jwt, generate_jwt_provider_login,
    Claims, UserInfoPreLogin,
};
use actix_web::cookie::time::Duration;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpServiceFactory;
use actix_web::guard::Guard;
use actix_web::http::StatusCode;
use actix_web::web::{Form, Json};
use actix_web::{web, HttpResponse, HttpResponseBuilder, Responder};
use env_logger::builder;
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

async fn login(
    Form(form): Form<LoginRequest>,
    pg_pool: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let maybe_user_row = get_user_by_credentials(
        form.email.clone(),
        hash_password(&form.password.clone()),
        pg_pool.as_ref(),
    )
    .await;
    match maybe_user_row {
        Ok(Some(user_row)) => {
            let cookie = generate_cookie(form.email.as_str(), user_row.role.as_str()).unwrap();
            let mut response = HttpResponse::Ok().finish();
            response.add_cookie(&cookie).unwrap();
            response
        }
        _ => HttpResponse::Unauthorized().finish(),
    }
}

fn hash_password(password: &String) -> String {
    let mut hasher = DefaultHasher::new();
    password.hash(&mut hasher);
    hasher.finish().to_string()
}

pub async fn register(
    Form(register_request): Form<RegisterRequest>,
    pool: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let user = get_user_provider(&register_request.email, pool.as_ref())
        .await
        .expect("Failed to get user");

    if user.is_some() {
        HttpResponse::Conflict().body("User already exists...")
    } else {
        let hashed_password = hash_password(&register_request.password);
        let hashed_register_request = RegisterRequest {
            password: hashed_password,
            ..register_request
        };

        let mut tx = pool.begin().await.expect("Failed to open a transaction");

        insert_user(&hashed_register_request, &mut *tx)
            .await
            .expect("Failed to insert user");

        insert_user_credentials(
            &hashed_register_request.email,
            &hashed_register_request.password,
            &mut *tx,
        )
        .await
        .expect("Failed to insert user credentials");

        tx.commit()
            .await
            .expect("Failed to commit user insert transaction");

        let cookie = generate_cookie(
            &hashed_register_request.email,
            &hashed_register_request.role,
        )
        .expect("Failed to generate cookie");

        HttpResponse::Ok().cookie(cookie).finish()
    }
}
async fn logout() -> impl Responder {
    let mut cookie = Cookie::build("auth", "")
        .path("/")
        .secure(true) // TODO update
        .http_only(true)
        .max_age(Duration::seconds(0))
        .finish();

    cookie.make_removal();

    HttpResponse::NoContent().cookie(cookie).finish()
}

#[derive(Deserialize)]
struct UpdatePasswordPayload {
    current_password: String,
    new_password: String,
}
async fn update_password_handler(
    Claims { sub, .. }: Claims,
    Json(update_password_payload): Json<UpdatePasswordPayload>,
    data: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let update_password_request = UpdatePasswordRequest {
        email: sub,
        current_password: hash_password(&update_password_payload.current_password),
        new_password: hash_password(&update_password_payload.new_password),
    };

    let count = update_password(update_password_request, data.as_ref())
        .await
        .expect("Failed to update user password");

    if count == 0 {
        return HttpResponse::Unauthorized().finish();
    }
    HttpResponse::Ok().finish()
}

async fn whoami(claims: Claims) -> impl Responder {
    HttpResponse::Ok().json(claims)
}

async fn whoami_provider(user_info_pre_login: UserInfoPreLogin) -> impl Responder {
    HttpResponse::Ok().json(user_info_pre_login)
}

async fn google_auth(google_auth: web::Data<GoogleAuth>) -> impl Responder {
    let login_state = construct_login_url(google_auth.as_ref());

    if let Some(GoogleLoginStateUrl { url, state }) = login_state {
        let state_cookie = Cookie::build(
            "login_state",
            generate_google_state_cookie(state).expect("Failed to genrate google state cookie"),
        )
        .path("/")
        .secure(true)
        .http_only(true)
        .max_age(Duration::days(1))
        .finish();

        HttpResponse::SeeOther()
            .append_header(("LOCATION", url.as_str()))
            .cookie(state_cookie)
            .finish()
    } else {
        HttpResponse::InternalServerError().body("Failed to prase google auth url")
    }
}

#[derive(Deserialize)]
struct GoogleCallback {
    state: String,
    #[serde(flatten)]
    status: GoogleCallbackStatus,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum GoogleCallbackStatus {
    Success { code: String },
    Failed { error: String },
}

async fn google_callback(
    web::Query(google_callback): web::Query<GoogleCallback>,
    google_auth: web::Data<GoogleAuth>,
    google_login_state: GoogleLoginState,
    pool: web::Data<Pool<Postgres>>,
) -> impl Responder {
    if google_login_state.state == google_callback.state {
        let google_auth = google_auth.as_ref();
        match google_callback.status {
            GoogleCallbackStatus::Failed { error } => {
                handle_failed_google_auth(google_auth, error).await
            }
            GoogleCallbackStatus::Success { code, .. } => {
                handle_ok_google_auth(google_auth, code, pool).await
            }
        }
    } else {
        HttpResponse::Unauthorized().body("State changed, unauthorizing the request...")
    }
}

async fn handle_ok_google_auth(
    google_auth: &GoogleAuth,
    code: String,
    pool: web::Data<Pool<Postgres>>,
) -> HttpResponse {
    let token_response = exchange_code_for_token(&code, google_auth)
        .await
        .expect("Failed to exchange code for token");
    let user_data = fetch_user_info(&token_response, google_auth)
        .await
        .expect("Failed to fetch user info");

    let user_provider = get_user_provider(&user_data.email, pool.as_ref())
        .await
        .expect("Failed to check if user exists");

    let cookie = if let Some(user) = user_provider {
        generate_cookie(&user.email, &user.role)
            .expect("Failed to create auth cookie provider")
            .into_owned()
    } else {
        let provider_login_token = generate_jwt_provider_login(user_data)
            .expect("Failed to generate provider login cookie");

        Cookie::build("pre_auth", provider_login_token)
            .path("/")
            .secure(true)
            .http_only(true)
            .max_age(Duration::days(24))
            .finish()
    };

    let mut login_state_cookie = Cookie::build("login_state", "")
        .path("/")
        .secure(true)
        .http_only(true)
        .finish();

    login_state_cookie.make_removal();

    HttpResponse::SeeOther()
        .append_header(("LOCATION", google_auth.app_redirection_url.as_str()))
        .cookie(cookie)
        .cookie(login_state_cookie)
        .finish()
}

async fn handle_failed_google_auth(google_auth: &GoogleAuth, error: String) -> HttpResponse {
    let mut login_state_cookie = Cookie::build("login_state", "")
        .path("/")
        .secure(true)
        .http_only(true)
        .finish();

    login_state_cookie.make_removal();

    HttpResponse::SeeOther()
        .append_header(("LOCATION", google_auth.access_denied_url.as_str()))
        .cookie(login_state_cookie)
        .body(error)
}

#[derive(Deserialize)]
struct ProviderUserRegister {
    first_name: String,
    last_name: String,
    role: String,
}

async fn handle_user_register_from_provider(
    Form(provider_user_register): web::Form<ProviderUserRegister>,
    user_info_pre_login: UserInfoPreLogin,
    pool: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let provider_user_register_insert = ProviderUserRegisterInsert {
        email: user_info_pre_login.email,
        first_name: provider_user_register.first_name,
        last_name: provider_user_register.last_name,
        role: provider_user_register.role,
    };
    insert_user_provider(&provider_user_register_insert, pool.as_ref())
        .await
        .expect("Failed to insert user from provider");

    let cookie = generate_cookie(
        &provider_user_register_insert.email,
        &provider_user_register_insert.role,
    )
    .expect("Failed to generate cookie");

    let mut pre_auth_cookie = Cookie::build("pre_auth", "")
        .path("/")
        .secure(true)
        .http_only(true)
        .max_age(Duration::days(24))
        .finish();

    pre_auth_cookie.make_removal();

    HttpResponse::Ok()
        .cookie(cookie)
        .cookie(pre_auth_cookie)
        .finish()
}

async fn cancel_provider_registeration(google_auth: web::Data<GoogleAuth>) -> impl Responder {
    let mut pre_auth_cookie = Cookie::build("pre_auth", "")
        .path("/")
        .secure(true)
        .http_only(true)
        .max_age(Duration::days(24))
        .finish();

    pre_auth_cookie.make_removal();

    HttpResponse::SeeOther()
        .append_header(("LOCATION", google_auth.app_redirection_url.as_str()))
        .cookie(pre_auth_cookie)
        .finish()
}

pub fn routes() -> impl HttpServiceFactory {
    web::scope("auth")
        .route("login", web::post().to(login))
        .route(
            "register",
            web::post()
                .guard(HasCookie("pre_auth"))
                .to(handle_user_register_from_provider),
        )
        .route("register", web::post().to(register))
        .route("cancel", web::post().to(cancel_provider_registeration))
        .route("logout", web::get().to(logout))
        .route(
            "whoami",
            web::get().guard(HasCookie("pre_auth")).to(whoami_provider),
        )
        .route("whoami", web::get().to(whoami))
        .route("user/password", web::patch().to(update_password_handler))
        .route("google_redirect", web::get().to(google_auth))
        .route("google_callback", web::get().to(google_callback))
}
