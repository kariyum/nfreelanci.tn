ALTER TABLE users ADD hashed_password VARCHAR(255);

UPDATE users
SET hashed_password = (SELECT hashed_password FROM user_credentials WHERE email = users.email);

DROP TABLE user_credentials;
