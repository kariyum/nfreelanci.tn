use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::types::BigDecimal;
use sqlx::{Executor, Postgres};

#[derive(Serialize, sqlx::Type, Debug, Clone)]
#[serde(rename_all(serialize = "snake_case"))]
#[sqlx(type_name = "proposal_status", rename_all = "lowercase")]
pub enum ProposalStatus {
    Pending,
    Accepted,
    Declined,
    Cancelled,
}

#[derive(Serialize, Debug)]
pub struct RawProposal {
    pub id: i32,
    pub user_id: String,
    pub task_id: i32,
    pub status: ProposalStatus,
    pub budget: Option<BigDecimal>,
    pub content: Option<String>,
    pub created_at: DateTime<Utc>,
}

pub struct CreateProposal {
    pub user_id: String,
    pub task_id: i32,
    pub status: ProposalStatus,
    pub budget: Option<BigDecimal>,
    pub content: Option<String>,
}

#[allow(dead_code)]
pub async fn read_proposals(
    task_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<RawProposal>, sqlx::Error> {
    sqlx::query_as!(
        RawProposal,
        "SELECT id, user_id, task_id, status as \"status: ProposalStatus\", budget, content, created_at FROM proposals WHERE task_id = $1",
        task_id
    )
        .fetch_all(conn)
        .await
}

pub async fn read_proposals_owner(
    task_owner: String,
    task_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<RawProposal>, sqlx::Error> {
    sqlx::query_as!(
        RawProposal,
        "SELECT p.id, p.user_id, p.task_id, p.status as \"status: ProposalStatus\", p.budget, p.content, p.created_at FROM proposals AS p JOIN tasks AS t \
        ON p.task_id = t.id JOIN projects AS pr ON t.project_id = pr.id WHERE p.task_id = $1 and pr.user_id = $2",
        task_id,
        task_owner
    )
        .fetch_all(conn)
        .await
}

pub async fn read_proposals_freelancer(
    user_id: String,
    task_id: i32,
    pgpool: impl Executor<'_, Database = Postgres>,
) -> Result<Vec<RawProposal>, sqlx::Error> {
    sqlx::query_as!(
        RawProposal,
        r#"SELECT id, user_id, task_id, status as "status: ProposalStatus", budget, content, created_at FROM proposals WHERE task_id = $1 AND user_id = $2"#,
        task_id,
        user_id
    )
        .fetch_all(pgpool)
        .await
}

#[allow(dead_code)]
pub async fn read_proposal(
    proposal_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Option<RawProposal>, sqlx::Error> {
    sqlx::query_as!(
        RawProposal,
        "SELECT id, user_id, task_id, status as \"status: ProposalStatus\", budget, content, created_at FROM proposals WHERE id = $1",
        proposal_id
    ).fetch_optional(conn).await
}

#[derive(Serialize, Debug)]
pub struct RawProposalForNotification {
    pub id: i32,
    pub user_id: String,
    pub task_id: i32,
    pub task_creator: String,
    pub status: ProposalStatus,
    pub budget: Option<BigDecimal>,
    pub content: Option<String>,
    pub created_at: DateTime<Utc>,
    pub project_id: i32,
}

pub async fn read_proposal_for_notification(
    proposal_id: i32,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Option<RawProposalForNotification>, sqlx::Error> {
    sqlx::query_as!(
        RawProposalForNotification,
        r#"SELECT p.id, p.user_id, task_id, p.status as "status: ProposalStatus", p.budget, p.content, p.created_at, t.project_id, projects.user_id as task_creator
           FROM proposals AS p JOIN tasks AS t ON p.task_id = t.id JOIN projects on projects.id = t.project_id WHERE p.id = $1"#,
        proposal_id
    ).fetch_optional(conn).await
}

pub async fn insert_proposal(
    insert_proposal: CreateProposal,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<RawProposal, sqlx::Error> {
    sqlx::query_as!(
        RawProposal,
        r#"INSERT INTO proposals (user_id, task_id, status, budget, content) VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, task_id) DO UPDATE SET
              status = EXCLUDED.status,
              budget = EXCLUDED.budget,
              content = EXCLUDED.content
         RETURNING id, user_id, task_id, status as "status: ProposalStatus", budget, content, created_at"#,
        insert_proposal.user_id,
        insert_proposal.task_id,
        insert_proposal.status as ProposalStatus,
        insert_proposal.budget,
        insert_proposal.content
    ).fetch_one(conn).await
}

pub async fn update_proposal_status(
    proposal_id: i32,
    target_status: ProposalStatus,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE proposals SET status = $1 WHERE id = $2",
        target_status as ProposalStatus,
        proposal_id
    )
    .execute(conn)
    .await
    .map(|_| ())
}

pub async fn update_proposal_content(
    user_id: String,
    proposal_id: i32,
    content: Option<String>,
    budget: Option<BigDecimal>,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"UPDATE proposals SET content = $1, budget = $2 WHERE id = $3 and user_id = $4"#,
        content,
        budget,
        proposal_id,
        user_id
    )
    .execute(conn)
    .await
    .map(|_| ())
}

#[cfg(test)]
mod test {
    use crate::repository::proposal::read_proposals;
    use sqlx::PgPool;

    #[sqlx::test(fixtures(
        path = "./fixtures",
        scripts("users.sql", "tasks.sql", "proposals.sql")
    ))]
    async fn read_proposal_test(pg_pool: PgPool) {
        let x = read_proposals(1, &pg_pool).await.unwrap();

        println!("Result is = {:?}", x);
    }
}
