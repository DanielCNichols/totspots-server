const xss = require('xss');

const VenuesService = {
  getVenuesByCity(db, city, state, type) {
    return db
      .from('totspots_venues')
      .select('*')
      .where('totspots_venues.state', state)
      .andWhere('totspots_venues.city', city)
      .andWhere('totspots_venues.venue_type', type);
  },

  addVenue(db, newVenue) {
    return db
      .insert(newVenue)
      .into('totspots_venues')
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

  getReviewsByVenue(db, venue_id) {
    return db
      .from('reviews')
      .select(
        'reviews.id',
        'reviews.content',
        'reviews.price',
        'reviews.starrating',
        'reviews.volume',
        'reviews.date_created',
        'reviews.venue_id',
        'reviews.user_id'
      )
      .where('reviews.venue_id', venue_id)
      .join('totspots_users AS usr', 'reviews.user_id', 'usr.id')
      .groupBy('reviews.id', 'usr.id');
  }
};

module.exports = VenuesService;
