const AuthService = require('../middleware/auth-service');

function auth(req, res, next) {
  const token = req.get('Authorization') || '';

  let bearer;

  if (!token.toLowerCase().startsWith('bearer')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearer = token.slice(7, token.length);
  }

  try {
    const payload = AuthService.checkToken(bearer);

    AuthService.getUserName(req.app.get('db'), payload.sub)
      .then(user => {
        if (!user) return res.status(401).json({ error: `Unauthorized` });

        req.user = user;
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: `Unauthorized` });
  }
}

module.exports = {
  auth
};
