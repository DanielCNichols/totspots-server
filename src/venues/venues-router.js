const express = require('express');
const VenuesService = require('./venues-service');
const path = require('path');
const xss = require('xss');
const VenuesRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth, checkedLoggedIn } = require('../middleware/jwt-auth');
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

    console.log(venueQuery);

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
    console.log(data);

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
VenuesRouter.route('/:placeId')
  .all(checkedLoggedIn)
  .get(async (req, res, next) => {
    try {
      let { placeId } = req.params;
      let venueQuery = `${config.GOOGLE_DETAIL_URL}?place_id=${placeId}&fields=name,formatted_address,id,geometry,name,photo,place_id,type,url,vicinity,formatted_phone_number,opening_hours,website,price_level,rating,review,user_ratings_total&key=${config.GKEY}`;

      let { data } = await axios.get(venueQuery);

      //Want to check if the user is logged in, and if so, we need to get the id for the favorite.

      let dbQueries = [
        VenuesService.getAmenitiesByVenue(
          req.app.get('db'),
          data.result.place_id
        ),
        VenuesService.getReviewsAndVotes(
          req.app.get('db'),
          data.result.place_id
        ),
        VenuesService.getAverages(req.app.get('db'), data.result.place_id),
      ];

      req.user
        ? dbQueries.push(
            VenuesService.getFavorite(
              req.app.get('db'),
              req.user.id,
              data.result.place_id
            )
          )
        : null;

      let [amenities, tsReviews, tsAverages, favorite] = await Promise.all(
        dbQueries
      );

      if (req.user) {
        let voteQueries = tsReviews.map(review => {
          return VenuesService.getVoteStatus(
            req.app.get('db'),
            req.user.id,
            review.id
          );
        });

        let voteStatus = await Promise.all(voteQueries);

        tsReviews = tsReviews.map((review, idx) => {
          console.log(voteStatus[idx]);
          return { ...review, ...voteStatus[idx] };
        });
      }

      data.amenities = amenities;
      data.tsReviews = tsReviews;
      data.tsAverages = tsAverages;
      data.favorite = favorite ? true : false;

      console.log('sending');
      res.send(data);
    } catch (error) {
      next(error);
    }
  });

module.exports = VenuesRouter;

// let id = '0f5502f218f8da928bd697801a0ae6f0f6e3beab';
