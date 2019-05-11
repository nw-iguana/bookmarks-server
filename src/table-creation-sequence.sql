-- SQL Commands for table

-- Columns - ID, Name, URL

-- Create Database
-- createdb -U dunder-mifflin bookmarks-test;
-- psql -U dunder-mifflin bookmarks;

-- psql -U dunder-mifflin bookmarks -f '/Users/Home/Projects/bookmarks-server/src/table-creation-sequence.sql'

-- Create Table
DROP TABLE IF EXISTS bookmarks;

CREATE TABLE bookmarks
 (id serial PRIMARY KEY, 
 name text NOT NULL, 
 url text NOT NULL);

-- Insert into Tables
INSERT INTO bookmarks
    (name, url)
VALUES
    ('Google', 'http://google.com', ),
    ('Facebook', 'http://facebook.com'),
    ('Twitter', 'http://twitter.com'),
    ('Reddit', 'http://reddit.com'),
    ('Github', 'http://github.com'),
    ('Thinkful', 'http://thinkful.com'),
    ('Amazon', 'http://amazon.com'),
    ('Dropbox', 'http://dropbox.com'),
    ('Pinterest', 'http://pinterest.com'),
    ('Apple', 'http://apple.com');

SELECT * FROM bookmarks;