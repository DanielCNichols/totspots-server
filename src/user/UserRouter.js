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
      console.log('Account error', err);
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
    UserService.addFavorite(req.app.get('db'), newFavorite)
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
    const delFav = { venue_id };

    //MACHEN SOME VALIDATION HERE!

    //SET THE user...

    delFav.user_id = req.user.id;
    UserService.deleteFavorite(req.app.get('db'), delFav)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

  module.exports = UserRouter;
