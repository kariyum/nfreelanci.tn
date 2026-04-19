pub mod repository;
pub mod services {
    pub mod database;
    pub mod email_service;
    pub mod google_auth;
    pub mod token;
}
pub mod routes;

pub mod websocket {
    pub mod client;
    pub mod lobby;
    pub mod messages;
}

pub mod error;
