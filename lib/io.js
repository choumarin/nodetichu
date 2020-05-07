/**
 * Created by christian on 9/8/2015.
 */
var io = require('socket.io')()
var sharedsession = require("express-socket.io-session");

var session = require("../app").session;

io.use(sharedsession(session, {
    autoSave: true,
}));

io.on('connection', function (socket) {
    socket.handshake.session.reload((err) => {
        if (!socket.handshake.session.good) {
            socket.disconnect()
        } else {
            console.log('Client connected...');

            socket.on('disconnect', function () {
                console.log('user disconnected');
            });

            socket.on('chat', (data) => {
                socket.handshake.session.reload((err) => {
                    console.debug("socket sessionID " + socket.handshake.sessionID);
                    console.debug("session from socket view " + JSON.stringify(socket.handshake.session));
                    // console.debug("err : " + err);
                    var gameId = socket.handshake.session.gameId;
                    socket.leaveAll();
                    // var room = "Lobby";
                    if (typeof gameId !== 'undefined') {
                        socket.join("room-" + gameId, () => {
                            if (socket.handshake.session.name) {
                                io.to("room-" + gameId).emit('chat', "[" + socket.handshake.session.name + "] " + data);
                            }        
                        });
                        // room = "Game"
                    }
                });
            });
        }
    });
});

module.exports = io
