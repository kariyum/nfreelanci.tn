use crate::websocket::lobby::Lobby;

use crate::repository::messages::{insert_message, MessageCreate};
use crate::repository::notifications::{NotificationType, RawNotification};
use crate::websocket::messages::{ChatMessage, Connect, Disconnect};
use actix::{fut, ActorContext, ActorFutureExt, ContextFutureSpawner, Message, WrapFuture};
use actix::{Actor, Addr, Running, StreamHandler};
use actix::{AsyncContext, Handler};
use actix_web::web;
use actix_web_actors::ws;
use actix_web_actors::ws::Message::Text;
use serde::{Deserialize, Serialize};
use serde_json;
use sqlx::PgPool;
use std::time::{Duration, Instant};
use uuid::Uuid;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub struct Client {
    room: Uuid,
    lobby_addr: Addr<Lobby>,
    hb: Instant,
    id: Uuid,
    pgpool: web::Data<PgPool>,
    user_id: String,
}

#[derive(Serialize, Deserialize)]
struct ClientMessage {
    discussion_id: Option<i32>,
    content: String,
    receivers: Vec<String>,
}

#[derive(Serialize, Deserialize, Message)]
#[rtype(result = "()")]
#[allow(dead_code)]
struct ClientMessageResponse {
    discussion_id: i32,
    content: String,
    sender_id: i32,
}

impl Client {
    pub fn new(lobby: Addr<Lobby>, pgpool: web::Data<PgPool>, user_id: String) -> Client {
        Client {
            id: Uuid::new_v4(),
            room: Uuid::new_v4(),
            hb: Instant::now(),
            lobby_addr: lobby,
            pgpool,
            user_id,
        }
    }

    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                println!("Disconnecting failed heartbeat");
                ctx.stop();
                return;
            }

            ctx.ping(b"hi");
        });
    }
}

impl Actor for Client {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        // called automatically from the websocket route
        println!("Client connected!");

        // register heartbeats
        self.hb(ctx);

        let addr = ctx.address();
        let connect = Connect {
            addr,
            lobby_id: self.room,
            self_id: self.id,
            user_id: self.user_id.clone(),
        };
        self.lobby_addr
            .send(connect)
            .into_actor(self)
            .then(|res, _, ctx| {
                match res {
                    Ok(_res) => (),
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        println!("WsConn is stopped");
        self.lobby_addr.do_send(Disconnect {
            id: self.id,
            room_id: self.room,
        });
        Running::Stop
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for Client {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            Ok(ws::Message::Pong(_)) => {
                self.hb = Instant::now();
            }
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            Ok(ws::Message::Close(reason)) => {
                println!("Close received: {:?}", reason);
                ctx.close(reason);
                ctx.stop();
            }
            Ok(ws::Message::Continuation(_)) => {
                ctx.stop();
            }
            Ok(ws::Message::Nop) => (),
            Ok(Text(s)) => {
                println!("Received a message from client: {:?}", s);
                let client_message = serde_json::from_str::<ClientMessage>(&s);
                if let Err(err) = client_message {
                    let response = ClientMessage {
                        discussion_id: None,
                        content: err.to_string(),
                        receivers: vec![],
                    };
                    ctx.text(serde_json::to_string(&response).unwrap());
                    println!(
                        "Failed to deserialize websocket message to ClientMessage {:?}",
                        err
                    );
                    return;
                }
                let client_message = client_message.unwrap();
                let pool = self.pgpool.clone();
                let user_id = self.user_id.clone();
                let client_actor_message = ChatMessage {
                    discussion_id: client_message.discussion_id.unwrap(),
                    content: client_message.content.clone(),
                    sender_id: user_id.clone(),
                    receivers: client_message.receivers.clone(),
                    notification_type: NotificationType::Message,
                };
                async move {
                    let message_create = MessageCreate {
                        discussion_id: client_message.discussion_id.unwrap(),
                        content: client_message.content.clone(),
                    };
                    insert_message(user_id, message_create, pool.as_ref()).await;
                }
                .into_actor(self)
                .spawn(ctx);
                self.lobby_addr.do_send(client_actor_message);
            }
            Err(e) => std::panic::panic_any(e),
        }
    }
}

impl Handler<ChatMessage> for Client {
    type Result = ();

    fn handle(&mut self, msg: ChatMessage, ctx: &mut Self::Context) {
        // messages coming from Lobby actor are handled here
        println!("Sending message to client: {:?}", msg);
        ctx.text(serde_json::to_string(&msg).unwrap());
    }
}

impl Handler<RawNotification> for Client {
    type Result = ();

    fn handle(&mut self, msg: RawNotification, ctx: &mut Self::Context) -> Self::Result {
        ctx.text(serde_json::to_string(&msg).unwrap())
    }
}
