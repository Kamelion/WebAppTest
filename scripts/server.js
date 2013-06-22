'use strict';

/*jshint node:true, es5:true*/

// Modules to load
var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    expressValidator = require('express-validator'),
    mongodb = require('mongodb'),
    MongoStore = require('connect-mongo')(express),
    http = require('http'),
    https = require('https'),
    url = require('url'),
    bcrypt = require('bcrypt'),

    // Create the express server and define startup ports
    app = express(),
    httpPort = 8000,
    httpsPort = 9000;

// Read in key and certificate for HTTPS
var hskey = fs.readFileSync('key.pem').toString();
var hscert = fs.readFileSync('cert.pem').toString();

// Set up HTTPS options
var options = {
  key: hskey,
  cert: hscert
};

// MongoDB session configuration
var config = {
  db: {
    db: 'sportsDB',
    host: 'localhost',
    port: 27017
  },
  secret: '8asdf02asdf8c0a03ja0as83y8m2'
}

var cookieAge = 1000*60*3; // 3 minutes for test purposes

// Deprecated because HTTP is for bitches
/* http.createServer(app).listen(httpPort, function () {
  console.log("Express server listening on port: " + httpPort);
}); */

https.createServer(options, app).listen(httpsPort, function () {
  console.log("Express https server listening on port: " + httpsPort);
});

// mongodb server setup
var dbserver = new mongodb.Server('localhost', 27017, {auto_reconnect: true}),
    db = new mongodb.Db('sportsDB', dbserver, {safe: false});

// parse original data
// var filedata = JSON.parse(fs.readFileSync(path.join(__dirname, '/../app/json/data.json'), 'utf8'));

// Initialize startup ports
httpPort = process.env.PORT || httpPort;
httpsPort = process.env.PORT || httpsPort;

var appPath = path.join(__dirname, '/../app'),
    indexPath = path.join(__dirname, '/../app/index.html');

// Configure the express app
app.configure(function(){
  app.set('port', httpPort);
  app.set('views', appPath);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(expressValidator());
  app.use(express.logger('dev'));
  app.use(express.static(appPath));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.secret,
    store: new MongoStore(config.db)
  }));
  app.use(app.router);
});

app.get('/app', function (req, res) {
  res.sendfile(indexPath);
});

app.get('/app/index.html', function (req, res) {
  res.sendfile(indexPath);
});

app.get('/getsession', function (req, res) {
  console.log(req.session);
  res.send(req.session);
});

app.get('/DBinfo', function (req, res) {
    req.session = null;
    queryallDB(function (result) {
      res.send(result);
    });
});

app.get('/logout', function (req, res) {
  req.session.cookie.maxAge = null;
  delete req.session.username;
  console.log(req.session);
  res.send(req.session);
});

app.post('/signin', function (req, res) {
  console.log(req.body);

  // User name validation
  req.assert('username', "Will not submit with field empty.").notEmpty();
  req.assert('username', "Length must be between 6 to 12 alphanumeric characters.").len(6, 12);
  req.assert('username', "Alphanumeric characters only.").is(/^[a-zA-Z0-9]{4,10}$/);
  // Password validation
  req.assert('password', "Will not submit with field empty.").notEmpty();

  // Sanitize data to strip out common xss attack vectors
  req.sanitize('username').xss();
  req.sanitize('password').xss();

  // Store the validation errors
  var errors = req.validationErrors();

  if (errors) {
    res.send(errors, 401);
    return;
  }

  var response = {
    username: req.body.username,
    remember: req.body.remember
  };

  queryUniqueUser({username: req.body.username}, function (result) {
    if (result.length === 0) {
      response.usererror = true;
      res.send(response, 401);
    } else {
      // Compare user entered password hashed with stored hash in the database
      bcrypt.compare(req.body.password, result[0].pass, function (err, isMatch) {

        if (isMatch) {
          // If remember me was selected, add age to the cookie for session persistence
          if (response.remember) {
            req.session.cookie.maxAge = cookieAge;
            req.session.username = req.body.username;
            console.log(req.session);
          }
          response.cookieAge = req.session.cookie.maxAge;
          res.send(response);
        } else {
          response.passerror = true;
          res.send(response, 401);
        }
      });
    }
  });
});

app.post('/checkuser', function (req, res) {
    queryUniqueUser(req.body, function (result) {
      res.send(result);  
    });
});

app.post('/register', function (req, res) {
  console.log(req.body);

  // User name validation
  req.assert('username', "Will not submit with field empty.").notEmpty();
  req.assert('username', "Length must be between 6 to 12 alphanumeric characters.").len(6, 12);
  req.assert('username', "Alphanumeric characters only.").is(/^[a-zA-Z0-9]{4,10}$/);
  // Email validation
  req.assert('email', "Will not submit with field empty.").notEmpty();
  req.assert('email', "Must be between 6 and 30 characters.").len(6, 30);
  req.assert('email', "Valid E-mail required.").isEmail();
  // Password validation
  req.assert('pass', "Will not submit with field empty.").notEmpty();
  req.assert('pass', "Password must be 8 characters or longer.").len(8);
  // Password confirm validation
  req.assert('pass2', "Password entered must match previous field.").equals(req.body.pass);

  // Sanitize data to strip out common xss attack vectors
  req.sanitize('username').xss();
  req.sanitize('email').xss();
  req.sanitize('pass').xss();
  req.sanitize('pass2').xss();

  // Store the validation errors
  var errors = req.validationErrors();

  if (errors) {
    res.send(errors, 401);
    return;
  }

  // Create query to check DB for existing user name or e-mail address
  var query = { $or: [{username: req.body.username}, {email: req.body.email}]};

  // Submit query
  queryUniqueUser(query, function (result) {
    // Add user if search is empty
    console.log(result);
    if (result.length === 0) {
      addNewUser(req.body, function (confirm) {
        console.log(confirm);
        req.session.cookie.maxAge = cookieAge;
        req.session.username = req.body.username;
        res.send(req.session);
      });
    } else {
      res.send("Username or E-mail already exists.", 401);
    }
  });
});

function addNewUser (newUser, promise) {
  
  // Open database connection
  db.open(function (err, db) {
    if (!err) {

      // Access db collection
      db.collection('users', function (err, collection) {
        
        // Generate salt and hash for password
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(newUser.pass, salt, function (err, hash) {

            // Set password field to new hash and delete password confirm property
            newUser.pass = hash;
            delete newUser.pass2;

            // Add newUser object to 'users' collection in database
            collection.insert(newUser, function (err, result) {
              // Close database
              db.close();

              promise(result);
            });
          });
        });
      });
    }
  });
}

function queryallDB (promise) {

  // open database connection
  db.open(function (err, db) {
    if (!err) {
      
      // access db collection
      db.collection('teams', function (err, collection) {

        // query all data
        collection.find().toArray(function (err, teamInfo) {
          // close database
          db.close();
          
          promise(teamInfo);
        });
      });
    }
  });
}

function queryUniqueUser (query, promise) {
  
  // open database connection
  db.open(function (err, db) {
    if (!err) {
      
      // access db collection
      db.collection('users', function (err, collection) {
        
        // query username to see if it already exists
        collection.find(query).toArray(function (err, queryresult) {
          
          // close database
          db.close();

          promise(queryresult);
        });
      });
    }
  });
}