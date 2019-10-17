const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {
  getUserName(db, username) {
    console.log('Got username')
    return db('totspots_users')
      .where({ username })
      .first();
  },

  checkPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  makeToken(sub, pay) {
    return jwt.sign(pay, config.JWT_SECRET, {
      subject: sub,
      algorithm: 'HS256'
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    });
  }
};

module.exports = 
  AuthService
;
