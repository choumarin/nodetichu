/**
 * Created by christian on 9/8/2015.
 */
var io = require('socket.io')()
var sharedsession = require("express-socket.io-session");

module.exports = io

var session = require("../app").session;

io.use(sharedsession(session));

io.on('connection', function (socket) {
    console.log('Client connected...');

    socket.on('disconnect', function () {
        console.log('session ' + JSON.stringify(socket.handshake.session));
        console.log('user disconnected');
    });
});

