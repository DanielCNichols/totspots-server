DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES totspots_users(id),
  review_id INTEGER REFERENCES reviews(id),
  voteStatus NUMERIC NOT NULL
);