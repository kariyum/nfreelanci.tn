use actix::Actor;
use actix_cors::Cors;
use actix_web::web::Data;
use actix_web::{middleware::Logger, App, HttpServer};
use dotenv::dotenv;
use log::warn;
use server::routes;
use server::services::{database::get_db_pool, google_auth::create_google_auth};
use server::websocket::lobby::Lobby;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("debug")); // "info"
    dotenv()
        .inspect_err(|err| warn!("Could not load .env file... {}", err))
        .ok();

    let pool = get_db_pool().await?;
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Migrations failed");

    let chat_server = Lobby::default().start(); //create and spin up a lobby

    let host = std::env::var("HOST").expect("HOST env var is not set");
    let port = std::env::var("PORT")
        .map(|port| port.parse::<u16>().expect("PORT is not a i32"))
        .expect("PORT env var is not set");
    let google_auth = create_google_auth();

    HttpServer::new(move || {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .app_data(Data::new(pool.clone()))
            .app_data(Data::new(chat_server.clone())) //register the lobby
            .app_data(Data::new(google_auth.clone()))
            .wrap(Logger::default())
            .service(routes::user_handler::routes())
            .service(routes::project_handler::routes())
            .service(routes::profiles_handler::routes())
            .service(routes::feature_requests_handler::routes())
            .service(routes::comments_handler::routes())
            .service(routes::proposals_handler::routes())
            .service(routes::discussions_handler::routes())
            .service(routes::tasks_handler::routes())
            .service(routes::push_events_handler::routes())
            .service(routes::notifications_handler::routes())
    })
    .bind((host, port))?
    .run()
    .await
}
