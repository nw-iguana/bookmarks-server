const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookmarks = require('../store');
const BookmarkService = require('./bookmarks-service');
const xss = require('xss');

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
    const { name, url, rating, description } = req.body;

    let newBookmark = {
      name,
      url,
      rating,
      description
    };

    const requiredKeys = ['name', 'url', 'rating'];

    requiredKeys.forEach(key => {
      if (!newBookmark[key]) {
        return res.status(400).json({error: `${key} cannot be blank`})
      }
    })

    BookmarkService.addBookmark(knexInstance, newBookmark).then(bookmark => {
      return res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
        .json({
          id: bookmark.id,
          url: xss(bookmark.url),
          rating: xss(bookmark.rating),
          name: xss(bookmark.name),
          description: xss(bookmark.description)
        });
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
  .delete(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    let id = req.params.id;
    let bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark not found`);
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    BookmarkService.deleteBookmark(knexInstance, id)
      .then(response => {
        res.status(204).end();
      })
      .catch(next)
  });

module.exports = bookmarksRouter;
