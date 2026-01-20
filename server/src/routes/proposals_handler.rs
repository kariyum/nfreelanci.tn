use crate::repository::discussions::get_discussion_id;
use crate::repository::discussions::{insert_discussion, CreateDiscussion};
use crate::repository::notifications::{insert_notification, CreateNotification, NotificationType};
use crate::repository::proposal::{
    insert_proposal, read_proposal_for_notification, read_proposals_freelancer,
    read_proposals_owner, update_proposal_content, update_proposal_status, CreateProposal,
    ProposalStatus,
};
use crate::repository::tasks::{read_task_creator_by_id, TaskCreator};
use crate::services::token::Claims;
use crate::websocket::lobby::Lobby;
use actix::Addr;
use actix_web::dev::HttpServiceFactory;
use actix_web::web::{Data, Json, Path};
use actix_web::{web, HttpResponse, Responder};
use bigdecimal::BigDecimal;
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;

#[derive(Deserialize)]
pub struct ProposalCreate {
    task_id: i32,
    budget: Option<BigDecimal>,
    content: Option<String>,
}

pub async fn create_proposal_handler(
    claims: Claims,
    Json(proposal_create): Json<ProposalCreate>,
    pgpool: Data<PgPool>,
    lobby: Data<Addr<Lobby>>,
) -> impl Responder {
    let create_proposal = CreateProposal {
        user_id: claims.sub.clone(),
        task_id: proposal_create.task_id,
        status: ProposalStatus::Pending,
        budget: proposal_create.budget,
        content: proposal_create.content,
    };

    let inserted_proposal = insert_proposal(create_proposal, pgpool.as_ref())
        .await
        .expect("Failed to insert proposal");

    let task_creator = read_task_creator_by_id(proposal_create.task_id, pgpool.as_ref())
        .await
        .expect("Failed to fetch task creator by id");

    if let Some(TaskCreator {
        user_id: project_creator,
        project_id,
    }) = task_creator
    {
        let create_notification = CreateNotification {
            user_id: project_creator.clone(),
            content: json!({
                "task_id": proposal_create.task_id,
                "trigger_user_id": claims.sub.clone(),
                "proposal_id": inserted_proposal.id,
                "project_id": project_id
            }),
            notification_type: NotificationType::NewProposal,
        };

        let raw_notification = insert_notification(create_notification, pgpool.as_ref())
            .await
            .expect("Failed to insert notification");

        lobby.do_send(raw_notification);

        let exists = get_discussion_id(
            inserted_proposal.task_id,
            inserted_proposal.id,
            pgpool.as_ref(),
        )
        .await
        .expect("Failed to fetch discussion from database")
        .is_some();

        if !exists {
            let create_discussion = CreateDiscussion {
                user_ids: vec![claims.sub.clone(), project_creator],
                task_id: inserted_proposal.task_id,
                proposal_id: inserted_proposal.id,
                created_by: claims.sub,
            };
            insert_discussion(create_discussion, pgpool.as_ref())
                .await
                .expect("Failed to insert discussion into database");
        }
    }

    HttpResponse::Created().finish()
}

pub async fn get_proposals_handler(
    claims: Claims,
    path: Path<(i32, i32)>,
    pgpool: Data<PgPool>,
) -> impl Responder {
    let (_, task_id) = path.into_inner();
    let proposals = if claims.role == "recruiter" {
        read_proposals_owner(claims.sub, task_id, pgpool.as_ref())
            .await
            .expect("Failed to read proposals")
    } else {
        read_proposals_freelancer(claims.sub, task_id, pgpool.as_ref())
            .await
            .expect("Failed to read proposals")
    };
    HttpResponse::Ok().json(proposals)
}

pub async fn delete_proposal_handler(
    _: Claims,
    path: Path<i32>,
    pgpool: Data<PgPool>,
) -> impl Responder {
    let mut client = pgpool
        .acquire()
        .await
        .expect("Failed to acquire a Postgres connection from the pool");

    let task_id = path.into_inner();
    let _ = sqlx::query("DELETE FROM proposals WHERE id = $1")
        .bind(&task_id)
        .execute(&mut *client)
        .await
        .expect(format!("Failed to delete proposal from the database {task_id}").as_str());

    HttpResponse::Ok().finish()
}

#[derive(Deserialize)]
struct ProposalAction {
    action: ProposalActions,
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum ProposalActions {
    Accept,
    Decline,
    Cancel,
}

async fn update_proposal_status_handler(
    claims: Claims,
    lobby: Data<Addr<Lobby>>,
    path: Path<i32>,
    Json(ProposalAction { action }): Json<ProposalAction>,
    pgpool: Data<PgPool>,
) -> impl Responder {
    let proposal_id = path.into_inner();
    let target_status = match action {
        ProposalActions::Accept => ProposalStatus::Accepted,
        ProposalActions::Decline => ProposalStatus::Declined,
        ProposalActions::Cancel => ProposalStatus::Cancelled,
    };
    update_proposal_status(proposal_id, target_status.clone(), pgpool.as_ref())
        .await
        .expect("Failed to update Proposal status");
    let proposal = read_proposal_for_notification(proposal_id, pgpool.as_ref())
        .await
        .expect("Failed to read proposal");
    if let Some(proposal) = proposal {
        let create_notification = match target_status {
            ProposalStatus::Cancelled => CreateNotification {
                user_id: proposal.task_creator,
                content: json!({
                    "proposal_id": proposal.id,
                    "proposal_status": target_status,
                    "task_id": proposal.task_id,
                    "project_id": proposal.project_id,
                    "trigger_user_id":  claims.sub,
                }),
                notification_type: NotificationType::Proposal,
            },
            _ => CreateNotification {
                user_id: proposal.user_id.clone(),
                content: json!({
                    "proposal_id": proposal.id,
                    "proposal_status": target_status,
                    "task_id": proposal.task_id,
                    "project_id": proposal.project_id,
                    "trigger_user_id": claims.sub
                }),
                notification_type: NotificationType::Proposal,
            },
        };
        let inserted_notification =
            insert_notification(create_notification.clone(), pgpool.as_ref())
                .await
                .expect("Failed to insert proposal notification");

        lobby.do_send(inserted_notification);
    }

    HttpResponse::Ok().finish()
}

#[derive(Deserialize)]
pub struct ProposalUpdate {
    budget: Option<BigDecimal>,
    content: Option<String>,
}
async fn update_proposal_handler(
    claims: Claims,
    // lobby: Data<Addr<Lobby>>,
    path: Path<i32>,
    Json(proposal_update): Json<ProposalUpdate>,
    pgpool: Data<PgPool>,
) -> impl Responder {
    let proposal_id = path.into_inner();
    update_proposal_content(
        claims.sub,
        proposal_id,
        proposal_update.content,
        proposal_update.budget,
        pgpool.as_ref(),
    )
    .await
    .expect("Failed to update proposal content");

    HttpResponse::Ok().finish()
}

pub fn routes() -> impl HttpServiceFactory {
    web::scope("proposals")
        .route("", web::post().to(create_proposal_handler))
        .route("", web::get().to(get_proposals_handler))
        .route("{id}", web::delete().to(delete_proposal_handler))
        .route("{id}", web::put().to(update_proposal_handler))
        .route(
            "{id}/status",
            web::patch().to(update_proposal_status_handler),
        )
}
