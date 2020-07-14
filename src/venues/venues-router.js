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
const { promises } = require('fs');

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

// ! for Page tokens: ?pagetoken=

//1. Handle the initial call to google (deals with price filtering and next_page)
//2. Take google's response (20 items) and filter it out based on user filters.
//3. After we have finished filtering google's data, if there is a remainder, get the TS data for them and append to the entry in the google response
//4. If not, return an empty results array
// http://localhost:3000/results/search?type=bar&lat=35.9940329&lng=-78.898619
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

    let venueQuery = `${config.GOOGLE_BASE_URL}?key=${config.GKEY}`; //Base url

    if (token) {
      venueQuery += `&pagetoken=${token}`;
    } else if (priceOpt) {
      console.log('filtering by price');
      venueQuery += `&location=${lat},${lng}&type=${type}&radius=2000&minprice=${priceOpt}`;
    } else {
      venueQuery += `&location=${lat},${lng}&type=${type}&radius=2000`;
    }

    let { data } = await axios.get(venueQuery);

    let dbQueries = data.results.map(async entry => {
      let tsAverages = await VenuesService.getAverages(
        req.app.get('db'),
        entry.id
      );
      let tsReviews = await VenuesService.getReviewsByVenue(
        req.app.get('db'),
        entry.id
      );
      let tsAmenities = await VenuesService.getAmenitiesByVenue(
        req.app.get('db'),
        entry.id
      );

      return { ...entry, tsData: { tsAverages, tsReviews, tsAmenities } };
    });

    data.results = await Promise.all(dbQueries);
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

// let id = '0f5502f218f8da928bd697801a0ae6f0f6e3beab';
