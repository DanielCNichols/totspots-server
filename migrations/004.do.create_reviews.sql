DROP TABLE IF EXISTS reviews;
-- venue_id comes from google!
CREATE TABLE reviews
(
  id SERIAL PRIMARY KEY,
  venueId TEXT REFERENCES venues(venue_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  volume_rating INTEGER NOT NULL,
  totspots_rating INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);

