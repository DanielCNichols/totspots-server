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

//! take a look at this one
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

//!
// const serializeVenue = venue => ({
//   id: xss(venue.id),
//   venue_name: xss(venue.venue_name),
//   venue_type: xss(venue.venue_type),
//   address: xss(venue.address),
//   city: xss(venue.city),
//   state: xss(venue.state),
//   zipcode: xss(venue.zipcode),
//   phone: xss(venue.phone),
//   url: xss(venue.url),
//   avgRating: venue.avgRating,
//   avgPrice: venue.avgPrice,
//   avgVolume: venue.avgVolume,
// });

VenuesRouter.route('/?').get(async (req, res, next) => {
  try {
    let {
      type,
      lat,
      lng,
      tsRatingOpt,
      googleRatingOpt,
      features,
      priceOpt,
      token,
    } = req.query;

    let venueQuery = `${config.GOOGLE_BASE_URL}?key=${config.GKEY}`; //Base url

    //ToDO: Refactor this into a helper function and use the URLSearchParams().
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

    if (tsRatingOpt) {
      console.log(typeof tsRatingOpt); //string
      data.results = data.results.filter(
        venue => venue.tsData.tsAverages.avgrating >= tsRatingOpt
      );
    }

    if (googleRatingOpt) {
      data.results = data.results.filter(
        venue => venue.rating >= googleRatingOpt
      );
    }

    //TODO: I think this can be cleaned up and abstracted away.
    if (features) {
      let requestedFeatures = features.split(',');
      data.results = data.results.filter(venue => {
        let venueFeatures = [];
        venue.tsData.tsAmenities.forEach(feature => {
          venueFeatures = [...venueFeatures, ...Object.values(feature)];
          console.log('these are the venue features', venueFeatures);
        });

        return featuresChecker(requestedFeatures, venueFeatures) !== false;
      });
    }

    res.json(data);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

function featuresChecker(requested, actual) {
  for (let i = 0; i < requested.length; i++) {
    if (!actual.includes(requested[i])) {
      return false;
    }
  }
  return true;
}

//Gets information to build the venue profile
VenuesRouter.route('/:placeId').get(async (req, res, next) => {
  try {
    let { placeId } = req.params;
    let venueQuery = `${config.GOOGLE_DETAIL_URL}?place_id=${placeId}&fields=name,formatted_address,id,geometry,name,photo,place_id,type,url,vicinity,formatted_phone_number,opening_hours,website,price_level,rating,review,user_ratings_total&key=${config.GKEY}`;

    let { data } = await axios.get(venueQuery);

    let dbQueries = [
      VenuesService.getAmenitiesByVenue(
        req.app.get('db'),
        data.result.place_id
      ),
      VenuesService.getReviewsAndVotes(req.app.get('db'), data.result.place_id),
      VenuesService.getAverages(req.app.get('db'), data.result.place_id),
    ];

    let [amenities, tsReviews, tsAverages] = await Promise.all(dbQueries);

    data.amenities = amenities;
    data.tsReviews = tsReviews;
    data.tsAverages = tsAverages;

    res.send(data);
  } catch (error) {
    next(error);
  }
});

//! This is going to be obsolete, most likely.
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

//! Largely obsolete.
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
