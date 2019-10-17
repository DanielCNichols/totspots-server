const express = require('express');
const jsonBodyParser = express.json();
const AuthService = require('../middleware/AuthService');

const AuthRouter = express.Router();

AuthRouter.post('/login', jsonBodyParser, (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);
  const user = { username, password };

  //if one of these is missing, forget it

  for (const [key, value] of Object.entries(user))
    if (value === null) {
      return res.status(400).json({
        error: `Missing ${key} in request`
      });
    }

  AuthService.getUserName(req.app.get('db'), user.username)
    .then(dbuser => {
      if (!dbuser) {
        return res.status(400).json({
          error: `Username incorrect`
        });
      }

      return AuthService.checkPassword(user.password, dbuser.password).then(
        compareMatch => {
          if (!compareMatch) {
            return res.status(400).json({
              error: `Password is incorrect`
            });
          }
          const sub = dbuser.username;
          const payload = { user_id: dbuser.id };
          res.send({ authToken: AuthService.makeToken(sub, payload) });
        }
      );
    })
    .catch(next);
});

module.exports = AuthRouter;
