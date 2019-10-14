BEGIN;

TRUNCATE 
  amenities_venues;

INSERT INTO amenities_venues (amenity, venue)
VALUES 
  (1, 3),
  (1, 5),
  (1, 2),
  (3, 6),
  (4, 7),
  (5, 1),
  (2, 3),
  (2, 5),
  (5, 1),
  (1, 7),
  (1, 4),
  (6, 3),
  (7, 1);

COMMIT;

  
