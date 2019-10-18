DROP TABLE IF EXISTS users_favorites;

CREATE TABLE users_favorites (
  user_id INTEGER REFERENCES totspots_users(id),
  venue_id INTEGER REFERENCES totspots_venues(id)
);