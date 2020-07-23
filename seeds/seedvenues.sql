BEGIN;

  TRUNCATE TABLE venues
  CASCADE;
TRUNCATE TABLE amenities
CASCADE;

INSERT INTO venues
  (venue_id)
VALUES
  ('ChIJh3eRD27krIkRpG-tTJnXAf8');
-- ('Museum of Life and Science', 'education', '433 W. Murray Ave', 'durham', 'nc', 27704, 'https://www.lifeandscience.org', 9192205429)
-- ,
-- ('Bond Brothers', 'bar', '202 East Cedar St.', 'cary', 'nc', 25247, 'https://www.bondbrothersbeer.com/', 9194592670),
-- ('Joe Van Gogh', 'coffee', '1104 Broad St.', 'durham', 'nc', 27705, 'https://www.joevangogh.com/', 9196440111),
-- ('Early Bird', 'restaurant', '2816 Erwin Rd.', 'durham', 'nc', 27705, null, 9848880417),
-- ('Ponysaurus', 'bar', '219 Hood St.', 'durham', 'nc', 27705, 'http://ponysaurusbrewing.com/', 8843697669),
-- ('Dos Perros', 'restaurant', '200 N Mangum St.', 'durham', 'nc', 27705, 'http://www.dosperrosrestaurant.com/', 9199562750),
-- ('Beer Study', 'bar', '2501 University Dr.', 'durham', 'nc', 27707, 'https://www.beerstudy.com', 9842197538),
-- ('Dashi', 'restuarant', '415 E. Chapel Hill St.', 'durham', 'nc', 27701, 'http://www.dashiramen.com', 9192513995),
-- ('Mkokko', 'restaurant', '311 Holand St', 'durham', 'nc', 27701, null, 9199089332),
-- ('Toast', 'restaurant', '345 W. Main St', 'durham', 'nc', 27701, 'https://www.toast-fivepoints.com', 9196832183),
-- ('FullSteam', 'bar', '726 Rigsbee Ave', 'durham', 'nc', 27701, 'https//www.fullsteam.ag', 9196822337),
-- ('Pie Pushers', 'restaurant', '117A W. Main St', 'durham', 'nc', 27701, 'https://www.piepushers.com', 9192948408),
-- ('Vin Rouge', 'restaurant', '2010 Hillsborough Rd.', 'durham', 'nc', 27705, 'https://www.vinrougerestaurant.com', 9194160466),
-- ('The Parlour', 'restaurant', '117 Market St.', 'durham', 'nc', 27701, 'https://www.theparlour.com', 9195647999),
-- ('Story Time on the Roof@ The Durham', 'education', '315 E. Chapel Hill St.', 'durham', 'nc', 27701, 'https://www.thedurham.com', 9197688830),
-- ('High Strung Violins and Guitars', 'music', '1803 W. Markham Ave', 'durham', 'nc', 27705, 'https://www.highstrungdurham.com', 9192863801),
-- ('High Strung School of Music', 'education', '1803 W. Markham Ave', 'durham', 'nc', 27705, 'https://www.highstrungdurham.com', 9192863801),
-- ('Eno River State Park', 'outdoor', '6101 Cole Mill Rd', 'durham', 'nc', 27705, 'https://www.ncparks.gov', 9193831686),
-- ('Oak House', 'coffee', '126 W. Main St', 'durham', 'nc', 27701, null, 9193391383),
-- ('Beyu Caffe', 'coffee', '341 W Main St.', 'durham', 'nc', 27701, 'https://www.beyucaffe.com', 9196831058),
-- ('The Northern Spy', 'bar', '2812 Erwin Rd. #104', 'durham', 'nc', 27705, 'https://www.northernspync.com', 9193210203),
-- ('Cocoa Cinnamon', 'coffee', '420 W. Geer St.', 'durham', 'nc', 27701, 'https://littlewaves.coffee', null);



INSERT INTO amenities
  (amenity_name)
VALUES
  ('Stroller Accessible'),
  ('Play Area'),
  ('Changing Table'),
  ('Dogs Welcome'),
  ('Fast Checkout'),
  ('Kids Night Deals'),
  ('Outdoor Seating Available');

END;


COMMIT;