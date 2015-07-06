/**
 * Created by carlovespa on 08/02/15.
 */

var mysql = require('mysql');
var config = require('../config.js');

// create a DB connection object (still not actually connected)
var connection = mysql.createConnection(config.dbInfo);

var ads = {
    getByUserId: function(req, res) {
        var query = 'SELECT * FROM ads WHERE userid = ?';
        var queryParams = [req.params.userid];

        if (req.query.category) {
            query += ' AND category = ?';
            queryParams.push(req.query.category);
        }

        query += ' ORDER BY date_expires';

        connection.query(query, queryParams, function(err, result) {
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
        var lat = parseFloat(req.params.lat) || '';
        var lon = parseFloat(req.params.lon) || '';
        var limit = parseInt(req.params.limit) || '';

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

        var query = 'SELECT *, GCDist(?, ?, lat, lon) AS dist FROM ads';
        var queryParams = [lat, lon, limit];

        if (req.query.category) {
            query = 'SELECT *, GCDist(?, ?, lat, lon) AS dist FROM ads WHERE category = ?';
            queryParams = [lat, lon, req.query.category, limit];
        }

        query += ' HAVING dist < radius ORDER BY date_created LIMIT ?';

        connection.query(query, queryParams, function(err, result) {
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
        var homeDelivery = req.body.homeDelivery || 0;

        if (title === '' || description === '' || category === '' || radius === '' || lat === '' || lon === '' || duration === '' || homeDelivery === '' ||
            title.length > config.adsInfo.titleMaxLength || description.length > config.adsInfo.descriptionMaxLength || duration > config.adsInfo.maxDuration) {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        var date_expires = new Date();
        date_expires.setTime(date_expires.getTime() + (duration*60*60*1000));

        var ad = {
            userid: req.loggedUserId,
            title: title,
            description: description,
            category: category,
            radius: radius,
            lat: lat * config.geo.lonLatDBScale,
            lon: lon * config.geo.lonLatDBScale,
            date_expires: date_expires,
            homeDelivery: homeDelivery
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
