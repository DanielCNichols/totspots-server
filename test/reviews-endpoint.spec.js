const knex = require('knex');
const jwt = require('jsonwebtoken');
const {
  makeVenuesArray,
  makeAmenities,
  makeReviews,
  makeUsersArray,
  makeVotes,
  expectedCount,
  expectedUserReviews,
  expectedReviews
} = require('./venues-fixtures');
const app = require('../src/app');

describe('Reviews Endpoints', () => {
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

  describe('GET /reviews/venues/:venueId', () => {
    context('Given no reviews', () => {
      it('responds with an empty list', () => {
        return supertest(app)
          .get('/api/reviews/venues/1')
          .expect(200, []);
      });
    });

    context('Given reviews', () => {
      const testVenues = makeVenuesArray();
      const testUsers = makeUsersArray();
      const testReviews = makeReviews();
      const testVotes = makeVotes();
      const testExpectedReviews = expectedReviews();
      beforeEach('insert Venues and reviews', () => {
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
                    return db.into('votes').insert(testVotes);
                  });
              });
          });
      });

      it.skip('returns the reviews for a given venue', () => {
        return supertest(app)
          .get('/api/reviews/venues/1')
          .expect(200, testExpectedReviews);
      });
    });

    describe('GET /api/reviews/reviewID/votes', () => {
      context('Given there are votes', () => {
        const testVenues = makeVenuesArray();
        const testUsers = makeUsersArray();
        const testReviews = makeReviews();
        const testVotes = makeVotes();
        const testExpectedCount = expectedCount();
        beforeEach('insert Venues and reviews', () => {
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
                      return db.into('votes').insert(testVotes);
                    });
                });
            });
        });

        it('responds with an empty array when there are no votes', () => {
          return supertest(app)
            .get('/api/reviews/2/votes')
            .expect(200, []);
        });

        it('returns the proper vote count for the review', () => {
          return supertest(app)
            .get('/api/reviews/1/votes')
            .expect(200, testExpectedCount);
        });

        it('returns 404 if the review is not found', () => {
          return supertest(app)
            .get('/api/reviews/8/votes')
            .expect(404, {
              error: `Review doesn't exist`
            });
        });

        describe('POST /api/reviews/reviewId/Votes', () => {
          it('returns with 401 Unauthorized for POST /votes', () => {
            return supertest(app)
              .post('/api/reviews/1/votes')
              .send({
                votestatus: true,
                review_id: 1,
                user_id: 1
              })
              .expect(401, {
                error: `Missing bearer token`
              });
          });

          it.skip('responds with 201 and the vote if successful', () => {
            return supertest(app)
              .post('/api/reviews/2/votes')
              .set('Authorization', makeAuthHeader(testUsers[1]))
              .send({ votestatus: true, review_id: 2 })
              .expect(res => {
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('user_id');
                expect(res.body.votestatus).to.eql(true);
              });
          });
        });
      });
    });

    describe.only(' GET /api/reviews/userReviews', () => {
      context('Given there are reviews', () => {
        const testVenues = makeVenuesArray();
        const testUsers = makeUsersArray();
        const testReviews = makeReviews();
        const testVotes = makeVotes();
        const testExpectedUserReviews = expectedUserReviews();
        beforeEach('insert Venues and reviews', () => {
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
                      return db.into('votes').insert(testVotes);
                    });
                });
            });
        });

        it('returns the users reviews', () => {
          supertest(app)
            .get('/api/reviews/userReviews')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(201, testExpectedUserReviews);
        });

        it('returns unauthorized when no token is passed', () => {
          supertest(app)
            .get('/api/reviews/userReviews')
            .expect(201, {
              error: `Misssing bearer token`
            });
        });
      });
    });

    describe.only(' POST api/review/venueId', () => {
      context('Given there are venues', () => {
        const testVenues = makeVenuesArray();
        const testUsers = makeUsersArray();
        const testReviews = makeReviews();
        const testVotes = makeVotes();
        const testExpectedUserReviews = expectedUserReviews();
        beforeEach('insert Venues and reviews', () => {
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
                      return db.into('votes').insert(testVotes);
                    });
                });
            });
        });

        const requiredFields = [
          'content',
          'venue_id',
          'price',
          'volume',
          'starrating',
          'amenities'
        ];

        requiredFields.forEach(field => {
          const testUser = testUsers[0];
          const newReview = {
            venue_id: 1,
            content: 'test',
            price: 3,
            volume: 5,
            starrating: 3,
            amenities: [{ amenity: 1 }]
          };

          it('returns a 201 and review if posted successfully', () => {
            return supertest(app)
              .post('/api/reviews/venueId')
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .send({
                venue_id: 1,
                content: 'this is a test',
                price: 2,
                volume: 3,
                starrating: 4,
                amenities: { amenity: 1 }
              })
              .expect(res => {
                expect(res.body).to.have.property('id');
                expect(res.body.venue_id).to.eql();
              });
          });
        });
      });
    });
  });

  //test to see if it takes newreviews
  //does it take

  //test to see how it handles votes (correct, incorrect, none)
});

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}
