const knex = require('knex');
const jwt = require('jsonwebtoken');
const {
  makeVenuesArray,
  makeReviews,
  makeUsersArray,
  makeVotes,
  makeAmenities,
  makeAmenVenues,
  expectedCount,
  expectedUserReviews,
  expectedReviews
} = require('./Test-fixtures');
const app = require('../src/app');

describe('Reviews Endpoints', () => {
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

      //date is set off
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

          it('responds with 201 and the vote if successful', () => {
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

    describe(' GET /api/reviews/userReviews', () => {
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

    describe(' POST api/review/venueId', () => {
      context('Given there are venues', () => {
        const testVenues = makeVenuesArray();
        const testUsers = makeUsersArray();
        const testReviews = makeReviews();
        const testVotes = makeVotes();
        const testAmenities = makeAmenities();
        const testAmenVenues = makeAmenVenues();
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
                      return db
                        .into('votes')
                        .insert(testVotes)
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
        });

        const newReview = {
          venue_id: '1',
          content: 'test',
          price: '3',
          volume: '5',
          starrating: '3',
          amenities: [{ amenity: 1 }]
        };

        it('returns a 201 and review if posted successfully', () => {
          return supertest(app)
            .post('/api/reviews/venueId')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send(newReview)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.venue_id).to.eql(1);
              expect(res.body.content).to.eql(newReview.content);
              expect(res.body.price).to.eql(newReview.price);
              expect(res.body.volume).to.eql(newReview.volume);
              expect(res.body.starrating).to.eql(newReview.starrating);
            });
        });
      });
    });

    describe('api/reviews/users/venues/:reviewId', () => {
      context('given there are reviews', () => {
        const testVenues = makeVenuesArray();
        const testUsers = makeUsersArray();
        const testReviews = makeReviews();
        const testVotes = makeVotes();
        const testExpectedReview = expectedReviews();
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

        it('returns the requested review by id', () => {
          return supertest(app)
            .get('/api/reviews/users/venues/1')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200, testExpectedReview);
        });
      });
    });

    describe('DELETE api/users/venues/:reviewId', () => {
      context('Given reviews', () => {
        const testVenues = makeVenuesArray();
        const testUsers = makeUsersArray();
        const testReviews = makeReviews();
        const testVotes = makeVotes();
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

        it('responds with 204 and deletes the review', () => {
          const id = 1;

          return supertest(app)
            .delete(`/api/reviews/users/venues/${id}`)
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(204)
            .then(() => {
              return supertest(app)
                .get(`/api/reviews/users/venues/${id}`)
                .expect(404);
            });
        });
      });

      describe('Patch api/reviews/users/venues/reviewid', () => {
        context('given there are reviews', () => {
          const testVenues = makeVenuesArray();
          const testUsers = makeUsersArray();
          const testReviews = makeReviews();
          const testVotes = makeVotes();

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
          it('Updates the requested review', () => {
            const id = 1;
            const newReview = { content: 'this is updated content' };
            return supertest(app)
              .patch(`/api/reviews/users/venues/${id}`)
              .set('Authorization', makeAuthHeader(testUsers[0]))
              .send(newReview)
              .expect(204, {});
          });
        });
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
