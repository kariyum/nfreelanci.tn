use std::hash::{DefaultHasher, Hash, Hasher};

use crate::repository::user::{
    get_user_by_credentials, insert_user, update_password, RegisterRequest, UpdatePasswordRequest,
};
use crate::services::google_auth::{
    self, construct_login_url, exchange_code_for_token, fetch_user_info, GoogleAuth,
};
use crate::services::token::{generate_cookie, Claims};
use actix_web::cookie::time::Duration;
use actix_web::cookie::Cookie;
use actix_web::dev::HttpServiceFactory;
use actix_web::http::StatusCode;
use actix_web::web::{Form, Json};
use actix_web::{web, HttpResponse, HttpResponseBuilder, Responder};
use serde::Deserialize;
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
    data: web::Data<Pool<Postgres>>,
) -> impl Responder {
    let hashed_password = hash_password(&register_request.password);
    let hashed_register_request = RegisterRequest {
        password: hashed_password,
        ..register_request
    };
    insert_user(&hashed_register_request, data.as_ref())
        .await
        .expect("Failed to insert user");

    let cookie = generate_cookie(
        &hashed_register_request.email,
        &hashed_register_request.role,
    )
    .expect("Failed to generate cookie");

    HttpResponse::Ok().cookie(cookie).finish()
}

async fn logout() -> impl Responder {
    let cookie = Cookie::build("Authorization", "")
        .path("/")
        .secure(false) // TODO update
        .http_only(true)
        .max_age(Duration::seconds(0))
        .finish();

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

async fn google_auth(google_auth: web::Data<GoogleAuth>) -> impl Responder {
    let login_url = construct_login_url(google_auth.as_ref());

    if let Some(login_url) = login_url {
        HttpResponse::SeeOther()
            .append_header(("LOCATION", login_url.as_str()))
            .finish()
    } else {
        HttpResponse::InternalServerError().body("Failed to prase google auth url")
    }
}

#[derive(Deserialize)]
#[serde(untagged)]
enum GoogleCallback {
    Success { code: String, state: String },
    Failed { error: String, state: String },
}

async fn google_callback(
    web::Query(google_callback): web::Query<GoogleCallback>,
    google_auth: web::Data<GoogleAuth>,
) -> impl Responder {
    // TODO check the validity of state
    let google_auth = google_auth.as_ref();
    match google_callback {
        GoogleCallback::Failed { error, .. } => handle_failed_google_auth(google_auth, error).await,
        GoogleCallback::Success { code, .. } => handle_ok_google_auth(google_auth, code).await,
    }
}

async fn handle_ok_google_auth(google_auth: &GoogleAuth, code: String) -> HttpResponse {
    // TODO check for scopes the user has permitted our app to access
    let token_response = exchange_code_for_token(&code, google_auth)
        .await
        .expect("Failed to exchange code for token");
    let user_data = fetch_user_info(&token_response, google_auth)
        .await
        .expect("Failed to fetch user info");
    println!("{:?}", user_data);

    HttpResponse::SeeOther()
        .append_header(("LOCATION", "http://localhost:5173/"))
        .finish()
}

async fn handle_failed_google_auth(google_auth: &GoogleAuth, error: String) -> HttpResponse {
    println!("GOOGLE AUTH FAILED!!!, user did not provide acces");
    HttpResponse::Ok().body(String::from("YOU DID NOT AUTHORIZE MY APP???? LOOOOOL"))
}

pub fn routes() -> impl HttpServiceFactory {
    web::scope("auth")
        .route("login", web::post().to(login))
        .route("register", web::post().to(register))
        .route("logout", web::get().to(logout))
        .route("whoami", web::get().to(whoami))
        .route("user/password", web::patch().to(update_password_handler))
        .route("google_redirect", web::get().to(google_auth))
        .route("google_callback", web::get().to(google_callback))
}
