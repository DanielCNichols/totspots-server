const Authorization = require('./AuthService');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  console.log(bearerToken);
  try {
    const payload = Authorization.verifyJwt(bearerToken);
    console.log(payload)
    Authorization.getUserName(req.app.get('db'), payload.sub)
      .then(user => {
        if (!user)
          return res.status(401).json({ error: 'Unauthorized request anmd USERNAME' });

        req.user = user;
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized request PASSWORD' });
  }
}

module.exports = {
  requireAuth
};
