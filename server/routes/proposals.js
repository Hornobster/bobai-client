/**
 * Created by carlovespa on 09/02/15.
 */

var mysql = require('mysql');
var config = require('../config.js');

// create a DB connection object (still not actually connected)
var connection = mysql.createConnection(config.dbInfo);

var proposals = {
    getByUserId: function(req, res) {
        connection.query('SELECT * FROM proposals WHERE userid = ?', req.params.userid, function(err, result) {
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

    getByAdId: function(req, res) {
        connection.query('SELECT * FROM proposals WHERE adid = ?', req.params.adid, function(err, result) {
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

    postProposal: function(req, res) {
        var adId = req.body.adId || '';
        var lon = req.body.lon || '';
        var lat = req.body.lat || '';

        if (adId === '' || lon === '' || lat === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        var proposal = {
            userid: req.loggedUserId,
            adid: adId,
            lat: lat * config.geo.lonLatDBScale,
            lon: lon * config.geo.lonLatDBScale
        };

        connection.query('INSERT INTO proposals SET ?', proposal, function(err, result) {
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
                    message: config.statusMessages.proposalPostSuccess,
                    proposalId: result.insertId
                });
            }
        });
    }
};

module.exports = proposals;
