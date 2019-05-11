const knex = require('knex')
const app = require('../src/app');
const { MakeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmarks Service', () => {
    let db

  const testBookmarks = MakeBookmarksArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db);
  })

  before('clean the table', () => db('bookmarks').truncate())
  after('disconnect from db', () => db.destroy())
  afterEach('cleanup', () => db('bookmarks').truncate())

  describe(`GET /bookmarks`, () => {
    context(`has bookmarks`, () => {
        beforeEach(() => {
            return db.into('bookmarks').insert(testBookmarks);
        });

        it('responds with 200 and has all bookmarks', () => {
            return supertest(app)
              .get('/bookmarks')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(200, testBookmarks);
          })
    })

    context(`has no bookmarks`, () => {      
      it('responds with 200 and has empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
      })
  })

  describe(`GET /bookmarks/:id`, () => {
    context(`has bookmarks`, () => {
        beforeEach(() => {
            return db.into('bookmarks').insert(testBookmarks);
        });

        it('returns bookmark with given id', () => {
          let id = 3;
          let expectedBookmark = testBookmarks.filter(bookmark => bookmark.id === id);
          return supertest(app)
            .get(`/bookmarks/${id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200, expectedBookmark[0])
        })

        it('returns error if no bookmark at given id', () => {
            let id = 10;
            let expectedError = {
                error: { message: 'No bookmark at that ID' }
            };
            return supertest(app)
                .get(`/bookmarks/${id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, expectedError)
        })
    })

    })

    describe(`Unauthorized requests`, () => {
        beforeEach(() => {
            return db.into('bookmarks').insert(testBookmarks);
        });

        it('responds with 401 unauthorized request to /bookmarks', () => {
            const expectedError = { error: 'Unauthorized request' }
          return supertest(app)
            .get(`/bookmarks`)
            .expect(401, expectedError)
        })

        it('responds with 401 unauthorized request to /bookmarks/:id', () => {
          const bookmarkId = testBookmarks[0].id;
          const expectedError = { error: 'Unauthorized request' }
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(401, expectedError)
      })
    })
})