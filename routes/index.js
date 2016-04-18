var express = require('express'),
    _ = require('lodash'),
    shepherd = require('coap-shepherd');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Coap-shepherd' });
});

router.get('/dev', function(req, res, next) {
    res.render('dev', { title: 'Coap-shepherd'});
});

router.get('/dev/:id', function(req, res, next) {
    var devName = req.params.id,
        devInfo = shepherd.find(devName);

    res.render('devInfo', { title: 'Coap-shepherd'});
});

router.get('/observe', function(req, res, next) {
    res.render('observe', { title: 'Coap-shepherd' });
});

router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Coap-shepherd' });
});

module.exports = router;
