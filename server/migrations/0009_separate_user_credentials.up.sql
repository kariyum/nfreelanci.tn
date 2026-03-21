CREATE TABLE user_credentials (
    email VARCHAR(255) PRIMARY KEY REFERENCES users (email),
    hashed_password VARCHAR(255) NOT NULL
);

INSERT INTO user_credentials (email, hashed_password)
SELECT email, hashed_password
FROM users;

ALTER TABLE users DROP COLUMN hashed_password;
