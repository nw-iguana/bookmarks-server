const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookmarks = require('../store');
const BookmarkService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route('/bookmarks')
  .get(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarkService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name, url, rating } = req.body;

    let id = uuid();
    let newBookmark = {
      id,
      name,
      url,
      rating
    };

    const requiredKeys = [name, url, rating];

    requiredKeys.forEach((key, value) => {
      if (key[value] === null) {
        return res.status(400).json({ error: `${key} cannot be blank` });
      }
    });

    BookmarkService.addBookmark(knexInstance, newBookmark).then(bookmark => {
      return res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
        .json(bookmarks);
    });
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get(bodyParser, (req, res, next) => {
    let id = req.params.id;
    const knexInstance = req.app.get('db');

    BookmarkService.getById(knexInstance, id)
      .then(result => {
        if (!result) {
          res.status(404).json({
            error: { message: 'No bookmark at that ID' }
          });
        }
        res.status(200).json(result);
      })
      .catch(next);
  })
  .delete(bodyParser, (req, res) => {
    let id = req.params.id;
    let bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark not found`);
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    bookmarks.splice(bookmarkIndex, 1);

    return res.status(200).end();
  });

module.exports = bookmarksRouter;
