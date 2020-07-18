DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  price INTEGER NOT NULL,
  volume INTEGER NOT NULL,
  starRating INTEGER NOT NULL, 
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);
