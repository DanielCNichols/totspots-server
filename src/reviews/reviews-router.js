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

ReviewsRouter.route('/:venueId').post(
  requireAuth,
  jsonBodyParser,
  async (req, res, next) => {
    try {
      let { review } = req.body;
      let { venueId } = req.params;

      //Required fields are volume and rating.
      if (!review.totspots_rating || !review.volume_rating) {
        return res
          .status(400)
          .json({ error: `Rating and volume level are required` });
      }

      const { amenities, ...newReview } = review; //Cool destructuring!
      console.log(newReview);

      newReview.userId = req.user.id;
      newReview.venueid = venueId;

      let amenitiesToInsert = amenities.map(amenity => {
        return { venueid: venueId, amenity: amenity };
      });

      //Handle it at one time..

      console.log(amenitiesToInsert);
      let dbInserts = [
        ReviewsService.addReview(req.app.get('db'), newReview),
        ReviewsService.addAmenities(req.app.get('db'), amenitiesToInsert),
      ];

      let result = await Promise.all(dbInserts);

      res.send(result);
    } catch (err) {
      next(err);
    }
  }
);

//delete/edit reviews
ReviewsRouter.route('/users/venues/:reviewId')
  .all(checkReview)
  .get((req, res, next) => {
    ReviewsService.getReviewById(req.app.get('db'), req.params.reviewId)
      .then(reviews => {
        res.json(reviews);
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    ReviewsService.deleteReview(req.app.get('db'), req.params.reviewId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { content, starrating, price, volume } = req.body;
    const updatedReview = { content, starrating, price, volume };

    const numberOfValues = Object.values(updatedReview).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request must contain content, rating, price, or volume`,
        },
      });
    }

    ReviewsService.updateReview(
      req.app.get('db'),
      req.params.reviewId,
      updatedReview
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = ReviewsRouter;
