const xss = require('xss');

const VenuesService = {
  getVenuesByCity(db, city, state, type) {
    return db
      .from('venues')
      .select(
        'venues.venue_name',
        'venues.city',
        'venues.state',
        'venues.address',
        'venues.zipcode',
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
        'venues.id'
      );
  },

  addVenue(db, newVenue) {
    return db
      .insert(newVenue)
      .into('venues')
      .returning('*')
      .then(([venue]) => venue);
  },


  serializeVenue(newVenue) {
    return {
      id: newVenue.id,
      venue_name: xss(newVenue.venue_name),
      venue_type: xss(newVenue.venue_type),
      address: xss(newVenue.address),
      city: xss(newVenue.city),
      state: xss(newVenue.state),
      zipcode: xss(newVenue.zipcode)
    };
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


  getUserReviews(db, id) {
    return db
      .from('reviews')
      .select(
        'reviews.id',
        'reviews.content',
        'reviews.price',
        'reviews.starrating',
        'reviews.volume',
        'reviews.date_created',
        'reviews.venue_id'
      )
      .join('users', 'reviews.user_id', '=', 'users.id')
      .where('users.id', id)
      .groupBy(
        'reviews.id',
        'reviews.content',
        'reviews.price',
        'reviews.starrating',
        'reviews.volume',
        'reviews.date_created',
        'reviews.venue_id'
      );
  }
};

module.exports = VenuesService;
