const Authorization = require('./AuthService');

function requireAuth(req, res, next) {
  console.log('in the auth');
  const authToken = req.get('Authorization') || '';
  console.log('authtoken', authToken);

  let bearerToken;
  console.log('got bearer', bearerToken);
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({error: 'Missing bearer token'});
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = Authorization.verifyJwt(bearerToken);
    Authorization.getUserName(req.app.get('db'), payload.sub)
      .then(user => {
        if (!user)
          return res.status(401).json({error: 'Invalid username or password'});

        req.user = user;
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({error: 'Invalid username or password'});
  }
}

function checkedLoggedIn(req, res, next) {
  const authToken = req.get('Authorization') || '';
  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    next();
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  //If no bearer token, we will get an actual string that says 'null', thanks to JSON.stringify();
  //So, if not null, then find the user info for votes and favorites, else just move along to the route.
  try {
    if (bearerToken !== 'null') {
      const payload = Authorization.verifyJwt(bearerToken);
      Authorization.getUserName(req.app.get('db'), payload.sub).then(user => {
        if (!user) {
          next();
        }
        req.user = user;
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAuth,
  checkedLoggedIn,
};
