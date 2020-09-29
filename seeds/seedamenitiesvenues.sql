BEGIN;

  TRUNCATE TABLE amenities_venues;

  insert into amenities_venues
    (amenity, venueid)
  values
    (2, 'ChIJh3eRD27krIkRpG-tTJnXAf8');
  insert into amenities_venues
    (amenity, venueid)
  values
    (4, 'ChIJh3eRD27krIkRpG-tTJnXAf8');
  insert into amenities_venues
    (amenity, venueid)
  values(5, 'ChIJh3eRD27krIkRpG-tTJnXAf8');
END;
COMMIT;