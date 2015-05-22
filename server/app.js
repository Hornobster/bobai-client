/**
 * Created by carlovespa on 06/02/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var dbutils = require('./utils/dbutils.js');
var config = require('./config.js');
var fs = require('fs');
var multer = require('multer');
var path = require('path');

// Create the "uploads" folder if it doesn't exist
fs.exists(__dirname + '/uploads', function (exists) {
    if (!exists) {
        console.log('Creating directory ' + __dirname + '/uploads');
        fs.mkdir(__dirname + '/uploads', function (err) {
            if (err) {
                console.log('Error creating ' + __dirname + '/uploads');
                process.exit(1);
            }
        })
    }
});

var app = express();

app.use(bodyParser.json({strict: true}));

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.all('/api/*', [require('./middleware/validateRequest.js')]);
app.all('/logout', [require('./middleware/validateRequest.js')]);

/**
 * stuff for photo uploads
 */
app.post('/api/proposals', multer({
    dest: './uploads',
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    }
}));
app.use('/', require('./routes/index.js'));
app.use('/uploads/', express.static(path.join(__dirname, './uploads')));

var server = app.listen(process.env.PORT || config.serverInfo.defaultPort, function(){
    var host = server.address().address;
    var port = server.address().port;

    // initialize tokens DB
    dbutils.initializeDB();

    console.log('Example app listening at http://%s:%s', host, port);
});
