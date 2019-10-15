const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const authorization = {
  getUserName(db, user_name) {
    return db('totspots_users')
      .where({ user_name })
      .first();
  },

  checkPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  makeToken(sub, pay) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: 'H256'
    });
  },

  checkToken(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithm: 'H256'
    });
  }
};

module.exports = 
  authorization
;
