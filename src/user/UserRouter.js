const express = require('express');
const UserRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const UserService = require('./UserService');
const xss = require('xss');
const path = require('path');

//This route deals with all the information that pertains to users.

UserRouter.route('/').post(jsonBodyParser, async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      city,
      state,
      email,
      password,
      username,
    } = req.body;

    for (const field of [
      'first_name',
      'last_name',
      'city',
      'state',
      'email',
      'password',
      'username',
    ])
      if (!req.body[field])
        res.status(400).json({
          error: `Missing ${field} in request body`,
        });

    const passwordError = UserService.validatePassword(password);

    if (passwordError) return res.status(400).json({ error: passwordError });

    const hasUserWithEmail = await UserService.hasUserWithEmail(
      req.app.get('db'),
      email
    );

    if (hasUserWithEmail)
      return res.status(400).json({
        error:
          'An account already exists with this email. Did you forget your password?',
      });

    const hasUserWithUserName = await UserService.hasUserWithUserName(
      req.app.get('db'),
      username
    );

    if (hasUserWithUserName) {
      return res.status(400).json({ error: 'This username is already taken' });
    }

    //all of it works, so then we insert it

    const hashedPassword = await UserService.hashPassword(password);

    const newUser = {
      first_name,
      last_name,
      city,
      state,
      username,
      password: hashedPassword,
      email,
    };

    const user = await UserService.insertUser(req.app.get('db'), newUser);

    console.log(user);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UserService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

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

    if (!newFavorite.user_id) {
      return res.status(401).json({
        error: `Unauthorized`,
      });
    }

    //for adding and deleting saved venues
    UserService.addFavorite(req.app.get('db'), newFavorite)
      .then(favorite => {
        res.status(200).json(favorite);
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
        error: `Unauthorized`,
      });
    }

    UserService.deleteFavorite(req.app.get('db'), delFav)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = UserRouter;
