const express = require('express');
const VenuesService = require('./venues-service');

const VenuesRouter = express.Router();

VenuesRouter.route('/:city/:state/:type').get((req, res) => {
  VenuesService.getVenuesByCity(req.app.get('db'), req.params.city, req.params.state, req.params.type).then(venues => {
    res.json(venues);
  });
});


module.exports = VenuesRouter;