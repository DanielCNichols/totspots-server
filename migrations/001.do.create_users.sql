DROP TABLE IF EXISTS users;

CREATE TABLE users
(
	id SERIAL PRIMARY KEY,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT NOT NULl,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL
);




