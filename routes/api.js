/**
 * Created by christian on 7/25/2015.
 */
var express = require('express');
var router = express.Router();

var Game = require('../lib/game');
var Hand = require('../lib/hand');
var Deck = require('../lib/deck');
var Card = require('../lib/card');
var allGames = {};

function getBodyParam(req, paramName) {
    if (typeof req.body[paramName] !== 'undefined') {
        return req.body[paramName];
    } else {
        throw new Error('Param \'' + paramName + '\' not found');
    }
}

router.get('/myGame', function (req, res, next) {
    if (typeof req.session.gameId !== 'undefined') {
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } else {
        res.json(anonymiseAllGames(allGames));
    }
});

function anonymiseAllGames(allGames) {
    var anonymisedGames = {}
    Object.keys(allGames).forEach(function (key) {
        anonymisedGames[key] = allGames[key].publicData();
    });
    return anonymisedGames;
}

router.post('/joinGame', function (req, res, next) {
    try {
        if (typeof req.session.gameId !== 'undefined') {
            throw new Error('Already in a game');
        }
        var gameId = getBodyParam(req, 'gameId');
        var position = getBodyParam(req, 'position');
        allGames[gameId].addPlayer(req.session.name, position);
        req.session.position = parseInt(position);
        req.session.gameId = gameId;
        allGames[gameId].tick();
        res.json(allGames[gameId].publicData(req.session.position));
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/login', function (req, res, next) {
    try {
        if (req.body.name === '') {
            if (typeof req.session.name === 'undefined') {
                // req.session.name = 'player-' + (Math.floor(Math.random() * 10000) + 0);
                throw new Error('No valid player name');
            }
        } else {
            req.session.name = req.body.name;
        }
        res.json({});
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/createGame', function (req, res, next) {
    try {
        if (typeof req.session.gameId !== 'undefined') {
            throw new Error('Already in a game');
        }
        var points = parseInt(req.body.pointLimit);
        if (isNaN(points) || points <= 0) {
            points = 500;
        }
        var allKeys = Object.keys(allGames);
        req.session.gameId = allKeys.length > 0 ? parseInt(allKeys[allKeys.length - 1]) + 1 : 0;
        if (req.body.gameName === '' || typeof req.body.gameName === 'undefined') {
            req.body.gameName = 'Game-' + req.session.gameId;
        }
        allGames[req.session.gameId] = new Game(req.body.gameName, points);
        //auto-join created game
        req.session.position = 0;
        allGames[req.session.gameId].addPlayer(req.session.name, 0);
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/give', function (req, res, next) {
    try {
        var from = allGames[req.session.gameId].players[req.session.position];
        if (from.hand.length !== 14) {
            throw new Error('Player has already given cards')
        }
        var transfers = req.body.transfers;
        if (transfers.length !== 3) {
            throw new Error('Player must give exactly 3 cards')
        }
        for (var o = 0; o < transfers.length; o++) {
            var theCard = new Card(transfers[o].card);
            if (from.cardIndex(theCard) === -1) {
                throw new Error('Player trying to give cards he does not have');
            }
        } //fixme detect trying to give twice the same card
        for (var o = 0; o < transfers.length; o++) {
            var theCard = new Card(transfers[o].card);
            var to = allGames[req.session.gameId].players[transfers[o].to];
            from.removeCard(theCard);
            to.transferCards.push({card: theCard, from: from.position});
        }
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/accept', function (req, res, next) {
    if (allGames[req.session.gameId].state === 'ACCEPTING') {
        allGames[req.session.gameId].players[req.session.position].acceptTransfer();
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } else {
        res.json({error: 'Not there yet'});
    }
});

router.post('/play', function (req, res, next) {
    if (allGames[req.session.gameId].state === 'PLAY') {
        var cards = new Array();
        if (req.body.cards && req.body.cards.length) {
            for (var c = 0; c < req.body.cards.length; c++) {
                cards.push(new Card(req.body.cards[c]));
            }
        }
        var alternativeId = req.body.alternativeId;
        var wish = req.body.wish;
        try {
            allGames[req.session.gameId].players[req.session.position].play(cards, allGames[req.session.gameId].lastHand(), alternativeId, wish);
            allGames[req.session.gameId].tick();
            res.json(allGames[req.session.gameId].publicData(req.session.position));
        } catch (e) {
            if (e.xtype === 'ALTERNATIVE') {
                res.json({error: e.message, alternatives: e.xalternatives});
            } else if (e.xtype === 'WISH') {
                res.json({error: e.message, wish: 'needed'});
            } else {
                res.json({error: e.message});
            }
        }
    } else {
        res.json({error: 'Game not started yet'});
    }
});

router.post('/pass', function (req, res, next) {
    try {
        allGames[req.session.gameId].playerPass(allGames[req.session.gameId].lastHand(), allGames[req.session.gameId].players[req.session.position])
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/callTichu', function (req, res, next) {
    try {
        allGames[req.session.gameId].players[req.session.position].callTichu(allGames[req.session.gameId].lastHand());
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/giveDragon', function (req, res, next) {
    try {
        var to = allGames[req.session.gameId].players[req.body.to];
        allGames[req.session.gameId].players[req.session.position].giveTheDragon(allGames[req.session.gameId].lastHand(), to);
        allGames[req.session.gameId].tick();
        res.json(allGames[req.session.gameId].publicData(req.session.position));
    } catch (e) {
        res.json({error: e.message});
    }
});

router.post('/leaveGame', function (req, res, next) {
    try {
        allGames[req.session.gameId].getPlayerAtPosition(req.session.position).name = '';
        allGames[req.session.gameId].getPlayerAtPosition(req.session.position).seatTaken = false;
        var seatsTaken = 0;
        for (var p = 0; p < allGames[req.session.gameId].players.length; p++) {
            if (allGames[req.session.gameId].players[p].seatTaken) {
                seatsTaken++;
            }
        }
        if (seatsTaken === 0) {
            delete allGames[req.session.gameId]
        }
        delete req.session.position;
        delete req.session.gameId;
        res.json({});
    } catch (e) {
        res.json({error: e.message});
    }
});


module.exports = router;
