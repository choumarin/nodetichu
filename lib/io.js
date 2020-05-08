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
            socket.on('disconnect', function () {
                socket.handshake.session.reload((err) => {
                    var gameId = socket.handshake.session.gameId;
                    if (typeof gameId !== 'undefined') {
                        if (socket.handshake.session.name) {
                            io.to("room-" + gameId).emit('chat', "[" + socket.handshake.session.name + "] " + " ** disconnected **");
                        }
                    }
                });
            });

            socket.on('chat', (data) => {
                socket.handshake.session.reload((err) => {
                    var gameId = socket.handshake.session.gameId;
                    socket.leaveAll();
                    if (typeof gameId !== 'undefined') {
                        socket.join("room-" + gameId, () => {
                            if (socket.handshake.session.name && data !== '') {
                                io.to("room-" + gameId).emit('chat', "[" + socket.handshake.session.name + "] " + data);
                            }
                        });
                    }
                });
            });
        }
    });
});

module.exports = io
