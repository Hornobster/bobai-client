/**
 * Created by carlovespa on 08/02/15.
 */

var mysql = require('mysql');
var config = require('../config.js');

// create a DB connection object (still not actually connected)
var connection = mysql.createConnection(config.dbInfo);

var ads = {
    getByUserId: function(req, res) {
        connection.query('SELECT * FROM ads WHERE userid = ?', req.params.userid, function(err, result) {
            if (err) {
                res.status(500);
                res.json({
                    status: 500,
                    message: config.statusMessages.internalError,
                    error: err
                });
            } else {
                res.status(200);
                res.json(result);
            }
        });
    },

    getById: function(req, res) {
        connection.query('SELECT * FROM ads WHERE id = ?', req.params.id, function(err, result) {
            if (err) {
                res.status(500);
                res.json({
                    status: 500,
                    message: config.statusMessages.internalError,
                    error: err
                });
            } else {
                res.status(200);
                res.json(result[0]);
            }
        });
    },

    getNearby: function(req, res) {
        var lat = req.body.lat || '';
        var lon = req.body.lon || '';
        var limit = req.body.limit || '';

        if (lat === '' || lon === '' || limit === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        lat *= config.geo.lonLatDBScale;
        lon *= config.geo.lonLatDBScale;

        connection.query('SELECT *, GCDist(?, ?, lat, lon) AS dist FROM ads HAVING dist < radius ORDER BY dist LIMIT ?', [lat, lon, limit], function(err, result) {
            if (err) {
                res.status(500);
                res.json({
                    status: 500,
                    message: config.statusMessages.internalError,
                    error: err
                });
            } else {
                res.status(200);
                res.json(result);
            }
        });
    },

    postAd: function(req, res) {
        var title = req.body.title || '';
        var description = req.body.description || '';
        var category = req.body.category || '';
        var radius = req.body.radius || '';
        var lat = req.body.lat || '';
        var lon = req.body.lon || '';
        var duration = req.body.duration || '';

        if (title === '' || description === '' || category === '' || radius === '' || lat === '' || lon === '' || duration === '' ||
            title.length > config.adsInfo.titleMaxLength || description.length > config.adsInfo.descriptionMaxLength || duration > config.adsInfo.maxDuration) {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        var date_expires = new Date();
        date_expires.setUTCHours(date_expires.getUTCHours() + duration);

        var ad = {
            userid: req.loggedUserId,
            title: title,
            description: description,
            category: category,
            radius: radius,
            lat: lat * config.geo.lonLatDBScale,
            lon: lon * config.geo.lonLatDBScale,
            date_expires: date_expires
        };

        connection.query('INSERT INTO ads SET ?', ad, function(err, result){
            if (err) {
                res.status(500);
                res.json({
                    status: 500,
                    message: config.statusMessages.internalError,
                    error: err
                });
            } else {
                res.status(200);
                res.json({
                    status: 200,
                    message: config.statusMessages.adPostSuccess,
                    adId: result.insertId
                });
            }
        });
    }
};

module.exports = ads;
