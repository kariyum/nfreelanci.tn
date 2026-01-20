use crate::repository;
use crate::repository::project::{delete_project, insert_project, put_project, ProjectInsert, ProjectRaw};
use crate::repository::tasks::{
    delete_tasks, insert_tasks_sequentially, read_tasks_by_project_id, update_task, CreateTask,
};
use crate::repository::tasks_proposals::RawTaskProposal;
use crate::routes::proposals_handler::get_proposals_handler;
use crate::services::token::Claims;
use actix_web::dev::HttpServiceFactory;
use actix_web::web::{Json, Path};
use actix_web::{web, HttpResponse, Responder};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Pool, Postgres};
use std::collections::HashSet;
use fake::{Dummy, Fake, Faker, Rng};
use fake::faker::lorem::en::{Sentence, Words};

#[derive(Serialize)]
struct ProjectResponse {
    id: i32,
    user_id: String,
    title: String,
    content: String,
    deadline: DateTime<Utc>,
    budget: f32,
    currency_code: String,
    created_at: DateTime<Utc>,
    tasks: Option<Vec<RawTaskProposal>>,
}

impl From<ProjectRaw> for ProjectResponse {
    fn from(project: ProjectRaw) -> Self {
        ProjectResponse {
            id: project.id,
            user_id: project.user_id,
            title: project.title,
            content: project.content,
            deadline: project.deadline,
            budget: project.budget,
            currency_code: project.currency_code,
            created_at: project.created_at,
            tasks: None,
        }
    }
}

#[allow(dead_code)]
async fn get_project(_: Claims, path: Path<i32>, pgpool: web::Data<PgPool>) -> impl Responder {
    let project_id = path.into_inner();
    let project_option = repository::project::get_project_by_id(project_id, pgpool.as_ref())
        .await
        .expect(&format!("Failed to get project by id {}", project_id))
        .map(ProjectResponse::from);
    if let Some(project) = project_option {
        HttpResponse::Ok().json(project)
    } else {
        HttpResponse::NotFound().finish()
    }
}

async fn get_project_with_tasks(
    claims: Option<Claims>,
    path: Path<i32>,
    pgpool: web::Data<PgPool>,
) -> impl Responder {
    let project_id = path.into_inner();
    let project_option = repository::project::get_project_by_id(project_id, pgpool.as_ref())
        .await
        .expect(&format!("Failed to get project by id {}", project_id))
        .map(ProjectResponse::from);

    let tasks = if let Some(claims) = claims  {
        repository::tasks_proposals::read_tasks_with_submission_by_project_id(
            project_id,
            claims.sub,
            pgpool.as_ref(),
        )
            .await
            .expect(&format!("Failed to read tasks {}", project_id))
    } else {
        read_tasks_by_project_id(project_id, pgpool.as_ref())
            .await
            .expect(&format!("Failed to read tasks {}", project_id))
            .into_iter()
            .map(|task| {
                RawTaskProposal {
                    id: task.id,
                    project_id: task.project_id,
                    title: task.title,
                    content: task.content,
                    deadline: task.deadline,
                    assignee_id: task.assignee_id,
                    budget: task.budget,
                    status: task.status,
                    created_at: task.created_at,
                    skills: task.skills,
                    proposal_status: None,
                    proposal_id: None,
                    proposal_budget: None,
                    proposal_content: None,
                    proposal_submission_date: None,
                }
            }).collect()
    };

    if let Some(project) = project_option {
        let response = ProjectResponse {
            tasks: Some(tasks),
            ..project
        };

        HttpResponse::Ok().json(response)
    } else {
        HttpResponse::NotFound().finish()
    }
}

#[derive(Deserialize, Debug)]
struct ProjectPost {
    title: String,
    content: String,
    deadline: DateTime<Utc>,
    budget: f32,
    tasks: Vec<TaskPost>,
}

#[derive(Deserialize, Debug)]
struct TaskPost {
    id: Option<i32>,
    title: String,
    content: String,
    deadline: DateTime<Utc>,
    assignee_id: String,
    budget: f32,
    status: String,
    skills: Vec<String>,
}

impl Dummy<Faker> for TaskPost {
    fn dummy_with_rng<R: Rng + ?Sized>(_: &Faker, rng: &mut R) -> Self {
        let title = Sentence(1..10).fake_with_rng(rng);
        let content = Sentence(1..100).fake_with_rng(rng);
        let deadline = Faker.fake();
        let assignee_id = "".to_string();
        let budget = Faker.fake();
        let status = "".to_string();
        let skills = Words(2..10).fake_with_rng(rng);
        TaskPost {
            id: None,
            title,
            content,
            deadline,
            assignee_id,
            budget,
            status,
            skills
        }
    }
}

async fn create_project_handler(
    Json(project_post): Json<ProjectPost>,
    pgpool: web::Data<PgPool>,
    claims: Claims,
) -> impl Responder {
    if claims.role == "freelancer" {
        HttpResponse::Forbidden().finish()
    } else {
        let project_create = ProjectInsert {
            user_id: claims.sub,
            title: project_post.title,
            content: project_post.content,
            deadline: project_post.deadline,
            budget: project_post.budget,
            currency_code: String::from("TN"),
        };

        let project_raw = insert_project(project_create, pgpool.as_ref())
            .await
            .expect("Failed to insert project");

        let tasks_insert = project_post
            .tasks
            .into_iter()
            .map(|task| CreateTask {
                project_id: project_raw.id,
                title: task.title,
                content: task.content,
                deadline: task.deadline,
                assignee_id: task.assignee_id,
                budget: task.budget,
                status: task.status,
                skills: task.skills,
            })
            .collect::<Vec<CreateTask>>();

        insert_tasks_sequentially(tasks_insert, pgpool.as_ref())
            .await
            .expect("Failed to insert tasks");

        HttpResponse::Created().finish()
    }
}

