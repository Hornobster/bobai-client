/**
 * Created by carlovespa on 06/02/15.
 */
var bcrypt = require('bcrypt');
var mysql = require('mysql');
var config = require('../config.js');

// create a DB connection object (still not actually connected)
var connection = mysql.createConnection(config.dbInfo);

var registration = {
    signup: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';
        var email = req.body.email || '';
        var phone = req.body.phone || '';

        // check if we actually received the data
        if (username === '' || password === '' || email === '' || phone === '') {
            res.status(400);
            res.json({
                status: 400,
                message: 'Invalid data'
            });
            return;
        }

        // validation patterns
        var emailPat = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        var usernamePat = /^[A-Za-z0-9 _]{8,30}$/; // alphanumeric with space and underscore, min 8 max 30 chars
        var passwordPat = /^[A-Za-z0-9!@#$&*]{8,50}$/; // alphanumeric with specials (!@#$&*), min 8 max 50 chars

        if (emailPat.test(email) && usernamePat.test(username) && passwordPat.test(password)) { // email, username and password are valid
            var hash = bcrypt.hashSync(password, 8);

            var user = {
                username: username,
                email: email,
                password: hash,
                phone: phone.replace(/\s+/g, '') // remove whitespaces
            };

            // add user data to DB
            connection.query('INSERT INTO users SET ?', user, function (err, result) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') { // username, email or phone number not available
                        // investigate
                        // TODO error checking
                        connection.query('SELECT username FROM users WHERE username = ?', user.username, function(err, resUser) {
                            connection.query('SELECT email FROM users WHERE email = ?', user.email, function(err, resEmail) {
                                connection.query('SELECT phone FROM users WHERE phone = ?', user.phone, function(err, resPhone) {
                                    var duplicates = {
                                        username: resUser.length > 0,
                                        email: resEmail.length > 0,
                                        phone: resPhone.length > 0
                                    };

                                    res.status(400);
                                    res.json({
                                        status: 400,
                                        message: 'Username, email or phone number already in use!',
                                        duplicates: duplicates
                                    });
                                });
                            });
                        });
                    } else { // other error
                        res.status(500);
                        res.json({
                            status: 500,
                            message: 'Oops something wrong happened!',
                            error: err
                        });
                    }
                } else {
                    res.status(200);
                    res.json({
                        status: 200,
                        message: 'User successfully registered!'
                    });
                }
            });
        } else { // email, username and password are invalid
            res.status(400);
            res.json({
                status: 400,
                message: 'Invalid data'
            });
        }
    }
};

module.exports = registration;
