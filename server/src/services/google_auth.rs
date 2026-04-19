use fake::rand::{self, RngCore};
use reqwest::Url;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct GoogleAuth {
    client_id: String,
    client_secret: String,
    login_url: String,
    token_url: String,
    user_info_url: String,
    pub callback_url: String,
    pub app_redirection_url: String,
    pub access_denied_url: String,
}

pub fn create_google_auth() -> GoogleAuth {
    GoogleAuth {
        client_id: std::env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID not set"),
        client_secret: std::env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET not set"),
        login_url: std::env::var("GOOGLE_LOGIN_URL").expect("GOOGLE_LOGIN_URL not set"),
        token_url: std::env::var("GOOGLE_TOKEN_URL").expect("GOOGLE_TOKEN_URL not set"),
        user_info_url: std::env::var("GOOGLE_USER_INFO_URL").expect("GOOGLE_USER_INFO_URL not set"),
        callback_url: std::env::var("OAUTH_CALLBACK_URL").expect("OAUTH_REDIRECTION_URL not set"),
        app_redirection_url: std::env::var("OAUTH_APP_REDIRECTION_URL")
            .expect("OAUTH_APP_REDIRECTION_URL not set"),
        access_denied_url: std::env::var("OATH_APP_ACCESS_DENIED_URL")
            .expect("OATH_APP_ACCESS_DENIED_URL not set"),
    }
}

fn generate_random_state() -> String {
    let mut key = [0u8; 32];
    let mut rng = rand::rng();
    rng.fill_bytes(&mut key);
    hex::encode(key)
}

pub struct GoogleLoginStateUrl {
    pub url: Url,
    pub state: GoogleLoginState,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct GoogleLoginState {
    pub state: String,
}

pub fn construct_login_url(google_auth: &GoogleAuth) -> Option<GoogleLoginStateUrl> {
    let state = generate_random_state();
    let params = [
        ("response_type", "code"),
        ("client_id", google_auth.client_id.as_str()),
        ("redirect_uri", google_auth.callback_url.as_str()),
        ("scope", "openid email profile"),
        ("state", state.as_str()),
        ("include_granted_scopes", "true"),
    ];

    let url = Url::parse_with_params(&google_auth.login_url, params)
        .expect("Failed to generate google login url");

    Some(GoogleLoginStateUrl {
        url: url,
        state: GoogleLoginState { state },
    })
}

#[derive(Deserialize, Debug)]
pub struct GoogleUserInfo {
    pub email: String,
    pub sub: String,
    // picture: String,
    // email_verified: bool,
    pub name: String,
    // given_name: String,
    pub last_name: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct GoogleTokenBody {
    code: String,
    client_id: String,
    redirect_uri: String,
    grant_type: String,
    client_secret: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GoogleTokenResponse {
    access_token: String,
    expires_in: i32,
    id_token: String,
    scope: String,
    token_type: String,
}

pub async fn exchange_code_for_token(
    code: &str,
    google_auth: &GoogleAuth,
) -> Result<GoogleTokenResponse, Box<dyn std::error::Error>> {
    let body = GoogleTokenBody {
        client_id: google_auth.client_id.clone(),
        code: String::from(code),
        grant_type: String::from("authorization_code"),
        redirect_uri: google_auth.callback_url.clone(),
        client_secret: google_auth.client_secret.clone(),
    };

    let response: GoogleTokenResponse = reqwest::Client::new()
        .post(google_auth.token_url.clone())
        .form(&body)
        .send()
        .await?
        .json()
        .await?;

    Ok(response)
}

pub async fn fetch_user_info(
    google_token_response: &GoogleTokenResponse,
    google_auth: &GoogleAuth,
) -> Result<GoogleUserInfo, Box<dyn std::error::Error>> {
    let response: GoogleUserInfo = reqwest::Client::new()
        .get(google_auth.user_info_url.as_str())
        .bearer_auth(google_token_response.access_token.as_str())
        .send()
        .await?
        .json()
        .await?;

    Ok(response)
}
