const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Favourites = require('../models/favourite');
var authenticate = require('../authenticate');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Favourites.findById(req.user._id)
    .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.create({user:req.user._id,favouriteDishes:req.body})
    .then((favourite) => {
        console.log('Dish Created ', favourite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Favourites.findById(req.user._id)
    .then((favourite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.findById(req.user._id)
    .then((favourite) => {
        if (favourite != null) {
            favourite.favouriteDishes.push(req.body);
            favourite.save()
            .then((favourite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourite);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.update({ "id":req.user._id},
    {$pull : { "favouriteDishes" :{"id":req.body.dishId} } } )
.then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
}, (err) => next(err))
.catch((err) => next(err));
});


module.exports = favouriteRouter;