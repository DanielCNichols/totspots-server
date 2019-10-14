DROP TABLE IF EXISTS amenities_venues;

CREATE TABLE amenities_venues(
  amenity INTEGER REFERENCES totspots_amenities(id),
  venue INTEGER REFERENCES totspots_venues(id)
);
