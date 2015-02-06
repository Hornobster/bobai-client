/**
 * Created by carlovespa on 06/02/15.
 */
var sqlite = require('sqlite3').verbose();

// in-memory DB
var imdb;

var dbutils = {
    initializeDB: function() {
        imdb = new sqlite.Database(':memory:');
        imdb.run('CREATE TABLE tokens (token VARCHAR(60) PRIMARY KEY NOT NULL, user VARCHAR(30) UNIQUE NOT NULL)');
    },

    saveToken: function(token, user) {
        var stmt = imdb.prepare('REPLACE INTO tokens VALUES (?,?)'); // if user already has a valid token, create a new one
        stmt.run(token, user);
        stmt.finalize();
    },

    destroyToken: function(token) {
        var stmt = imdb.prepare('DELETE FROM tokens WHERE token = (?)');
        stmt.run(token);
        stmt.finalize();
    },

    isTokenValid: function(token, key, callback) {
        var stmt = imdb.prepare('SELECT * FROM tokens WHERE token = (?) AND user = (?)');
        stmt.all(token, key, function(err, rows) {
            if (rows.length > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
        stmt.finalize();
    }
};

module.exports = dbutils;
