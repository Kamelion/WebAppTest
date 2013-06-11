'use strict';

/*jshint node:true, es5:true*/

// Modules to load
var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    mongodb = require('mongodb'),
    http = require('http'),
    url = require('url'),

// Create the express server and define a startup port
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    startupPort = 8000;

    server.listen(startupPort, function ( ) {
      console.log("Express server listening on port: " + startupPort);
    });

// mongodb server setup
var dbserver = new mongodb.Server('localhost', 27017, {auto_reconnect: true}),
    db = new mongodb.Db('sportsDB', dbserver, {safe: false});

// parse original data
// var filedata = JSON.parse(fs.readFileSync(path.join(__dirname, '/../app/json/data.json'), 'utf8'));

// Calculate the starup port
startupPort = process.env.PORT || startupPort;

var appPath = path.join(__dirname, '/../app'),
    indexPath = path.join(__dirname, '/../app/index.html');

// Configure the express app
app.configure(function(){
  app.set('port', startupPort);
  app.set('views', appPath);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.logger('dev'));
  app.use(express.static(appPath));
  app.use(app.router);
});

app.get('/app', function (req, res) {
  res.sendfile(indexPath);
});

app.get('/app/index.html', function (req, res) {
  res.sendfile(indexPath);
});

app.get('/DBinfo', function (req, res) {
  if (req.url === '/DBinfo') {
    queryallDB(function (result) {
      res.send(result);
    });
  }
});

app.post('/signin', function (req, res) {
  if (req.method === 'POST') {
    console.log(req.body);
    res.send(req.body);
  }
});

function queryallDB (promise) {

  // open database connection
  db.open(function (err, db) {
    if (!err) {
      
      // access db collection
      db.collection('teams', function (err, collection) {

        // query all data
        collection.find().toArray(function (err, teamInfo) {
          promise(teamInfo);
          // close database
          db.close();
        });
      });
    }
  });
}

// socket connected, now initialize
io.sockets.on('connection', function (socket) {
  
  socket.on('viewselect', function () {
    queryallDB(function (result) {
      socket.data = result;
      socket.emit('data', {info: socket.data});
    });
  });
});