const express = require('express');
const jsonBodyParser = express.json();
const AuthService = require('../middleware/AuthService');
const {requireAuth} = require('../middleware/jwt-auth');

const AuthRouter = express.Router();

AuthRouter.route('/login')
  .post(jsonBodyParser, async (req, res, next) => {
    try {
      const {username, password} = req.body;

      if (!username) {
        return res.status(400).json({
          error: `Missing username in request`,
        });
      }
      if (!password) {
        return res.status(400).json({
          error: `Missing password in request`,
        });
      }

      let user = await AuthService.getUserName(req.app.get('db'), username);

      if (!user) {
        return res.status(400).json({
          error: `Invalid credentials`,
        });
      }

      let check = await AuthService.checkPassword(password, user.password);
      if (!check) {
        return res.status(400).json({
          error: `Invalid credentials`,
        });
      }

      const sub = user.username;
      const payload = {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      console.log('sending the res');

      res.send({authToken: AuthService.createJWT(sub, payload)});
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .put(requireAuth, async (req, res) => {
    console.log('in the put');
    const sub = req.user.username;
    const payload = {
      user_id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
    };
    res.send({authToken: AuthService.createJWT(sub, payload)});
  });

module.exports = AuthRouter;

// AuthRouter.post('/login', jsonBodyParser, (req, res, next) => {
//   const {username, password} = req.body;
//   const user = {username, password};

//   console.log('in the login', username, password);
//   for (const [key, value] of Object.entries(user))
//     if (value === null) {
//       return res.status(400).json({
//         error: `Missing ${key} in request`,
//       });
//     }

//   AuthService.getUserName(req.app.get('db'), username)
//     .then(dbuser => {
//       if (!dbuser) {
//         console.log('no dbuser');
//         return res.status(400).json({
//           error: 'Incorrect Credentials',
//         });
//       }

//       AuthService.checkPassword(user.password, dbuser.password).then(
//         compareMatch => {
//           if (!compareMatch) {
//             console.log('credential failed');
//             return res.status(400).json({
//               error: 'Incorrect Credentials',
//             });
//           }
//           const sub = dbuser.username;
//           const payload = {
//             user_id: dbuser.id,
//             first_name: dbuser.first_name,
//             last_name: dbuser.last_name,
//           };
//           console.log('sending res');
//           res.send({authToken: AuthService.makeToken(sub, payload)});
//         }
//       );
//     })
//     .catch(next)
