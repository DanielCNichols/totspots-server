const express = require('express');
const ReviewsService = require('./reviews-service');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');

const ReviewsRouter = express.Router();
const jsonBodyParser = express.json();

async function checkReview(req, res, next) {
  try {
    const review = await ReviewsService.getReviewById(
      req.app.get('db'),
      req.params.reviewId
    );

    if (!review)
      return res.status(404).json({
        error: `Review doesn't exist`,
      });

    res.review = review;
    next();
  } catch (error) {
    next(error);
  }
}

//Retrieves and posts votes for reviews.
//Requires a review id.
ReviewsRouter.route('/:reviewId/votes')
  .all(checkReview)
  .get((req, res, next) => {
    ReviewsService.getVotesByReview(req.app.get('db'), req.params.reviewId)
      .then(votes => {
        res.json(votes);
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { votestatus, review_id } = req.body;
    const newVote = { votestatus, review_id };

    newVote.user_id = req.user.id;

    ReviewsService.postVotes(req.app.get('db'), newVote)
      .then(vote => {
        res.status(201).json(vote);
      })
      .catch(next);
  });

//Gathers the user's review history to populate the user profile page.
ReviewsRouter.route('/userReviews')
  .all(requireAuth)
  .get(requireAuth, (req, res, next) => {
    ReviewsService.getUserReviews(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(next);
  });

ReviewsRouter.route('/')
  // .all(requireAuth)
  .post(jsonBodyParser, async (req, res, next) => {
    try {
      let { review } = req.body;
      console.log('here');

      //Required fields are volume and rating.
      if (!review.totspots_rating || !review.volume_rating) {
        return res
          .status(400)
          .json({ error: `Rating and volume level are required` });
      }

      const { amenities, venueId, ...newReview } = review; //Cool destructuring!

      // newReview.user_id = req.user.id;
      newReview.user_id = 1;
      newReview.venueid = venueId;

      // add the venueId to each of the amenities before inserting
      let amenitiesToInsert = amenities.map(amenity => {
        return { venueid: venueId, amenity: amenity };
      });

      // Handle it at one time..
      let dbInserts = [
        ReviewsService.addReview(req.app.get('db'), newReview),
        ReviewsService.addAmenities(req.app.get('db'), amenitiesToInsert),
      ];

      let result = await Promise.all(dbInserts);

      res.send(result);
    } catch (err) {
      next(err);
    }
  })
  .delete(jsonBodyParser, async (req, res, next) => {
    try {
      let { id } = req.body;
      //Todo: Need to check to see if the review actually exists!
      await ReviewsService.deleteReview(req.app.get('db'), id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    try {
      let { review } = req.body;

      if (!review.totspots_rating || !review.volume_rating) {
        return res
          .status(400)
          .json({ error: 'Rating and volume level are required' });
      }

      let updated = await ReviewsService.updateReview(
        req.app.get('db'),
        review.id,
        review
      );

      res.send(updated);
    } catch (err) {
      next(err);
    }
  });

module.exports = ReviewsRouter;
