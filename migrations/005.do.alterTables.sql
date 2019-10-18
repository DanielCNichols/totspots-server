DROP TABLE IF EXISTS users_favorites;

CREATE TABLE users_favorites (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE
);