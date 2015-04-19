/**
 * Created by carlovespa on 19/04/15.
 */
var mysql = require('mysql');
var config = require('../config.js');

// create a DB connection object (still not actually connected)
var connection = mysql.createConnection(config.dbInfo);

var categories = {
    getCategories: function (req, res) {
        connection.query('SELECT * FROM categories', function(err, result) {
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
    }
};

module.exports = categories;