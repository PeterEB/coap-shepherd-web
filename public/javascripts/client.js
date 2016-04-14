var socket = io.connect('http://192.168.1.113:3000/');

socket.on('shepInd', function (ind) {
    var data = ind.data;

    switch (ind.type) {
        case 'registered':
        
            break;
        case 'update':

            break;
        case 'deregistered':

            break;
        case 'online':

            break;   
        case 'offline':

            break;
        case 'notify':

            break;
    }
});