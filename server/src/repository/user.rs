use fake::{
    faker::name::{en::FirstName, en::LastName},
    rand,
    rand::seq::IndexedRandom,
    Dummy, Fake, Faker,
};
use serde::Deserialize;
use sqlx::{Error, Executor, Postgres};

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct UserRow {
    #[allow(dead_code)]
    pub email: String,
    pub role: String,
}

pub async fn get_user_by_credentials(
    email: String,
    password: String,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Option<UserRow>, Error> {
    get_user(email, password, conn).await
}

pub async fn get_user(
    email: String,
    password: String,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<Option<UserRow>, Error> {
    sqlx::query_as::<_, UserRow>(
        "SELECT email, role FROM users WHERE email = $1 AND hashed_password = $2",
    )
    .bind(&email)
    .bind(&password)
    .fetch_optional(conn)
    .await
}

pub struct UserInfoUpdate {
    pub first_name: String,
    pub last_name: String,
}

pub async fn update_user(
    email: String,
    user_info_update: UserInfoUpdate,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), Error> {
    sqlx::query!(
        r#"UPDATE users SET first_name = $1, last_name = $2 WHERE email = $3"#,
        user_info_update.first_name,
        user_info_update.last_name,
        email
    )
    .execute(conn)
    .await
    .map(|_| ())
}

pub struct UpdatePasswordRequest {
    pub email: String,
    pub current_password: String,
    pub new_password: String,
}

pub async fn update_password(
    update_password_request: UpdatePasswordRequest,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<u8, Error> {
    sqlx::query!(
        r#"UPDATE users SET hashed_password = $1 WHERE email = $2 AND hashed_password = $3"#,
        update_password_request.new_password,
        update_password_request.email,
        update_password_request.current_password
    )
    .execute(conn)
    .await
    .map(|query_result| query_result.rows_affected() as u8)
}

#[derive(Deserialize, Debug)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub role: String,
    pub first_name: String,
    pub last_name: String,
}

impl Dummy<Faker> for RegisterRequest {
    fn dummy_with_rng<R: rand::Rng + ?Sized>(_config: &Faker, rng: &mut R) -> Self {
        // Use the correct fakers for each field
        let first_name: String = FirstName().fake_with_rng(rng);
        let last_name: String = LastName().fake_with_rng(rng);
        let email: String = format!(
            "{}_{}@gmail.com",
            first_name.to_lowercase(),
            last_name.to_lowercase()
        );
        let password = "10552891166674516712".to_string();

        // Use rand::seq::SliceRandom to choose a role
        const ROLES: &[&str] = &["recruiter", "freelancer"];
        let role = ROLES.choose(rng).unwrap().to_string();

        RegisterRequest {
            last_name,
            email,
            first_name,
            role,
            password,
        }
    }
}

pub async fn insert_user(
    register_request: &RegisterRequest,
    conn: impl Executor<'_, Database = Postgres>,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "
            INSERT INTO users (email, hashed_password, role, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5)
        ",
    )
    .bind(&register_request.email)
    .bind(&register_request.password)
    .bind(&register_request.role)
    .bind(&register_request.first_name)
    .bind(&register_request.last_name)
    .execute(conn)
    .await
    .map(|_| ())
}

#[cfg(test)]
mod tests {
    use crate::repository::user::{
        get_user, get_user_by_credentials, insert_user, RegisterRequest,
    };

    #[sqlx::test(fixtures(path = "fixtures", scripts("users.sql")))]
    async fn read_user_test(pool: sqlx::PgPool) -> sqlx::Result<()> {
        let row = get_user("test@gmail.com".to_string(), "password".to_string(), &pool).await;

        assert_eq!(row?.unwrap().email, "test@gmail.com");

        Ok(())
    }

    #[sqlx::test]
    async fn insert_user_test(pool: sqlx::PgPool) -> sqlx::Result<()> {
        let register_request = RegisterRequest {
            email: "test_email@gmail.com".to_string(),
            password: "password".to_string(),
            role: "role".to_string(),
            first_name: "first".to_string(),
            last_name: "last".to_string(),
        };
        let _ = insert_user(&register_request, &pool).await?;
        let user = get_user_by_credentials(
            "test_email@gmail.com".to_string(),
            "password".to_string(),
            &pool,
        )
        .await
        .expect("Failed to get user");
        assert!(user.is_some());
        assert_eq!(user.unwrap().email, "test_email@gmail.com");
        Ok(())
    }
}
