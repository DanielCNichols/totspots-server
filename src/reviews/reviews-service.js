//Add review, delete review, edit review (yikes), get reviews. Votes?
const xss = require('xss');

const ReviewsService = {
  getReviewById(db, reviewId) {
    return db
      .from('reviews')
      .select('*')
      .where('reviews.id', reviewId)
      .first();
  },

  addReview(db, newReview) {
    return db
      .insert(newReview)
      .into('reviews')
      .returning('*')
      .then(([Review]) => Review);
  },

  addAmenities(db, amenities) {
    return db
      .insert(amenities)
      .into('amenities_venues')
      .returning('*');
  },

  serializeReview(newReview) {
    return {
      id: newReview.id,
      venue_id: newReview.venue_id,
      content: xss(newReview.content),
      price: xss(newReview.price),
      volume: xss(newReview.volume),
      starrating: xss(newReview.starrating),
      user_id: xss(newReview.user_id)
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
      .count('votes.votestatus')
      .where('reviews.venue_id', venue_id)
      .leftJoin('users AS usr', 'reviews.user_id', 'usr.id')
      .leftJoin('votes', 'reviews.id', 'votes.review_id')
      .groupBy('reviews.id', 'usr.id', 'usr.first_name', 'usr.last_name');
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
        'venues.venue_name'
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
        'venues.venue_name'
      );
  },

  getVotesByReview(db, reviewId) {
    return db
      .count('votestatus')
      .from('votes')
      .where('votes.votestatus', 'true')
      .andWhere('votes.review_id', reviewId)
      .groupBy('votes.votestatus');
  },


  postVotes(db, newVote) {
    return db
      .insert(newVote)
      .into('votes')
      .returning('*')
      .then(([vote]) => vote);
  },

  deleteReview(db, id) {
    return db('reviews')
      .where({ id })
      .delete();
  },

  updateReview(db, id, updatedReview) {
    return db('reviews')
      .where({ id })
      .update(updatedReview);
  }
};

module.exports = ReviewsService;
