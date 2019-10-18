const xss = require('xss');

const VenuesService = {
  getVenuesByCity(db, city, state, type) {
    return db
      .from('reviews')
      .select(
        'totspots_venues.venue_name',
        'totspots_venues.city',
        'totspots_venues.state',
        'totspots_venues.address',
        'totspots_venues.zipcode',
        'totspots_venues.venue_type',
        'totspots_venues.id'
      )
      .avg({ avgPrice: 'reviews.price' })
      .avg({ avgRating: 'reviews.starrating' })
      .avg({ avgVolume: 'reviews.volume' })
      .join('totspots_venues', 'reviews.venue_id', '=', 'totspots_venues.id')
      .where('totspots_venues.state', state)
      .andWhere('totspots_venues.city', city)
      .andWhere('totspots_venues.venue_type', type)
      .groupBy(
        'totspots_venues.venue_name',
        'totspots_venues.city',
        'totspots_venues.state',
        'totspots_venues.address',
        'totspots_venues.zipcode',
        'totspots_venues.venue_type',
        'totspots_venues.id'
      );
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
        'reviews.user_id',
        'usr.first_name',
        'usr.last_name'
      )
      .where('reviews.venue_id', venue_id)
      .join('totspots_users AS usr', 'reviews.user_id', 'usr.id')
      .groupBy('reviews.id', 'usr.id', 'usr.first_name', 'usr.last_name');
  },

  getAmenitiesByVenue(db, venue_id) {
    return db
      .from('totspots_venues')
      .select('totspots_venues.venue_name', 'totspots_amenities.amenity_name')
      .join(
        'amenities_venues',
        'totspots_venues.id',
        '=',
        'amenities_venues.venue'
      )
      .join(
        'totspots_amenities',
        'amenities_venues.amenity',
        '=',
        'totspots_amenities.id'
      )
      .where('totspots_venues.id', venue_id)
      .groupBy('totspots_venues.venue_name', 'totspots_amenities.amenity_name');
  },

  getProfile(db, id) {
    return db
      .from('totspots_users')
      .select(
        'totspots_users.username',
        'totspots_users.first_name',
        'totspots_users.last_name'
      )
      .join('reviews', 'totspots_users.id', '=', 'reviews.user_id')
      .where('totspots_users.id', id)
      .first()
      .groupBy(
        'totspots_users.username',
        'totspots_users.first_name',
        'totspots_users.last_name'
      );
  },

  getFavorites(db, id) {
    return db
      .from('totspots_users')
      .select(
        'totspots_venues.venue_name',
        'totspots_venues.city',
        'totspots_venues.state',
        'totspots_venues.address',
        'totspots_venues.zipcode',
        'totspots_venues.venue_type',
        'totspots_venues.id'
      )
      .join(
        'users_favorites',
        'totspots_users.id',
        '=',
        'users_favorites.user_id'
      )
      .join(
        'totspots_venues',
        'users_favorites.venue_id',
        '=',
        'totspots_venues.id'
      )
      .where('users_favorites.user_id', id)
      .groupBy(
        'totspots_venues.venue_name',
        'totspots_venues.city',
        'totspots_venues.state',
        'totspots_venues.address',
        'totspots_venues.zipcode',
        'totspots_venues.venue_type',
        'totspots_venues.id'
      );
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
      .join('totspots_users', 'reviews.user_id', '=', 'totspots_users.id')
      .where('totspots_users.id', id)
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

// getProfile(db, id) {
//   return db
//     .from('totspots_users')
//     .select(
//       'totspots_users.username',
//       'totspots_users.first_name',
//       'totspots_users.last_name',
//       'reviews.price',
//       'reviews.volume',
//       'reviews.starrating',
//       'reviews.content'
//     )
//     .join('reviews', 'totspots_users.id', '=', 'reviews.user_id')
//     .where('totspots_users.id', id)
//     .groupBy(
//       'totspots_users.username',
//       'totspots_users.first_name',
//       'totspots_users.last_name',
//       'reviews.price',
//       'reviews.volume',
//       'reviews.starrating',
//       'reviews.content'
//     );
// }
