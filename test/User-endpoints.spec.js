const knex = require('knex');
const jwt = require('jsonwebtoken');
const {
  makeVenuesArray,
  makeUsersArray,
  expectedUser,
  makeFavorites,
  expectedFavorites,
} = require('./Test-fixtures');
const app = require('../src/app');

describe('User endpoints', () => {
  let db;

  before('make Knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clear the table', () =>
    db.raw(
      'TRUNCATE venues, users, amenities, reviews, amenities_venues, users_favorites, votes RESTART IDENTITY CASCADE'
    )
  );

  afterEach('cleanup', () =>
    db.raw(
      'TRUNCATE venues, users, reviews, amenities, amenities_venues, users_favorites, votes RESTART IDENTITY CASCADE'
    )
  );

  describe.only('/account', () => {
    context('given there are is a user profile', () => {
      const testUsers = makeUsersArray();
      const testExpectedUser = expectedUser();

      beforeEach('insert users', () => {
        return db.insert(testUsers).into('users');
      });

      it('responds with 200 and the user information', () => {
        return supertest(app)
          .get('/api/users/account')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, testExpectedUser);
      });
    });
  });

  describe.only('/api/users/favorites', () => {
    context('Given there are favorites', () => {
      const testUsers = makeUsersArray();
      const testFavorites = makeFavorites();
      const testVenues = makeVenuesArray();
      const expectedFavs = expectedFavorites();
      beforeEach('Insert users and favorites', () => {
        return db
          .insert(testUsers)
          .into('users')
          .then(() => {
            return db
              .insert(testVenues)
              .into('venues')
              .then(() => {
                return db.insert(testFavorites).into('users_favorites');
              });
          });
      });

      it('returns the users favorite venues', () => {
        return supertest(app)
          .get('/api/users/favorites')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, expectedFavs);
      });

      it('Adds a new favorite to the users account', () => {
        return supertest(app)
          .post('/api/users/favorites')
          .set('Authorization', makeAuthHeader(testUsers[1]))
          .send({ venue_id: 1 })
          .expect(200, { user_id: 2, venue_id: 1 });
      });

      it('deletes a favorite from the users account and responds with 204', () => {
        return supertest(app)
          .delete('/api/users/favorites')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send({venue_id: 1})
          .expect(204, {})
      });
    });
  });
});

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}
