const express = require('express');
const VenuesService = require('./venues-service');
const path = require('path');
const VenuesRouter = express.Router();
const jsonBodyParser = express.json();

VenuesRouter.route('/:city/:state/:type').get((req, res) => {
  VenuesService.getVenuesByCity(
    req.app.get('db'),
    req.params.city,
    req.params.state,
    req.params.type
  ).then(venues => {
    res.json(venues);
  });
});

VenuesRouter.route('/reviews/:venueId').get((req, res) => {
  VenuesService.getReviewsByVenue(req.app.get('db'), req.params.venueId).then(
    reviews => {
      res.json(reviews);
    }
  );
});

VenuesRouter.route('/').post(jsonBodyParser, (req, res, next) => {
  const { venue_name, venue_type, address, city, state, zipcode } = req.body;
  const newVenue = { venue_name, venue_type, address, city, state, zipcode };

  for (const [key, value] of Object.entries(newVenue))
    if (value === null) {
      return res.status(400).json({ error: `Missing ${key} in request` });
    }
  VenuesService.addVenue(req.app.get('db'), newVenue)
    .then(venue => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${venue.id}`))
        .json(VenuesService.serializeVenue(venue));
    })
    .catch(next);
});

module.exports = VenuesRouter;
