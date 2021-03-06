module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://daniel@localhost/totspots',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    'postgresql://daniel@localhost/totspots-test',
  JWT_SECRET: process.env.JWT_SECRET || 'totSpotsSecret',
  CLIENT_ORIGIN: 'http://localhost:3000',
  GKEY: process.env.GKEY || 'key',
  GOOGLE_BASE_URL:
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
  GOOGLE_DETAIL_URL: 'https://maps.googleapis.com/maps/api/place/details/json',
  JWT_EXPIRY: '3h',
};
