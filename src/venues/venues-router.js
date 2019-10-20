const express = require('express');
const VenuesService = require('./venues-service');
const path = require('path');
const VenuesRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const ReviewsService = require('../reviews/reviews-service');

VenuesRouter.route('/:city/:state/:type').get((req, res) => {
  console.log('hits router');
  VenuesService.getVenuesByCity(
    req.app.get('db'),
    req.params.city,
    req.params.state,
    req.params.type
  ).then(venues => {
    res.json(venues);
  });
});

VenuesRouter.route('/:venueId/reviews').get((req, res) => {
  VenuesService.getReviewsByVenue(req.app.get('db'), req.params.venueId).then(
    reviews => {
      res.json(reviews);
    }
  );
});

VenuesRouter.route('/:venueId/amenities').get((req, res) => {
  VenuesService.getAmenitiesByVenue(req.app.get('db'), req.params.venueId).then(
    amenities => {
      res.json(amenities);
    }
  );
});

VenuesRouter.route('/account')
  .get(requireAuth, (req, res, next) => {
    VenuesService.getProfile(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(err => {
        console.log('Account error', err);
        next(err);
      });
  });



VenuesRouter.route('/favorites')
  // .all(requireAuth)
  .get(requireAuth, (req, res, next) => {
    VenuesService.getFavorites(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(err => {
        console.log('Account error', err);
        next(err);
      });
  })

  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    console.log('WE ARE CONSOLE LOGGING THE BODY HERE');
    console.log(req.body);
    const { venue_id } = req.body;
    const newFavorite = { venue_id };

    //check for validation here

    //add user id from authtoken

    newFavorite.user_id = req.user.id;
    VenuesService.addFavorite(req.app.get('db'), newFavorite)
      .then(favorite => {
        console.log('eyyyyyyy!');
        res.json(favorite);
      })
      .catch(err => {
        console.log('Favorties error', err);
        next(err);
      });
  })
  .delete(requireAuth, jsonBodyParser, (req, res, next) => {
    const { venue_id } = req.body;
    const delFav = {venue_id };

    //MACHEN SOME VALIDATION HERE!

    //SET THE user...

    delFav.user_id = req.user.id;
    VenuesService.deleteFavorite(req.app.get('db'), delFav)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

VenuesRouter.route('/userReviews')
  .all(requireAuth)
  .get(requireAuth, (req, res, next) => {
    VenuesService.getUserReviews(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(err => {
        console.log('Account error', err);
        next(err);
      });
  });



VenuesRouter.route('/addVenue').post(requireAuth, jsonBodyParser, (req, res, next) => {
  let newvenue;
  const {
    venue_name,
    venue_type,
    address,
    city,
    state,
    zipcode,
    content,
    price,
    volume,
    starrating,
    amenities
  } = req.body;
  console.log(amenities);
  const newVenue = { venue_name, venue_type, address, city, state, zipcode };
  const newReview = { content, price, volume, starrating};
  const newAmenities = amenities;

  for (const [key, value] of Object.entries(newVenue))
    if (value === null) {
      return res.status(400).json({ error: `Missing ${key} in request` });
    }


  VenuesService.addVenue(req.app.get('db'), newVenue).then(venue => {
    console.log(venue);
    // res
    //   .status(201)
    //   .location(path.posix.join(req.originalUrl, `/${venue.id}`))
    //   .json(VenuesService.serializeVenue(venue));
    const newReview = {
      venue_id: venue.id,
      content,
      price,
      volume,
      starrating,
    };

    // DO A CHECK HRERE

    //set the id
    newReview.user_id = req.user.id;
    ReviewsService.addReview(req.app.get('db'), newReview).then(review => {
      console.log(`THIS IS VENUE AT 116 ${venue}`);
    });
    newAmenities.map(amenity => (amenity.venue = venue.id));
    ReviewsService.addAmenities(req.app.get('db'), newAmenities).then(venue =>
      console.log(venue)
    );
  });
});


module.exports = VenuesRouter;
