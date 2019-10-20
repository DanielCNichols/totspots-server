const express = require('express');
const ReviewsService = require('./reviews-service');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');

const ReviewsRouter = express.Router();
const jsonBodyParser = express.json();

//Only need to get the review for the current displayed venues....?
// //This works... but only displays for one venue at a time. Works, but maybe not the best.
// ReviewsRouter.route('/reviews/:venueId').get((req, res) => {
//   ReviewsService.getReviewsByVenue(req.app.get('db'), req.params.venueId).then(
//     reviews => {
//       console.log('we should see reviews');
//       console.log(reviews);
//       res.json(reviews);
//     }
//   );
// });


//CANT SEND THE USER ID LIKE THIS!
ReviewsRouter.route('/:reviewId/votes').post(
  requireAuth, jsonBodyParser,
  (req, res, next) => {
    console.log('handling votes on the server');
    const { votestatus, review_id,} = req.body;
    const newVote = { votestatus, review_id};

    //Do ur checkz

    newVote.user_id = req.user.id;
    ReviewsService.postVotes(req.app.get('db'), newVote)
      .then(vote => {
        res.status(201).json(vote);
      })
      .catch(next);
  }

  //Patch and get forthcoming.... get shouldn't be protected...
);

//CANT SEND THE USER ID LIKE THIS!!!
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
      starrating,
    };

    for (const [key, value] of Object.entries(newReview))
      if (value === null) {
        return res.status(400).json({ error: `Missing ${key} in request` });
      }

      newReview.user_id = req.user.id;

    console.log(amenities);

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

ReviewsRouter.route('/:reviewId')
//THIS IS SENDING THE USER_ID WITH THE REVIEW (TO BE EDITED)... ???
  .get((req, res, next) => {
    ReviewsService.getReviewsById(req.app.get('db'), req.params.reviewId).then(
      reviews => {
        res.json(reviews);
      }
    );
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
    console.log(updatedReview)
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
