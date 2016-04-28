var io = require('socket.io'),
    _ = require('lodash'),
    shepherd = require('coap-shepherd');

var coapSocket,
    relayStatus;

exports.initialize = function (server) {

    shepherd.on('ready', function () {
        console.log('>> coap-shepherd server start!');
        shepherd.permitJoin(3000);
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
    var dev,
        devInfo,
        pathArray;

    switch(ind.type) {
        case 'registered':
            console.log('>> registered: ' + ind.msg.clientName);
            dev = shepherd.find(ind.msg.clientName);
            devInfo = dev.dump();
            devInfo.status = dev.status;

            io.sockets.emit('shepInd', {type: 'registered', data: devInfo});
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
            pathArray = pathSlashParser(ind.msg.path);

            io.sockets.emit('shepInd', {type: 'notify', data: {
                    device: ind.msg.device,
                    oid: pathArray[0],
                    iid: pathArray[1],
                    rid: pathArray[2],
                    data: ind.msg.data
                }
            });
            break;
    }
}

function socketReqHdlr (msg) {
    var clientName = msg.data.clientName,
        oid = msg.data.oid,
        iid = msg.data.iid,
        rid = msg.data.rid,
        path = oid + '/' + iid + '/' + rid,
        dev,
        value,
        args = [],
        attrs = {};

    switch(msg.type) {
        case 'read':
            dev = shepherd.find(clientName);
            dev.read(path, function (err, rsp) {
console.log('>> ' + clientName + ' read: ' + rsp.status);
                if (rsp.status === '2.05') {
                    io.sockets.emit('shepInd', {type: 'notify', data: {
                            device: clientName,
                            oid: oid,
                            iid: iid,
                            rid: rid,
                            data: rsp.data 
                        }
                    });
                }
            });
            break;
        case 'write':
            dev = shepherd.find(clientName);
            value = msg.data.value;
            dev.write(path, value, function (err, rsp) {
console.log('>> ' + clientName + ' write: ' + rsp.status);
                if (rsp.status === '2.04') {
                    io.sockets.emit('shepInd', {type: 'notify', data: {
                            device: clientName,
                            oid: oid,
                            iid: iid,
                            rid: rid,
                            data: value 
                        }
                    });
                }
            });
            break;
        case 'execute':
            dev = shepherd.find(clientName);
            args = msg.data.value.split('/');
            dev.execute(path, args, function (err, rsp) {
console.log('>> ' + clientName + ' execute: ' + rsp.status);
                if (rsp.status === '2.04') {
                
                }
            });
            break;
        case 'discover':
            dev = shepherd.find(clientName);
            dev.discover(path, function (err, rsp) {
console.log('>> ' + clientName + ' discover: ' + rsp.status);
                if (rsp.status === '2.05') {
                    io.sockets.emit('discover' + ':' + path, { data: rsp.data.attrs });
                }
            });
            break;
        case 'writeAttrs':
            dev = shepherd.find(clientName);
            attrs = msg.data.value;

            _.forEach(attrs, function (val, key) {
                if(_.isNil(val) || val === '') {
                    delete attrs[key];
                } else
                    attrs[key] = Number(val);
            });

            attrs.pmin = attrs.pmin || 0;
            attrs.pmax = attrs.pmax || 60;

            dev.writeAttrs(path, attrs, function (err, rsp) {
console.log('>> ' + clientName + ' writeAttrs: ' + rsp.status);
                if (rsp.status === '2.04') {
                
                }
            });
            break;
        case 'observe':
            dev = shepherd.find(clientName);
            dev.observe(path, function (err, rsp) {
console.log('>> ' + clientName + ' observe: ' + rsp.status);
                if (rsp.status === '2.05') {
                    io.sockets.emit('observe' + ':' + path, { data: rsp.data.attrs });
                    io.sockets.emit('shepInd', {type: 'notify', data: {
                            device: clientName,
                            oid: oid,
                            iid: iid,
                            rid: rid,
                            data: rsp.data 
                        }
                    });
                }
            });
            break;
        case 'cancelObserve':
            dev = shepherd.find(clientName);
            dev.cancelObserve(path, function (err, rsp) {
console.log('>> ' + clientName + ' cancelObserve: ' + rsp.status);
                if (rsp.status === '2.05') {
                    io.sockets.emit('cancelObserve' + ':' + path);
                }
            });
            break;
    }
}

function pathSlashParser (path) {          // '/x/y/z'
    var pathArray = path.split('/');

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    return pathArray;       // ['x', 'y', 'z']
}
