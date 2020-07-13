const VenuesService = {
  getVenueById(db, id) {
    return db
      .from('venues')
      .select(
        'venues.venue_name',
        'venues.city',
        'venues.state',
        'venues.address',
        'venues.zipcode',
        'venues.phone',
        'venues.url',
        'venues.venue_type',
        'venues.id'
      )
      .avg({ avgPrice: 'reviews.price' })
      .avg({ avgRating: 'reviews.starrating' })
      .avg({ avgVolume: 'reviews.volume' })
      .leftJoin('reviews', 'venues.id', '=', 'reviews.venue_id')
      .where('venues.id', id)
      .first()
      .groupBy(
        'venues.venue_name',
        'venues.city',
        'venues.state',
        'venues.address',
        'venues.zipcode',
        'venues.venue_type',
        'venues.url',
        'venues.phone',
        'venues.id'
      );
  },

  //! This will be used as the initial query for the results page. We will be getting a list of venues from google based on their type.
  //! We need to get each venue's reviews:[] by their googleId (we can store this as a reference).
  //! If no totspots user review, return an empty array.

  getVenuesByCity(db, city, state, type) {
    return db
      .from('venues')
      .select(
        'venues.venue_name',
        'venues.city',
        'venues.state',
        'venues.address',
        'venues.zipcode',
        'venues.phone',
        'venues.url',
        'venues.venue_type',
        'venues.id'
      )
      .avg({ avgPrice: 'reviews.price' })
      .avg({ avgRating: 'reviews.starrating' })
      .avg({ avgVolume: 'reviews.volume' })
      .leftJoin('reviews', 'venues.id', '=', 'reviews.venue_id')
      .where('venues.state', state)
      .andWhere('venues.city', city)
      .andWhere('venues.venue_type', type)
      .groupBy(
        'venues.venue_name',
        'venues.city',
        'venues.state',
        'venues.address',
        'venues.zipcode',
        'venues.venue_type',
        'venues.url',
        'venues.phone',
        'venues.id'
      );
  },

  addVenue(db, newVenue) {
    return db
      .insert(newVenue)
      .into('venues')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getAmenitiesByVenue(db, venue_id) {
    return db
      .from('venues')
      .select('venues.venue_name', 'amenities.amenity_name')
      .join('amenities_venues', 'venues.id', '=', 'amenities_venues.venue')
      .join('amenities', 'amenities_venues.amenity', '=', 'amenities.id')
      .where('venues.id', venue_id)
      .groupBy('venues.venue_name', 'amenities.amenity_name');
  },
};

module.exports = VenuesService;
