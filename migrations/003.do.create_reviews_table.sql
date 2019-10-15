DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES totspots_venues(id),
  content TEXT NOT NULL,
  price INTEGER NOT NULL,
  volume INTEGER NOT NULL,
  starRating INTEGER NOT NULL, 
  user_id INTEGER REFERENCES totspots_users(id),
  date_created TIMESTAMP DEFAULT now() NOT NULL
);

