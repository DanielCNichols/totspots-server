const express = require('express');
const UserRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const UserService = require('./UserService');

//This route deals with all the information that pertains to users.

UserRouter.route('/account').get(requireAuth, (req, res, next) => {
  UserService.getProfile(req.app.get('db'), req.user.id)
    .then(profile => {
      res.json(profile);
    })
    .catch(err => {
      next(err);
    });
});

//This endpoint handles all of the action dealing with users_favorites, and requires Authorization.
UserRouter.route('/favorites')
  // .all(requireAuth)
  .get(requireAuth, (req, res, next) => {
    UserService.getFavorites(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(err => {
        next(err);
      });
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { venue_id } = req.body;
    const newFavorite = { venue_id };

    newFavorite.user_id = req.user.id;

    if(!newFavorite.user_id) {
      return res.status(401).json( {
        error: `Unauthorized`
      });
    }

    UserService.addFavorite(req.app.get('db'), newFavorite)
      .then(favorite => {
        res.json(favorite);
      })
      .catch(err => {
        next(err);
      });
  })
  .delete(requireAuth, jsonBodyParser, (req, res, next) => {
    const { venue_id } = req.body;
    const delFav = { venue_id };

    delFav.user_id = req.user.id;

    if (!delFav.user_id) {
      return res.status(401).json({
        error: `Unauthorized`
      });
    }

    UserService.deleteFavorite(req.app.get('db'), delFav)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });


  UserRouter.route('/userReviews')
  .all(requireAuth)
  .get(requireAuth, (req, res, next) => {
    UserService.getUserReviews(req.app.get('db'), req.user.id)
      .then(profile => {
        res.json(profile);
      })
      .catch(err => {
        console.log('Account error', err);
        next(err);
      });
  });


  module.exports = UserRouter;
