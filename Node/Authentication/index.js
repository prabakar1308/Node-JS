const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Dishes = require('./models/dishes');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const users = require('./routes/users');
var User = require('./models/user');
var config = require('./config');

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/users', users);


const url = config.mongoUrl;

const connect = mongoose.connect(url, {
  useMongoClient: true,
  /* other options */
});

connect.then((dbase) => {
  console.log("Connected correctly to server");
  db = dbase;
  app.listen(3000, () => {
    console.log('listening on 3000')
  }); 
}, (err) => { console.log(err); });