DROP TABLE IF EXISTS venues;
-- venue_id comes from google!
CREATE TABLE venues
(
  id SERIAL PRIMARY KEY,
  venue_id TEXT NOT NULL UNIQUE
);

