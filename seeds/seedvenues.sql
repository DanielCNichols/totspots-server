BEGIN;

TRUNCATE 
  venues,
  amenities
  RESTART IDENTITY CASCADE;

INSERT INTO venues (venue_name, venue_type, address, city, state, zipcode, url, phone)
VALUES
  ('Bull McCabes', 'bar', '123 Main st.', 'durham', 'nc', 27705, 'http://www.bullmccabesirishpub.com', 9196283061),
  ('Museum of Life and Science', 'education', '1654 West St.', 'durham', 'nc', 27704, 'https://www.lifeandscience.org', 9192205429),
  ('Bond Brothers', 'bar', '123 Main st.', 'Cary', 'nc', 25247, 'https://www.bondbrothersbeer.com/', 9194592670),
  ('Joe Van Gogh', 'Coffee', '498 caffiene st.', 'durham', 'nc', 27705, 'https://www.joevangogh.com/', 9196440111),
  ('Early Bird', 'Restaurant', '987 Erwin Rd.', 'durham', 'nc', 27705, null, 9848880417),
  ('Ponysaurus', 'bar', '159 West chapel st.', 'durham', 'nc', 27705, 'http://ponysaurusbrewing.com/', 8843697669),
  ('Dos Perros', 'Restaurant', '123 Parish st.', 'durham', 'nc', 27705, 'http://www.dosperrosrestaurant.com/', 9199562750);

INSERT INTO amenities (amenity_name) 
VALUES
  ('Stroller Accessible'),
  ('Play Area'),
  ('Changing Table'),
  ('Dogs Welcome'),
  ('Fast Checkout'),
  ('Kids Night Deals'),
  ('Outdoor Seating Available');




COMMIT;