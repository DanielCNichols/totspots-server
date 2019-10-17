const express = require('express');
const ReviewsService = require('./reviews-service');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');

const ReviewsRouter = express.Router();
const jsonBodyParser = express.json();

//Only need to get the review for the current displayed venues....?
//This works... but only displays for one venue at a time. Works, but maybe not the best.
ReviewsRouter.route('/reviews/:venueId').get((req, res) => {
  ReviewsService.getReviewsByVenue(req.app.get('db'), req.params.venueId).then(
    reviews => {
      console.log('we should see reviews');
      console.log(reviews);
      res.json(reviews);
    }
  );
});

ReviewsRouter.route('/:reviewId/votes').post(
  jsonBodyParser,
  (req, res, next) => {
    console.log('handling votes on the server');
    const { votestatus, review_id, user_id } = req.body;
    const newVote = { votestatus, review_id, user_id };
    ReviewsService.postVotes(req.app.get('db'), newVote)
      .then(vote => {
        res.status(201).json(vote);
      })
      .catch(next);
  }
);

ReviewsRouter.route('/:venueId')
  // .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    console.log('reviews/venueId');
    //Try to clean this up.
    const {
      venue_id,
      content,
      price,
      volume,
      starrating,
      user_id,
      amenities
    } = req.body;
    const newReview = {
      venue_id,
      content,
      price,
      volume,
      starrating,
      user_id
    };

    for (const [key, value] of Object.entries(newReview))
      if (value === null) {
        return res.status(400).json({ error: `Missing ${key} in request` });
      }

    console.log(amenities);

    //iSSUE HERE WITH SYNTAX

    ReviewsService.addReview(req.app.get('db'), newReview).then(review => {
      ReviewsService.addAmenities(req.app.get('db'), amenities)
        .then(amenity => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${review.id}`))
            .json(ReviewsService.serializeReview(review));
        })
        .catch(next);
    });
  });

module.exports = ReviewsRouter;
