const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('../middleware/auth-service');

authRouter.post('/login', jsonBodyParser, (req, res, next) => {
  const { userName, password } = req.body;
  const user = { userName, password };

  //if one of these is missing, forget it

  for (const [key, value] of Object.entries(user))
    if (value === null) {
      return res.status(400).json({
        error: `Missing ${key} in request`
      });
    }

  AuthService.getUserName(req.app.get('db'), user.userName)
    .then(dbuser => {
      if (!dbuser) {
        return res.status(400).json({
          error: `Username or Password is incorrect`
        });
      }

      return AuthService.CheckPassword(dbuser.password, user.password).then(
        compareMatch => {
          if (!compareMatch) {
            return res.status(400).json({
              error: `Username or Pasword is incorrect`
            });
          }
          const sub = dbuser.userName;
          const payload = { user_id: dbuser.id };
          res.send({ authToken: AuthService.createToken(sub, payload) });
        }
      );
    })
    .catch(next);
});

module.export = authRouter;
