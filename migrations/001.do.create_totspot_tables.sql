DROP TABLE IF EXISTS users;

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	first_name TEXT NOT NULL, 
	last_name TEXT NOT NULL, 
	email TEXT NOT NULl,
	city TEXT, 
	state TEXT,
	username TEXT NOT NULL UNIQUE, 
	password TEXT NOT NULL 
);

DROP TABLE IF EXISTS venues;

CREATE TABLE venues(
	id SERIAL PRIMARY KEY,
	venue_name TEXT NOT NULL,
	venue_type TEXT NOT NULL,
	address TEXT NOT NULL,
	city TEXT NOT NULL,
	state TEXT NOT NULL,
	zipcode NUMERIC,
	url text DEFAULT NULL,
	phone numeric DEFAULT NULL
);

DROP TABLE IF EXISTS amenities;

CREATE TABLE amenities(
	id SERIAL PRIMARY KEY, 
	amenity_name TEXT NOT NULL
);




