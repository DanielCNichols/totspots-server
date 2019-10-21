const xss = require('xss');

const UserService = {
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

  getProfile(db, id) {
    return (
      db
        .from('users')
        .select('users.username', 'users.first_name', 'users.last_name')
        // .join('reviews', 'users.id', '=', 'reviews.user_id')
        .where('users.id', id)
        .first()
        .groupBy('users.username', 'users.first_name', 'users.last_name')
    );
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

module.exports = UserService;
