const knex = require('knex');
const jwt = require('jsonwebtoken');
const {
  makeVenuesArray,
  makeAmenities,
  makeAmenVenues,
  makeFavorites,
  makeReviews,
  makeUsersArray,
  makeVotes,
  expectedVenues,
  makeMaliciousVenue,
  expectedAmenities,
  newVenue
} = require('./venues-fixtures');
const app = require('../src/app');

describe('Venues Endpoints', () => {
  let db;

  before('make Knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
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

  describe('Get /api/venues/:city/:state/:type', () => {
    context('Given no venues', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/venues/durham/nc/bar')
          .expect(200, []);
      });
    });

    context('Given there are venues in the database', () => {
      const testVenues = makeVenuesArray();
      const testUsers = makeUsersArray();
      const testReviews = makeReviews();
      const testExpectedVenues = expectedVenues();

      beforeEach('insert Venues', () => {
        return db
          .into('venues')
          .insert(testVenues)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
              .then(() => {
                return db.into('reviews').insert(testReviews);
              });
          });
      });

      it('responds with 200 and all of the venues', () => {
        return supertest(app)
          .get('/api/venues/Durham/NC/Bar')
          .expect(200, testExpectedVenues);
      });
    });

    context('Given an xss attack venue', () => {
      const { maliciousVenue, cleanedVenue } = makeMaliciousVenue();
      const testVenues = makeVenuesArray();
      const testUsers = makeUsersArray();
      const testReviews = makeReviews();
      const testExpectedVenues = expectedVenues();
      beforeEach('insert venues, user, reviews, and malicious venues', () => {
        return db
          .into('venues')
          .insert(testVenues)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
              .then(() => {
                return db
                  .into('reviews')
                  .insert(testReviews)
                  .then(() => {
                    return db.into('venues').insert(maliciousVenue);
                  });
              });
          });
      });

      it('removes xss attack content', () => {
        return supertest(app)
          .get('/api/venues/Durham/NC/Bar')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql([...testExpectedVenues, cleanedVenue]);
          });
      });
    });
  });

  describe(' GET /:venueId/amenities', () => {
    context(`if there are amenities`, () => {
      const testVenues = makeVenuesArray();
      const testUsers = makeUsersArray();
      const testReviews = makeReviews();
      const testAmenities = makeAmenities();
      const testAmenVenues = makeAmenVenues();
      const testExpectedAmenities = expectedAmenities();

      beforeEach('insert Venues', () => {
        return db
          .into('venues')
          .insert(testVenues)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
              .then(() => {
                return db
                  .into('reviews')
                  .insert(testReviews)
                  .then(() => {
                    return db
                      .into('amenities')
                      .insert(testAmenities)
                      .then(() => {
                        return db
                          .into('amenities_venues')
                          .insert(testAmenVenues);
                      });
                  });
              });
          });
      });

      it('returns a list of venues and amenities ', () => {
        return supertest(app)
          .get('/api/venues/1/amenities')
          .expect(200, testExpectedAmenities);
      });

      it('returns an empty array if no amenities found', () => {
        return supertest(app)
          .get('/api/venues/2/amenities')
          .expect(200, []);
      });

      it('returns 404 if venue is not found', () => {
        return supertest(app)
          .get('/api/venues/3/amenities')
          .expect(404, {
            error: `Venue doesn't exist`
          });
      });
    });
  });

  describe('POST /api/venues/addVenue', () => {
    const testVenues = makeVenuesArray();
    const testUsers = makeUsersArray();
    const testReviews = makeReviews();
    const testAmenities = makeAmenities();
    const testNewVenue = newVenue();
    beforeEach('insert Venues', () => {
      return db
        .into('venues')
        .insert(testVenues)
        .then(() => {
          return db
            .into('users')
            .insert(testUsers)
            .then(() => {
              return db
                .into('reviews')
                .insert(testReviews)
                .then(() => {
                  return db.into('amenities').insert(testAmenities);
                });
            });
        });
    });

    it.skip('responds with 201 if successful', () => {
      return supertest(app)
        .post('/api/venues/addVenue')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .send(testNewVenue)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.venue_name).to.eql(testNewVenue.venue_name);
          expect(res.body.venue_type).to.eql(testNewVenue.venue_type);
          expect(res.body.address).to.eql(testNewVenue.address);
          expect(res.body.city).to.eql(testNewVenue.city);
          expect(res.body.state).to.eql(testNewVenue.state);
          expect(res.body.phone).to.eql(testNewVenue.phone);
          expect(res.body.city).to.eql(testNewVenue.city);
          expect(res.body.city).to.eql(testNewVenue.city);
          expect(res.body.city).to.eql(testNewVenue.city);
        });
    });

    const requiredFields = [
      'venue_name',
      'venue_type',
      'address',
      'city',
      'state',
      'zipcode',
      'content',
      'phone',
      'url',
      'price',
      'volume',
      'starrating',
      'amenities'
    ];

    requiredFields.forEach(field => {
      const testUser = testUsers[0];
      const newVenue = {
        venue_name: 'Test',
        venue_type: 'Bar',
        address: 'test',
        city: 'test',
        state: 'test',
        zipcode: 456123,
        content: 'test',
        phone: '65465465464',
        url: 'test',
        price: 3,
        volume: 5,
        starrating: 3,
        amenities: [{ amenity: 1 }]
      };

      // it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      //   delete newVenue[field];

      //   return supertest(app)
      //     .post('/api/venues/addVenue')
      //     .set('Authorization', makeAuthHeader(testUser))
      //     .send(newVenue)
      //     .expect(400, {
      //       error: `Missing '${field}' in request body`
      //     });
      // });
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
