DROP TABLE IF EXISTS amenities_venues;

CREATE TABLE amenities_venues(
  amenity INTEGER REFERENCES amenities(id) ON DELETE CASCADE,
  venue INTEGER REFERENCES venues(id) ON DELETE CASCADE
);
