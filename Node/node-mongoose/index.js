const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const express = require('express');
const bodyParser = require('body-parser');
const Dishes = require('./models/dishes');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const app = express();
app.use(bodyParser.json());
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
var db;
// Connection URL
const url = 'mongodb://localhost:27017/conFusion';
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