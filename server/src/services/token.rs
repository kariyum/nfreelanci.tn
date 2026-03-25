use actix_web::cookie::{time::Duration, Cookie};
use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;

use crate::services::google_auth::{GoogleLoginState, GoogleUserInfo};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub role: String,
}

pub fn generate_jwt(user_id: &str, role: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_owned(),
        exp: expiration,
        role: role.to_owned(),
    };

    let secret = env::var("SECRET_KEY").unwrap_or("secret".to_string());

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

#[derive(Deserialize, Debug, Serialize)]
pub struct UserInfoPreLogin {
    pub email: String,
    sub: String,
    name: String,
    exp: usize,
    last_name: Option<String>,
}

pub fn generate_jwt_provider_login(
    google_user_info: GoogleUserInfo,
) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(30))
        .expect("valid timestamp")
        .timestamp() as usize;

    let secret = env::var("SECRET_KEY").unwrap_or("secret".to_string());

    let claims = UserInfoPreLogin {
        email: google_user_info.email.clone(),
        sub: google_user_info.sub.clone(),
        exp: expiration,
        name: google_user_info.name,
        last_name: google_user_info.last_name,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn validate_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = env::var("SECRET_KEY").unwrap_or("secret".to_string());
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )?;

    Ok(data.claims)
}

pub fn generate_cookie<'a>(
    user_id: &'a str,
    role: &'a str,
) -> Result<Cookie<'a>, jsonwebtoken::errors::Error> {
    generate_jwt(user_id, role).map(|jwt| {
        Cookie::build("auth", jwt)
            .path("/")
            .secure(true)
            .http_only(true)
            .max_age(Duration::days(24))
            .finish()
    })
}

pub fn validate_login_provider_token(
    token: &str,
) -> Result<UserInfoPreLogin, jsonwebtoken::errors::Error> {
    let secret = env::var("SECRET_KEY").unwrap_or("secret".to_string());
    let data = decode::<UserInfoPreLogin>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )?;

    Ok(data.claims)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GoogleLoginStateCookie {
    exp: usize,
    #[serde(flatten)]
    google_login_state: GoogleLoginState,
}

pub fn generate_google_state_cookie(
    google_login_state: GoogleLoginState,
) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(30))
        .expect("valid timestamp")
        .timestamp() as usize;

    let secret = env::var("SECRET_KEY").unwrap_or("secret".to_string());

    let cookie = GoogleLoginStateCookie {
        exp: expiration,
        google_login_state,
    };

    encode(
        &Header::default(),
        &cookie,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn validate_google_login_state(
    token: &str,
) -> Result<GoogleLoginState, jsonwebtoken::errors::Error> {
    let secret = env::var("SECRET_KEY").unwrap_or("secret".to_string());
    let data = decode::<GoogleLoginStateCookie>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    );

    Ok(data?.claims.google_login_state)
}
