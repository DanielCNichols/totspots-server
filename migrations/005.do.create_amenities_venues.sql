DROP TABLE IF EXISTS amenities_venues;

CREATE TABLE amenities_venues
(
  amenity INTEGER REFERENCES amenities(id) ON DELETE CASCADE,
  venueID TEXT REFERENCES venues(venue_id) ON DELETE CASCADE
);
