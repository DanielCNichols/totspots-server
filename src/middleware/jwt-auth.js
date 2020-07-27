const Authorization = require('./AuthService');

function requireAuth(req, res, next) {
  console.log('in the auth');
  const authToken = req.get('Authorization') || '';

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  console.log('made it past the checks');
  try {
    const payload = Authorization.verifyJwt(bearerToken);
    Authorization.getUserName(req.app.get('db'), payload.sub)
      .then(user => {
        if (!user)
          return res
            .status(401)
            .json({ error: 'Invalid username or password' });

        req.user = user;
        console.log('the user', user);
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: 'Invalid username or password' });
  }
}

module.exports = {
  requireAuth,
};
