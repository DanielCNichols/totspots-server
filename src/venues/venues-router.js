const express = require('express');
const VenuesService = require('./venues-service');

const VenuesRouter = express.Router();

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

module.exports = VenuesRouter;
