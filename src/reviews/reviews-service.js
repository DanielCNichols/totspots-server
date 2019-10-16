//Add review, delete review, edit review (yikes), get reviews. Votes?
const xss = require('xss');

const ReviewsService = {
  addReview(db, newReview) {
    return db
      .insert(newReview)
      .into('reviews')
      .returning('*')
      .then(([Review]) => Review);
  },

  addAmenities(db, amenities, venueId) {
    return db
      .insert(amenities)
      .into('amenities_venues')
      .returning('*')
      .then(([amenities]) => amenities);
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

  getReviewsByVenue(db, Review_id) {
    return db
      .from('reviews')
      .select(
        'reviews.id',
        'reviews.content',
        'reviews.price',
        'reviews.starrating',
        'reviews.volume',
        'reviews.date_created',
        'reviews.Review_id',
        'reviews.user_id'
      )
      .where('reviews.Review_id', Review_id)
      .join('totspots_users AS usr', 'reviews.user_id', 'usr.id')
      .groupBy('reviews.id', 'usr.id');
  },

  postVotes(db, newVote) {
    console.log('posting votes');
    return db
      .insert(newVote)
      .into('votes')
      .returning('*')
      .then(([vote]) => vote);
  }
};

module.exports = ReviewsService;
