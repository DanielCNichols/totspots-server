const bcrypt = require('bcrypt');
const xss = require('xss');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
  hasUserWithUserName(db, username) {
    console.log('checking username');
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hasUserWithEmail(db, email) {
    console.log('checking email');
    return db('users')
      .where({ email })
      .first()
      .then(user => !!user);
  },

  validatePassword(password) {
    console.log('validating');
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if (
      password.startsWith(' ') ||
      password.endsWith(' ') ||
      password.includes(' ')
    ) {
      return 'Password must not contain spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },

  hashPassword(password) {
    console.log('hashing');
    return bcrypt.hash(password, 12);
  },

  serializeUser(user) {
    console.log('serializeing');
    return {
      id: user.id,
      username: xss(user.username),
      email: xss(user.email),
    };
  },

  insertUser(db, newUser) {
    console.log('inserting');
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([users]) => users);
  },

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
