const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const bookmarks = require('../store')
const BookmarkService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get(bodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarkService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.status(200)
                res.json(bookmarks);
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        const { name, url } = req.body

        let id = uuid();
        let newBookmark = {
            id,
            name,
            url
        }

        if(!name) {
            logger.error(`Name cannot be blank`)
            return res
            .status(400)
            .json({ "error": "Name cannot be blank" })
        }

        if(!url) {
            logger.error(`URL cannot be blank`)
            return res
            .status(400)
            .json({ "error": "URL cannot be blank" })
        }
        
        bookmarks.push(newBookmark)

        return res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmarks)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get(bodyParser, (req, res) => {
        let id = req.params.id;
        let bookmarkId = bookmarks.filter(bookmark => bookmark.id === id)
      
        if (bookmarkId.length === 0) {
          logger.error(`No bookmarks with ID ${id}`)
          return res
            .status(404)
            .json({ "error": "Not Found" })
        }
        
        return res
          .status(200)
          .json(bookmarkId)
    })
    .delete(bodyParser, (req, res) => {
        let id = req.params.id;
        let bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id)
      
        if (bookmarkIndex === -1) {
          logger.error(`Bookmark not found`)
          return res
            .status(404)
            .json({ "error": "Bookmark not found" })
        }
      
        bookmarks.splice(bookmarkIndex, 1)
      
        return res
          .status(200)
          .end()
    })

module.exports = bookmarksRouter