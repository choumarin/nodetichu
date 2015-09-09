/**
 * Created by christian on 9/8/2015.
 */

var io = require('socket.io')() // yes, no server arg here; it's not required
// attach stuff to io
module.exports = io

//var ios = require('express-socket.io-session');
//io.use(ios(session));

io.on('connection', function (socket) {
    console.log('Client connected...');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

