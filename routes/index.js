var express = require('express'),
    _ = require('lodash'),
    shepherd = require('coap-shepherd');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Coap-shepherd' });
});

router.get('/dev', function(req, res, next) {
    var devList = shepherd.devList(),
        dev;

    _.forEach(devList, function (devInfo, clientName) {
        dev = shepherd.find(clientName);
        devInfo.status = dev.status;
    });

    res.render('dev', { title: 'Coap-shepherd', list: devList});
});

router.get('/dev/:id', function(req, res, next) {
    var devName = req.params.id,
        dev = shepherd.find(devName),
        devInfo = dev.dump();

    devInfo.status = dev.status;

    res.render('devInfo', { title: 'Coap-shepherd', info: devInfo });
});

router.get('/observe', function(req, res, next) {
    res.render('observe', { title: 'Coap-shepherd' });
});

router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Coap-shepherd' });
});

module.exports = router;
