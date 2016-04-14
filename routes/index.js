var express = require('express'),
    _ = require('lodash'),
    React = require('react'),
    shepherd = require('coap-shepherd');

var a = React.createFactory(require('../public/components/devBox.jsx'));

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Coap-shepherd' });
});

router.get('/dev', function(req, res, next) {
    var devList = shepherd.devicesList();

    var aHtml = React.renderToString(a({}));

    res.render('dev', { title: 'Coap-shepherd', reactOutput: aHtml });
});

router.get('/dev/:id', function(req, res, next) {
    res.render('devInfo', { title: 'Coap-shepherd' });
});

router.get('/observe', function(req, res, next) {
    res.render('observe', { title: 'Coap-shepherd' });
});

router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Coap-shepherd' });
});

module.exports = router;
