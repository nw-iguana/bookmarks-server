CREATE TYPE star_rating AS ENUM ('1', '2', '3', '4', '5');

CREATE TABLE bookmarks
 (id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, 
 name TEXT NOT NULL, 
 url TEXT NOT NULL,
 rating star_rating NOT NULL,
 description TEXT);