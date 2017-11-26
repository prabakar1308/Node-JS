var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
const Dishes = require('./dishes');
const User = require('./user');

var Favourite = new Schema({
    user : User,
    favouriteDishes : [Dishes]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('Favourite', Favourite);