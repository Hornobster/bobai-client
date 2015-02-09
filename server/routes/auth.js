/**
 * Created by carlovespa on 06/02/15.
 */

var jwt = require('jwt-simple');
var config = require('./../config.js');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var dbutils = require('../utils/dbutils.js');

// create a DB connection object (still not actually connected)
var connection = mysql.createConnection(config.dbInfo);

var auth = {
    login: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username === '' || password === '') {
            res.status(403);
            res.json({
                status: 403,
                message: config.statusMessages.unauthorized
            });
            return;
        }

        // query DB and check credentials
        auth.validate(username, password, function(dbUser) {
            // if authentication failed, send 401
            if (!dbUser) {
                res.status(401);
                res.json({
                    status: 401,
                    message: config.statusMessages.credentialsInvalid
                });
            } else { // if successful, save token to DB and send it
                var token = genToken(dbUser);

                dbutils.saveToken(token.token, dbUser.id);

                res.json(token);
            }
        });
    },

    logout: function(req, res) {
        var token = (req.body && req.body.xAccessToken) || req.headers['x-access-token'];

        if (token) {
            dbutils.destroyToken(token);

            res.status(200);
            res.json({
                status: 200,
                message: config.statusMessages.logoutSuccess
            });
        } else {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.logoutFail
            });
        }
    },

    validate: function(username, password, callback) {
        connection.query('SELECT * FROM users WHERE username = ?', username, function(err, result) {
            if (err || result.length === 0) { // DB error or non existing user
                callback(false);
            } else {
                var hash = result[0].password;
                if (bcrypt.compareSync(password, hash)) { // passwords match
                    callback({
                        id: result[0].id,
                        username: result[0].username,
                        email: result[0].email,
                        phone: result[0].phone
                    });
                } else { // passwords don't match
                    callback(false);
                }
            }
        });
    }
};

// private methods
function genToken(user) {
    var expires = expiresIn(config.tokenInfo.tokenDuration); // token duration
    var token = jwt.encode({exp: expires, userid: user.id}, config.tokenInfo.jwtSecret);

    return {
        token: token,
        expires: expires,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;
