DROP TABLE IF EXISTS totspots_users;

CREATE TABLE totspots_users(
	id SERIAL PRIMARY KEY,
	first_name TEXT NOT NULL, 
	last_name TEXT NOT NULL, 
	email TEXT NOT NULl,
	city TEXT, 
	state TEXT,
	username TEXT NOT NULL UNIQUE, 
	password TEXT NOT NULL 
);

DROP TABLE IF EXISTS totspots_venues;

CREATE TABLE totspots_venues(
	id SERIAL PRIMARY KEY,
	venue_name TEXT NOT NULL,
	venue_type TEXT NOT NULL,
	address TEXT NOT NULL,
	city TEXT NOT NULL,
	State TEXT NOT NULL,
	zipcode NUMERIC NOT NULL
);

DROP TABLE IF EXISTS totspots_amenities;

CREATE TABLE totspots_amenities(
	id SERIAL PRIMARY KEY, 
	amenity_name TEXT NOT NULL
);




