const knex = require('knex');
const app = require('../src/app');
const { MakeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Service', () => {
  let db;

  const testBookmarks = MakeBookmarksArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before('clean the table', () => db('bookmarks').truncate());
  after('disconnect from db', () => db.destroy());
  afterEach('cleanup', () => db('bookmarks').truncate());

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
      });
    });

    context(`has no bookmarks`, () => {
      it('responds with 200 and has empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });
  });

  describe(`GET /bookmarks/:id`, () => {
    context(`has bookmarks`, () => {
      beforeEach(() => {
        return db.into('bookmarks').insert(testBookmarks);
      });

      it('returns bookmark with given id', () => {
        let id = 3;
        let expectedBookmark = testBookmarks.filter(
          bookmark => bookmark.id === id
        );
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark[0]);
      });

      it('returns error if no bookmark at given id', () => {
        let id = 10;
        let expectedError = {
          error: { message: 'No bookmark at that ID' }
        };
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, expectedError);
      });
    });
  });

  describe(`Unauthorized requests`, () => {
    beforeEach(() => {
      return db.into('bookmarks').insert(testBookmarks);
    });

    it('responds with 401 unauthorized request to /bookmarks', () => {
      const expectedError = { error: 'Unauthorized request' };
      return supertest(app)
        .get(`/bookmarks`)
        .expect(401, expectedError);
    });

    it('responds with 401 unauthorized request to /bookmarks/:id', () => {
      const bookmarkId = testBookmarks[0].id;
      const expectedError = { error: 'Unauthorized request' };
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .expect(401, expectedError);
    });
  });

  describe('POST /bookmarks', () => {
    context(`bookmark entry is valid`, () => {
      it('creates a bookmark and returns the created bookmark', () => {
        const newBookmark = {
          id: 1,
          name: 'New test bookmark',
          url: 'https://www.newbookmark.com',
          rating: '4',
          description: ''
        };

        return supertest(app)
          .post('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(newBookmark)
          .expect(201)
          .then(res => {
            expect(res.body).to.eql(newBookmark);
            expect(res.body.name).to.eql(newBookmark.name);
            expect(res.body.url).to.eql(newBookmark.url);
            expect(res.body.rating).to.eql(newBookmark.rating);
            expect(res.body).to.have.property('id');
          });
        })

        it('bookmark entries are invalid', () => {
          return supertest(app)
            .post('/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send({name: null})
            .expect(400)
            .then(res => {
              expect(res.body).to.eql({error: `name cannot be blank`})
            })
        });
    });
    context(`given an xss attack bookmark`, () => {
      const maliciousBookmark = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'hack url',
        rating: '4',
        description: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
      }

      beforeEach('insert malicious article', () => {
        return db
          .into('bookmarks')
          .insert([maliciousBookmark])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .post(`/bookmarks`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .send(maliciousBookmark)
          .expect(201)
          .expect(res => {
            expect(res.body.name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.description).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  })

  describe.only(`DELETE /bookmarks/:id`, () => {
    
    beforeEach(() => {
      return db.into('bookmarks').insert(testBookmarks);
    });

    it(`responds with 204 and removes bookmark`, () => {
      const removeId = 3;
      const expected = testBookmarks.filter(bookmark => bookmark.id !== removeId);
      return supertest(app)
        .delete(`/bookmarks/${removeId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(204)
        .then(() => {
          return supertest(app)
            .get('/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(expected)
        })
    })
  })
});
