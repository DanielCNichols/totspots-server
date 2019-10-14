BEGIN;

TRUNCATE 
  totspots_venues,
  totspots_amenities
  RESTART IDENTITY CASCADE;

INSERT INTO totspots_venues (venue_name, venue_type, address, city, state, zipcode)
VALUES
  ('Bull McCabes', 'Bar', '123 Main st.', 'Durham', 'NC', 27705),
  ('Museum of Life and Science', 'Education', '1654 West st.', 'Durham', 'NC', 27704),
  ('Bond brothers', 'Bar', '123 Main st.', 'Cary', 'NC', 25247),
  ('Joe Van Gogh', 'Coffee', '498 caffiene st.', 'Durham', 'NC', 27705),
  ('Early Bird', 'Restaurant', '987 Erwin Rd.', 'Durham', 'NC', 27705),
  ('Ponysaurus', 'Bar', '159 West chapel st.', 'Durham', 'NC', 27705),
  ('Dos Perros', 'Restaurant', '123 Parish st.', 'Durham', 'NC', 27705);

INSERT INTO totspots_amenities (amenity_name) 
VALUES
  ('Stroller Accessible'),
  ('Play Area'),
  ('Changing Table'),
  ('Dogs Welcome'),
  ('Fast Checkout'),
  ('Kids Night Deals'),
  ('Outdoor Seating Available');




COMMIT;