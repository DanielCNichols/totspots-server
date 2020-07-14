BEGIN;

  TRUNCATE TABLE amenities_venues;

  insert into amenities_venues
    (amenity, venueid)
  values
    (2, '0f5502f218f8da928bd697801a0ae6f0f6e3beab');
  insert into amenities_venues
    (amenity, venueid)
  values
    (4, '0f5502f218f8da928bd697801a0ae6f0f6e3beab');
  insert into amenities_venues
    (amenity, venueid)
  values(5, '0f5502f218f8da928bd697801a0ae6f0f6e3beab');
END;
COMMIT;