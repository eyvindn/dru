var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var express = require('express')
var session = require('express-session')


var nano = require('nano')('http://localhost:5984');
var db_name = "dkyk";
var db = nano.use(db_name);

function insert_path(path, tried) {
  db.insert(path,
    function (error,http_body,http_headers) {
      if(error) {
        if(error.message === 'no_db_file'  && tried < 1) {
            // create database and retry
            return nano.db.create(db_name, function () {
              insert_doc(path, tried+1);
            });
          }
          else { return console.log(error); }
        }
        console.log(http_body);
      });
}

var routes = require('./routes/index');
var users = require('./routes/users');
var strokes = require('./routes/api/strokes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

passport.use(new FacebookStrategy({
    clientID: 709079392516312,
    clientSecret: "c4a5c7499e9ab8918ab2e146a330edff",
    callbackURL: "http://dkyk.eyvindniklasson.se/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    user = {id: profile.id};
//    User.findOrCreate(..., function(err, user) {
//      if (err) { return done(err); }
//      done(null, user);
//    });
  done(null, user);
  }
));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'keyboard cat', saveUninitialized: true, resave: true}))
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use('/', routes);
app.use('/users', users);
app.use('/api/strokes', strokes);

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { session: true, successRedirect: '/',
                                      failureRedirect: '/login' }));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
