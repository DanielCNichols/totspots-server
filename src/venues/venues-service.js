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

  //!This gets the reviews for a specific venue

  getReviewsAndVotes(db, venue_id) {
    return db
      .from('reviews')
      .select(
        'reviews.id',
        'reviews.content',
        'reviews.totspots_rating',
        'reviews.volume_rating',
        'reviews.date_created',
        'reviews.venueid',
        'reviews.user_id',
        'usr.first_name',
        'usr.last_name'
      )
      .count('votes.votestatus')
      .where('reviews.venueid', venue_id)
      .leftJoin('users AS usr', 'reviews.user_id', 'usr.id')
      .leftJoin('votes', 'reviews.id', 'votes.review_id')
      .groupBy('reviews.id', 'usr.id', 'usr.first_name', 'usr.last_name');
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

  getFavorite(db, user_id, venueid) {
    console.log('getting favorite');
    return db
      .from('favorites')
      .select('*')
      .where('favorites.user_id', user_id)
      .andWhere('favorites.venueid', venueid)
      .first();
  },

  getVoteStatus(db, user_id, reviewId) {
    console.log('getting votes');
    console.log(typeof user_id, typeof reviewId);
    return db
      .from('votes')
      .select('votes.votestatus')
      .where('votes.user_id', '=', user_id)
      .andWhere('votes.review_id', '=', reviewId)
      .first();
  },
};

module.exports = VenuesService;
