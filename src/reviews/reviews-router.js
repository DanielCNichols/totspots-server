const express = require('express');
const ReviewsService = require('./reviews-service');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');

const ReviewsRouter = express.Router();
const jsonBodyParser = express.json();

//Get reviewsBy venue
ReviewsRouter.route('/venues/:venueId/').get((req, res) => {
  ReviewsService.getReviewsByVenue(req.app.get('db'), req.params.venueId).then(
    reviews => {
      res.json(reviews);
    }
  );
});

ReviewsRouter.route('/:reviewId/votes')
  .get((req, res, next) => {
    ReviewsService.getVotesByReview(req.app.get('db'), req.params.reviewId).then(
      votes => {
        res.json(votes);
      }
    );
  })
  .post(
    requireAuth,
    jsonBodyParser,
    (req, res, next) => {
      console.log('handling votes on the server');
      const { votestatus, review_id } = req.body;
      const newVote = { votestatus, review_id };

      //Do ur checkz

      newVote.user_id = req.user.id;
      ReviewsService.postVotes(req.app.get('db'), newVote)
        .then(vote => {
          res.status(201).json(vote);
        })
        .catch(next);
    }
  );

ReviewsRouter.route('/userReviews')
  .all(requireAuth)
  .get(requireAuth, (req, res, next) => {
    ReviewsService.getUserReviews(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(err => {
        console.log('Account error', err);
        next(err);
      });
  });

ReviewsRouter.route('/:venueId')
  // .all(requireAuth)
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    console.log('reviews/venueId');
    //Try to clean this up.
    const {
      venue_id,
      content,
      price,
      volume,
      starrating,
      amenities
    } = req.body;
    const newReview = {
      venue_id,
      content,
      price,
      volume,
      starrating
    };

    for (const [key, value] of Object.entries(newReview))
      if (value === null) {
        return res.status(400).json({ error: `Missing ${key} in request` });
      }

    newReview.user_id = req.user.id;

    ReviewsService.addReview(req.app.get('db'), newReview).then(review => {
      ReviewsService.addAmenities(req.app.get('db'), amenities)
        .then(() => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${review.id}`))
            .json(ReviewsService.serializeReview(review));
        })
        .catch(next);
    });
  });

//MOVE TO USERS FOR THE LOVE OF GOD.
ReviewsRouter.route('/users/venues/:reviewId')
  .get((req, res, next) => {
    console.log('hitting /:reviewID route');
    ReviewsService.getReviewById(req.app.get('db'), req.params.reviewId)
      .then(reviews => {
        res.json(reviews);
      })
      .catch(next);
  })

  .delete((req, res, next) => {
    console.log('hitting delete route');
    ReviewsService.deleteReview(req.app.get('db'), req.params.reviewId)
      .then(numRowsAffected => {
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
          message: `Request must contain content, rating, price, or volume`
        }
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
