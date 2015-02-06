/**
 * Created by carlovespa on 06/02/15.
 */

var express = require('express');
var router = express.Router();

var auth = require('./auth.js');
var registration = require('./registration.js');
//var proposals = require('./proposals.js');
//var ads = require('./ads.js');
//var users = require('./users.js');

/*
routes that can be accessed by anyone
 */
router.post('/login', auth.login);
router.post('/signup', registration.signup);

/*
routes that can be accessed only by authenticated users
 */
router.post('/logout', auth.logout);

//router.get('/api/proposalsOf/:userid', proposals.getOwnedByUser);
//router.get('/api/proposals/:adid', proposals.getByAdId);
//router.get('/api/adsOf/:userid', ads.getOwnedByUser);
//router.get('/api/adsNear/:userid', ads.getNearUser);

router.post('/api/test', function(req, res) {
    res.json({headers: req.headers, body: req.body});
});

/*
routes that can be accessed only by authenticated and authorized users
 */

// TODO

module.exports = router;