impl Dummy<Faker> for ProjectPost {
    fn dummy_with_rng<R: Rng + ?Sized>(_: &Faker, rng: &mut R) -> Self {
        ProjectPost {
            title: Sentence(1..10).fake_with_rng(rng),
            content: Sentence(1..100).fake_with_rng(rng),
            budget: Faker.fake::<f32>(),
            tasks: (1..10).map(|_| Faker.fake::<TaskPost>()).collect(),
            deadline: Faker.fake_with_rng(rng),
        }
    }
}

pub async fn seed_projects_handler(claims: Claims, pool: Pool<Postgres>) {
    let payload = Faker.fake();
    create_project_handler(
        Json(payload),
        web::Data::new(pool),
        claims
    ).await;
}

async fn delete_project_handler(
    path: Path<i32>,
    pgpool: web::Data<PgPool>,
    _: Claims,
) -> impl Responder {
    let _ = delete_project(path.into_inner(), pgpool.as_ref())
        .await
        .expect("Failed to delete project");

    HttpResponse::Ok().finish()
}

async fn put_project_handler(
    path: Path<i32>,
    Json(project_post): Json<ProjectPost>,
    pgpool: web::Data<PgPool>,
    claims: Claims,
) -> impl Responder {
    let project_id = path.into_inner();
    let project_insert = ProjectInsert {
        user_id: claims.sub,
        title: project_post.title,
        content: project_post.content,
        deadline: project_post.deadline,
        budget: project_post.budget,
        currency_code: String::from("TN"),
    };
    let response: ProjectResponse = put_project(project_id, project_insert, pgpool.as_ref())
        .await
        .expect(&format!("Failed to put project {}", project_id))
        .into();

    let (tasks_to_update, tasks_to_insert): (Vec<TaskPost>, Vec<TaskPost>) = project_post
        .tasks
        .into_iter()
        .partition(|task| task.id.is_some());

    let persisted_task_ids = read_tasks_by_project_id(project_id, pgpool.as_ref())
        .await
        .expect("Failed to read tasks")
        .into_iter()
        .map(|task| task.id)
        .collect::<HashSet<i32>>();

    let task_ids_to_update = tasks_to_update
        .iter()
        .filter(|task| task.id.is_some())
        .map(|task| task.id.unwrap())
        .collect::<HashSet<i32>>();

    let tasks_to_delete = persisted_task_ids
        .difference(&task_ids_to_update)
        .map(|i| i.clone())
        .collect::<Vec<i32>>();

    delete_tasks(tasks_to_delete, pgpool.as_ref())
        .await
        .expect("Failed to delete tasks");

    let tasks = tasks_to_insert
        .into_iter()
        .map(|task| CreateTask {
            project_id: response.id,
            title: task.title,
            content: task.content,
            deadline: task.deadline,
            assignee_id: task.assignee_id,
            budget: task.budget,
            status: task.status,
            skills: task.skills,
        })
        .collect::<Vec<CreateTask>>();

    insert_tasks_sequentially(tasks, pgpool.as_ref())
        .await
        .expect("Failed to insert tasks");

    for task in tasks_to_update {
        let pl = CreateTask {
            project_id: response.id,
            title: task.title,
            content: task.content,
            deadline: task.deadline,
            assignee_id: task.assignee_id,
            budget: task.budget,
            status: task.status,
            skills: task.skills,
        };
        update_task(task.id.unwrap(), pl, pgpool.as_ref())
            .await
            .expect("Failed to update task");
    }

    HttpResponse::Ok().json(response)
}

#[derive(Deserialize)]
struct ProjectSearchQuery {
    q: Option<String>
}
async fn get_projects_search(
    query: web::Query<ProjectSearchQuery>,
    pgpool: web::Data<PgPool>,
) -> impl Responder {
    let query = query.into_inner();
    if let Some(query) = query.q {
        let result: Vec<ProjectResponse> = repository::project::search_products(query, pgpool.as_ref()).await
            .expect("Failed to search products")
            .into_iter()
            .map(ProjectResponse::from)
            .collect();
        HttpResponse::Ok().json(result)
    } else {
        let projects: Vec<ProjectResponse> = repository::project::get_projects(pgpool.as_ref())
            .await
            .expect("Failed to get projects")
            .into_iter()
            .map(ProjectResponse::from)
            .collect();

        HttpResponse::Ok().json(projects)
    }
}

pub fn routes() -> impl HttpServiceFactory {
    web::scope("projects")
        .route("", web::get().to(get_projects_search))
        .route("", web::post().to(create_project_handler))
        .route("/{id}", web::get().to(get_project_with_tasks))
        .route("/{id}", web::delete().to(delete_project_handler))
        .route("/{id}", web::put().to(put_project_handler))
        .route(
            "/{id}/task/{task_id}/proposals",
            web::get().to(get_proposals_handler),
        )
}
