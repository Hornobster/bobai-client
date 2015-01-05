"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();

app.use(bodyParser.json({strict: true}));

app.post('/signup', function(req, res){
	var user = req.body.username;
	var mail = req.body.email;
	var password = req.body.password;
	var phone = req.body.phone;

	res.send();
});

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
