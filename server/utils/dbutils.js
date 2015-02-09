/**
 * Created by carlovespa on 06/02/15.
 */
var sqlite = require('sqlite3').verbose();

// in-memory DB
var imdb;

var dbutils = {
    initializeDB: function() {
        imdb = new sqlite.Database(':memory:');
        imdb.run('CREATE TABLE tokens (token VARCHAR(60) PRIMARY KEY NOT NULL, userid INT UNSIGNED UNIQUE NOT NULL)');
    },

    saveToken: function(token, userid) {
        var stmt = imdb.prepare('REPLACE INTO tokens VALUES (?,?)'); // if user already has a valid token, create a new one
        stmt.run(token, userid);
        stmt.finalize();
    },

    destroyToken: function(token) {
        var stmt = imdb.prepare('DELETE FROM tokens WHERE token = (?)');
        stmt.run(token);
        stmt.finalize();
    },

    isTokenValid: function(token, userid, callback) {
        var stmt = imdb.prepare('SELECT * FROM tokens WHERE token = (?) AND userid = (?)');
        stmt.all(token, userid, function(err, rows) {
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
