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

  //! This will be used as the initial query for the results page. We will be getting a list of venes from google based on their type.
  //! We need to get each vene's reviews:[] by their googleId (we can store this as a reference).
  //! If no totspots user review, return an empty array.

  //!This query will get the average rating for a venue.
  //!Need to add amenities and reviews
  getAverages(db, id) {
    return db
      .from('venues')
      .select(
        db.raw('ROUND(AVG(reviews.totspots_rating)) as avgRating'),
        db.raw('ROUND(AVG(reviews.volume_rating)) as avgVolume')
      )
      .leftJoin('reviews', 'venues.venue_id', '=', 'reviews.venueid')
      .where('venues.venue_id', id)
      .first();
  },

  //!...not happy doing it this way, but it might work. Try to do this in one query.
  getReviewsByVenue(db, id) {
    return db
      .from('reviews')
      .select('*')
      .where('reviews.venueid', id);
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

  //! updating this to grab appropriate fields
  getAmenitiesByVenue(db, venue_id) {
    return db
      .from('venues')
      .select('amenities.amenity_name', 'amenities.id')
      .join(
        'amenities_venues',
        'venues.venue_id',
        '=',
        'amenities_venues.venueid'
      )
      .join('amenities', 'amenities_venues.amenity', '=', 'amenities.id')
      .where('venues.venue_id', venue_id)
      .groupBy('amenities.amenity_name', 'amenities.id');
  },
};

module.exports = VenuesService;
