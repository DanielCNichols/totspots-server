BEGIN;

TRUNCATE 
  venues,
  amenities
  RESTART IDENTITY CASCADE;

INSERT INTO venues (venue_name, venue_type, address, city, state, zipcode, url, phone)
VALUES
  ('Bull McCabes', 'Bar', '123 Main st.', 'Durham', 'NC', 27705, 'http://www.bullmccabesirishpub.com', 9196283061),
  ('Museum of Life and Science', 'Education', '1654 West St.', 'Durham', 'NC', 27704, 'https://www.lifeandscience.org', 9192205429),
  ('Bond Brothers', 'Bar', '123 Main st.', 'Cary', 'NC', 25247, 'https://www.bondbrothersbeer.com/', 9194592670),
  ('Joe Van Gogh', 'Coffee', '498 caffiene st.', 'Durham', 'NC', 27705, 'https://www.joevangogh.com/', 9196440111),
  ('Early Bird', 'Restaurant', '987 Erwin Rd.', 'Durham', 'NC', 27705, null, 9848880417),
  ('Ponysaurus', 'Bar', '159 West chapel st.', 'Durham', 'NC', 27705, 'http://ponysaurusbrewing.com/', 8843697669),
  ('Dos Perros', 'Restaurant', '123 Parish st.', 'Durham', 'NC', 27705, 'http://www.dosperrosrestaurant.com/', 9199562750);

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