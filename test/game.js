/**
 * Created by christian on 5/7/2020.
 */

require('chai').should();
var Game = require('../lib/game.js');
var Card = require('../lib/card.js');
var Hand = require('../lib/hand.js');

describe('Game mecanics', function () {
    it('does not auto pass with dragon', function () {
        var game = new Game();
        game.state = 'PLAY'
        game.players.forEach((p) => {
            p.hand= [new Card('Dragon')];
        });
        hand = new Hand();
        hand.turn = 1;
        game.hands.push(hand);
        game.players[1].hand = [];
        game.players[1].mustGiveDragonAway = true;
        game.tick(); 
    });
});