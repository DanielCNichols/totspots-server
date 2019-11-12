const UserService = {
  addFavorite(db, newFavorite) {
    return db
      .insert(newFavorite)
      .into('users_favorites')
      .returning('*')
      .then(([favorite]) => favorite);
  },

  deleteFavorite(db, delFav) {
    return db('users_favorites')
      .where('users_favorites.user_id', delFav.user_id)
      .andWhere('users_favorites.venue_id', delFav.venue_id)
      .delete();
  },

  getProfile(db, id) {
    return db
      .from('users')
      .select(
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.city',
        'users.state',
        'users.email'
      )
      .where('users.id', id)
      .first()
      .groupBy(
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.city',
        'users.state',
        'users.email'
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
        'venues.id',
        'venues.url',
        'venues.phone'
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
        'venues.id',
        'venues.url',
        'venues.phone'
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
        'reviews.venue_id',
        'venue.venue_name'
      )
      .join('users', 'reviews.user_id', '=', 'users.id')
      .join('venues', 'reviews.venue_id', '=', 'venues.id')
      .where('users.id', id)
      .groupBy(
        'reviews.id',
        'reviews.content',
        'reviews.price',
        'reviews.starrating',
        'reviews.volume',
        'reviews.date_created',
        'reviews.venue_id',
        'venue.venue_name'
      );
  },
};

module.exports = UserService;
