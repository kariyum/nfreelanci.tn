use crate::error::ServiceError;
use crate::services::google_auth::GoogleLoginState;
use crate::services::token::{
    validate_google_login_state, validate_jwt, validate_login_provider_token, Claims,
    UserInfoPreLogin,
};
use actix_web::dev::Payload;
use actix_web::guard::{Guard, GuardContext};
use actix_web::{Error, FromRequest, HttpRequest};
use futures_util::future::ready;
use serde::{Deserialize, Serialize};

impl FromRequest for Claims {
    type Error = Error;
    type Future = futures::future::Ready<Result<Self, Self::Error>>;
    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let cookie = req
            .cookie("auth")
            .map(|token| validate_jwt(token.value()).ok())
            .flatten();
        if let Some(claims) = cookie {
            ready(Ok(claims))
        } else {
            ready(Err(ServiceError::Unauthorized.into()))
        }
    }
}

pub struct HasCookie(pub &'static str);

impl Guard for HasCookie {
    fn check(&self, ctx: &GuardContext<'_>) -> bool {
        ctx.head()
            .headers()
            .get("cookie")
            .and_then(|header| header.to_str().ok())
            .map(|header| header.contains(self.0))
            .unwrap_or(false)
    }
}

impl FromRequest for UserInfoPreLogin {
    type Error = Error;
    type Future = futures::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let cookie = req
            .cookie("pre_auth")
            .map(|token| validate_login_provider_token(token.value()).ok())
            .flatten();

        if let Some(claims) = cookie {
            ready(Ok(claims))
        } else {
            ready(Err(ServiceError::Unauthorized.into()))
        }
    }
}

impl FromRequest for GoogleLoginState {
    type Error = Error;
    type Future = futures::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let cookie = req
            .cookie("login_state")
            .map(|token| validate_google_login_state(token.value()).ok())
            .flatten();

        if let Some(claims) = cookie {
            ready(Ok(claims))
        } else {
            ready(Err(ServiceError::Unauthorized.into()))
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct EmailVerificationCode {
    pub code: String,
}

impl FromRequest for EmailVerificationCode {
    type Error = Error;
    type Future = futures::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let cookie = req
            .cookie("email_verification_code")
            .map(|cookie| serde_json::from_str(cookie.value()).ok())
            .flatten();

        if let Some(code) = cookie {
            ready(Ok(code))
        } else {
            ready(Err(ServiceError::BadRequest(
                "Missing email verification code".to_string(),
            )
            .into()))
        }
    }
}
