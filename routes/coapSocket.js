var io = require('socket.io'),
    shepherd = require('coap-shepherd');

var coapSocket,
    relayStatus;

exports.initialize = function (server) {

    shepherd.on('ready', function () {
        console.log('>> coap-shepherd server start!');
        shepherd.permitJoin(300);
    });

    shepherd.on('ind', shepIndHdlr);

    shepherd.on('error', errHdlr);

    shepherd.start(function (err) {
        if (err) throw err;
    });

    io = io(server);

    io.on('connection', function (socket) {
        socket.on('req', socketReqHdlr);
    });
};

function errHdlr (err) {
    throw err;
}

function shepIndHdlr (ind) {
    var dev;

    switch(ind.type) {
        case 'registered':
            console.log('>> registered: ' + ind.msg.clientName);
            dev = shepherd.find(ind.msg.clientName);

            io.sockets.emit('shepInd', {type: 'registered', data: ind.msg.clientName});
            break;
        case 'update':
            console.log('>> update: ' + ind.msg.device);
            dev = shepherd.find(ind.msg.device);

            io.sockets.emit('shepInd', {type: 'update', data: ind.msg.device});
            break;
        case 'deregistered':
            console.log('>> deregistered: ' + ind.msg);

            io.sockets.emit('shepInd', {type: 'deregistered', data: ind.msg});
            break;
        case 'online':
            console.log('>> online: ' + ind.msg);
            dev = shepherd.find(ind.msg);

            io.sockets.emit('shepInd', {type: 'online', data: ind.msg});
            break;
        case 'offline':
            console.log('>> offline: ' + ind.msg);
            dev = shepherd.find(ind.msg);

            io.sockets.emit('shepInd', {type: 'offline', data: ind.msg});
            break;
        case 'notify':
            console.log('>> notify');
            dev = shepherd.find(ind.msg.device);

            io.sockets.emit('shepInd', {type: 'notify', data: ind.msg});
            break;
    }
}

function socketReqHdlr (msg) {
    switch(msg.type) {
        case '':

            break;
        case '':

            break;
        case '':
        
            break;
    }
}