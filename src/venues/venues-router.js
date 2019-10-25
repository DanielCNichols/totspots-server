const express = require('express');
const VenuesService = require('./venues-service');
const path = require('path');
const xss = require('xss');
const VenuesRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const ReviewsService = require('../reviews/reviews-service');

async function checkVenue(req, res, next) {
  try {
    const venue = await VenuesService.getVenueById(
      req.app.get('db'),
      req.params.venueId
    );

    if (!venue)
      return res.status(404).json({
        error: `Venue doesn't exist`
      });

    res.venue = venue;
    next();
  } catch (error) {
    next(error);
  }
}

const serializeVenue = venue => ({
  id: xss(venue.id),
  venue_name: xss(venue.venue_name),
  venue_type: xss(venue.venue_type),
  address: xss(venue.address),
  city: xss(venue.city),
  state: xss(venue.state),
  zipcode: xss(venue.zipcode),
  phone: xss(venue.phone),
  url: xss(venue.url),
  avgRating: venue.avgRating,
  avgPrice: venue.avgPrice,
  avgVolume: venue.avgVolume
});

VenuesRouter.route('/:city/:state/:type').get((req, res) => {
  VenuesService.getVenuesByCity(
    req.app.get('db'),
    req.params.city,
    req.params.state,
    req.params.type
  ).then(venues => {
    res.json(venues.map(serializeVenue));
  });
});

VenuesRouter.route('/:venueId/amenities')
  .all(checkVenue)
  .get((req, res) => {
    VenuesService.getAmenitiesByVenue(
      req.app.get('db'),
      req.params.venueId
    ).then(amenities => {
      res.json(amenities);
    });
  });

VenuesRouter.route('/addVenue').post(
  requireAuth,
  jsonBodyParser,
  (req, res, next) => {
    const {
      venue_name,
      venue_type,
      address,
      city,
      state,
      zipcode,
      content,
      phone,
      url,
      price,
      volume,
      starrating,
      amenities
    } = req.body;

    const newVenue = {
      venue_name,
      venue_type,
      address,
      city,
      state,
      zipcode,
      phone,
      url
    };

    const newReview = {
      content,
      price,
      volume,
      starrating
    };
    const newAmenities = amenities;

    for (const [key, value] of Object.entries(newVenue))
      if (!value || value === null) {
        return res.status(400).json({ error: `Missing ${key} in request` });
      }


    for (const [key, value] of Object.entries(newReview))
      if (!value || value === null) {
        return res
          .status(400)
          .json({ error: `Missing ${key} in request` });
      }


    newReview.user_id = req.user.id;


    if (!newReview.user_id) {
      return res.status(401).json({ error: 'Unauthorized Request' });
    }


    let venue = null;
    VenuesService.addVenue(req.app.get('db'), newVenue)
      .then(MyVenue => {
        venue = MyVenue;
        newReview.venue_id = venue.id;

        return ReviewsService.addReview(req.app.get('db'), newReview);
      })
      .then(() => {
        newAmenities.map(amenity => (amenity.venue = venue.id));
        return ReviewsService.addAmenities(req.app.get('db'), newAmenities);
      })
      .then(() => {
        res.status(201).json(venue);
      })
      .catch(error => {
        next(error);
      });
  }
);

module.exports = VenuesRouter;
