const express = require('express');
const ReviewsService = require('./reviews-service');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const axios = require('axios');
const config = require('../config');

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

//! Obsolete?
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

//!Keep!
ReviewsRouter.route('/userReviews')
  .all(requireAuth)
  .get(async (req, res, next) => {
    try {
      let reviews = await ReviewsService.getUserReviews(req.app.get('db'), 1);

      //Got the reviews, now iterate and grab venue info.
      let requests = reviews.map(review => {
        let query = `${config.GOOGLE_DETAIL_URL}?place_id=${review.venueid}&fields=name,geometry,business_status,photo,type,url,vicinity&key=${config.GKEY}`;
        return axios.get(query);
      });

      let results = await Promise.all(requests);

      let venues = results.map(result => {
        return result.data;
      });

      //Hmm...
      let complete = reviews.map((review, idx) => {
        return { ...review, ...venues[idx] };
      });

      res.send(complete);
    } catch (err) {
      next(err);
    }
  });

//*Keep!
ReviewsRouter.route('/')
  .all(requireAuth)
  .post(jsonBodyParser, async (req, res, next) => {
    console.log('in the route');
    try {
      let { review } = req.body;
      //Required fields are volume and rating.
      if (!review.totspots_rating || !review.volume_rating) {
        return res
          .status(400)
          .json({ error: `Rating and volume level are required` });
      }

      console.log(review);

      const { amenities, venueId, ...newReview } = review; //Cool destructuring!

      newReview.user_id = req.user.id;
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

      let [id] = await Promise.all(dbInserts);

      let result = await ReviewsService.getNewReview(req.app.get('db'), id);

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
