require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const VenuesRouter = require('./venues/venues-router');
const app = express();
const AuthRouter = require('./auth/auth-router');
const ReviewsRouter = require('./reviews/reviews-router');
const UserRouter = require('./user/UserRouter');
const morganOption = NODE_ENV === 'production';
const { CLIENT_ORIGIN } = require('./config');
const { API_BASE_URL } = require('./config');

export const fetchUserProfile = userId => dispatch => {
  fetch(`${API_BASE_URL}/users/${userId}`)
    .then(res => {
      if (!res.ok) {
        return Promise.reject(res.statusText);
      }
      return res.json();
    })
    .then(userProfile => {
      dispatch(fetchUserProfileSuccess(userProfile));
    })
    .catch(err => dispatch(fetchUserProfileError(err)));
};

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use('/api/venues', VenuesRouter);
app.use('/api/reviews', ReviewsRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/users', UserRouter);

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

module.exports = app;
