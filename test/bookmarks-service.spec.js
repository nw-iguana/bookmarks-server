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
    app.set('db');
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())

  describe(`GET /bookmarks`, () => {
    context(`has no bookmarks`, () => {
    //   beforeEach(() => {
    //     return db.into('bookmarks').insert(testBookmarks);
    //   });
      
      it('responds with 200 and has empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })

      })
  })
})