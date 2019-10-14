module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://daniel@localhost/totspots',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://daniel@localhost/totspots-test',
  JWT_SECRET: process.env.JWT_SECRET || 'totSpotsSecret'
};
