/**
 * Created by carlovespa on 06/02/15.
 */

var express = require('express');
var router = express.Router();

var auth = require('./auth.js');
var registration = require('./registration.js');
var proposals = require('./proposals.js');
var ads = require('./ads.js');
var categories = require('./categories.js');

/*
routes that can be accessed by anyone
 */
router.post('/login', auth.login);
router.post('/signup', registration.signup);

/*
routes that can be accessed only by authenticated users
 */
router.post('/logout', auth.logout);

router.get('/api/proposalsOf/:userid', proposals.getByUserId);
router.get('/api/proposals/:adid/:lat/:lon', proposals.getByAdId);
router.get('/api/adsNearby/:lat/:lon/:limit', ads.getNearby);
router.get('/api/ads/:id', ads.getById);
router.get('/api/adsOf/:userid', ads.getByUserId);
router.get('/api/categories', categories.getCategories);

router.post('/api/ads', ads.postAd);
router.post('/api/proposals', proposals.postProposal);

/*
routes that can be accessed only by authenticated and authorized users
 */

// TODO

module.exports = router;
