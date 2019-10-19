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
      .join('reviews', 'venues.id', '=', 'reviews.venue_id')
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

  addFavorite(db, newFavorite) {
    return db
      .insert(newFavorite)
      .into('users_favorites')
      .returning('*')
      .then(([favorite]) => favorite);
  },

  deleteFavorite(db, delFav) {
    console.log(delFav.user_id);
    return db('users_favorites')
      .where('users_favorites.user_id', delFav.user_id)
      .andWhere('users_favorites.venue_id', delFav.venue_id)
      .delete();
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
      .join('users AS usr', 'reviews.user_id', 'usr.id')
      .groupBy('reviews.id', 'usr.id', 'usr.first_name', 'usr.last_name');
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

  getProfile(db, id) {
    return db
      .from('users')
      .select('users.username', 'users.first_name', 'users.last_name')
      .join('reviews', 'users.id', '=', 'reviews.user_id')
      .where('users.id', id)
      .first()
      .groupBy('users.username', 'users.first_name', 'users.last_name');
  },

  getFavorites(db, id) {
    return db
      .from('users')
      .select(
        'venues.venue_name',
        'venues.city',
        'venues.state',
        'venues.address',
        'venues.zipcode',
        'venues.venue_type',
        'venues.id'
      )
      .join('users_favorites', 'users.id', '=', 'users_favorites.user_id')
      .join('venues', 'users_favorites.venue_id', '=', 'venues.id')
      .where('users_favorites.user_id', id)
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
