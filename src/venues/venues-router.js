const express = require('express');
const VenuesService = require('./venues-service');
const path = require('path');
const xss = require('xss');
const VenuesRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const ReviewsService = require('../reviews/reviews-service');
const config = require('../config');
const axios = require('axios');
const https = require('https');
const { Console } = require('console');

async function checkVenue(req, res, next) {
  try {
    const venue = await VenuesService.getVenueById(
      req.app.get('db'),
      req.params.venueId
    );

    if (!venue)
      return res.status(404).json({
        error: `Venue doesn't exist`,
      });

    res.venue = venue;
    next();
  } catch (error) {
    next(error);
  }
}

async function checkSearch(req, res, next) {
  try {
    const venue = await VenuesService.getVenuesByCity(
      req.app.get('db'),
      req.params.city,
      req.params.state,
      req.params.type
    );

    if (!venue)
      return res.status(404).json({
        error: `Venue doesn't exist`,
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
  avgVolume: venue.avgVolume,
});

//To limit fetching, we are going to grab pretty much everything we have that matches the type, lat, lng, price. Filtering/sorting based on features, rating, etc  will happen on the client side. (Not a fan of this, but I'm not made of money.)

// ! for Page tokens: ?pagetoken=

VenuesRouter.route('/?').get(jsonBodyParser, async (req, res, next) => {
  try {
    let {
      type,
      lat,
      lng,
      tsFilterOpt,
      features,
      ratingOpt,
      priceOpt,
      token,
    } = req.query;

    //TODO: Refactor this base url to be in the configs
    let venueQuery = `${config.GOOGLE_BASE_URL}?key=${config.GKEY}`; //Base url

    //Handle all the params for talking to google. Maybe move this into it's own helper function when this is up and running.
    if (token) {
      venueQuery += `&pagetoken=${token}`;
    } else if (priceOpt) {
      console.log('filtering by price');
      venueQuery += `&location=${lat},${lng}&type=${type}&radius=2000&minprice=${priceOpt}`;
    } else {
      venueQuery += `&location=${lat},${lng}&type=${type}&radius=2000`;
    }

    let { data } = await axios.get(venueQuery);

    // TODO: Get the relevant info from postgres and match up with google
    console.log(data.results.length);
    res.json(data);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//Gets information to build the venue profile
VenuesRouter.route('/profile/:venueId')
  .all(checkVenue)
  .get((req, res, next) => {
    console.log(req.params);
    VenuesService.getVenueById(req.app.get('db'), req.params.venueId)
      .then(venue => {
        res.json(venue);
      })
      .catch(next);
  });

//Retrieves list of results for inital venue search
VenuesRouter.route('/:city/:state/:type')
  .all(checkSearch)
  .get((req, res, next) => {
    VenuesService.getVenuesByCity(
      req.app.get('db'),
      req.params.city,
      req.params.state,
      req.params.type
    )
      .then(venues => {
        res.json(venues.map(serializeVenue));
      })
      .catch(next);
  });

//Fetches the amenities for a specific venue
VenuesRouter.route('/:venueId/amenities')
  .all(checkVenue)
  .get((req, res, next) => {
    VenuesService.getAmenitiesByVenue(req.app.get('db'), req.params.venueId)
      .then(amenities => {
        res.json(amenities);
      })
      .catch(next);
  });

//Posts a new venue

//The venue, review, and reported amenities are passed in the request
//The information is split and directed to their respective tables in the DB.
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
      amenities,
    } = req.body;

    const newVenue = {
      venue_name,
      venue_type,
      address,
      city,
      state,
      zipcode,
      phone,
      url,
    };

    console.log(newVenue);

    const newReview = {
      content,
      price,
      volume,
      starrating,
    };

    const newAmenities = amenities;

    console.log(newAmenities);

    for (const [key, value] of Object.entries(newVenue))
      if (!value || value === null) {
        return res.status(400).json({ error: `Missing ${key} in request` });
      }

    for (const [key, value] of Object.entries(newReview))
      if (!value || value === null) {
        return res.status(400).json({ error: `Missing ${key} in request` });
      }

    newReview.user_id = req.user.id;

    if (!newReview.user_id) {
      return res.status(401).json({ error: 'Unauthorized Request' });
    }

    let venue = null;
    VenuesService.addVenue(req.app.get('db'), newVenue)
      .then(addVenue => {
        venue = addVenue;
        newReview.venue_id = venue.id;

        return ReviewsService.addReview(req.app.get('db'), newReview);
      })
      .then(() => {
        newAmenities.map(amenity => (amenity.venue = venue.id));
        return ReviewsService.addAmenities(req.app.get('db'), newAmenities);
      })
      .then(() => {
        console.log(venue);
        res.status(201).json(venue);
      })
      .catch(error => {
        next(`Problem adding venue. Please try again.`);
      });
  }
);

module.exports = VenuesRouter;
