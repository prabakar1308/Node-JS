const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Dishes = require('../models/dishes');
var authenticate = require('../authenticate');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Dishes.find({})
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
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
    res.end('PUT operation not supported on /dishes/comments');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.update({ "id":req.params.dishId},
        {$pull : { "comments" :[] } } )
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});


dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')    
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/comments'+ req.params.dishId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.update({"id":req.params.dishId,"comments.id":req.body.commentId,"comments.author":req.user}, {
        $set: {"comments":req.body}
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.update({ "id":req.params.dishId},
        {$pull : { "comments" :{"id":req.body.commentId,"author":req.user} } } )
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = dishRouter;