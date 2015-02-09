/**
 * Created by carlovespa on 06/02/15.
 */

var jwt = require('jwt-simple');
var config = require('../config.js');
var auth = require('../routes/auth.js');
var dbutils = require('../utils/dbutils.js');

module.exports = function(req, res, next) {
    var token = (req.body && req.body.xAccessToken) || req.headers['x-access-token'];
    var key = (req.body && req.body.xKey) || req.headers['x-key'];

    if (token && key) {
        try {
            var decoded = jwt.decode(token, config.jwtSecret);

            if (decoded.exp <= Date.now()) { // token expired, update IMDB token table and send error
                dbutils.destroyToken(token);

                res.status(400);
                res.json({
                    status: 400,
                    message: 'Token expired'
                });
                return;
            }

            // check tokens DB
            dbutils.isTokenValid(token, decoded.userid, function(isValid) {
                if (isValid) {
                    req.loggedUserId = decoded.userid;
                    next();
                } else {
                    res.status(401);
                    res.json({
                        status: 401,
                        message: 'Invalid token'
                    });
                }
            });
        } catch (err) {
            res.status(401);
            res.json({
                status: 401,
                message: 'Invalid token'
            });
        }
    } else {
        res.status(401);
        res.json({
            status: 401,
            message: 'Invalid token or key'
        });
    }
};
