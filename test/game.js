/**
 * Created by christian on 5/7/2020.
 */

require('chai').should();
var Game = require('../lib/game.js');
var Card = require('../lib/card.js');
var Hand = require('../lib/hand.js');
var Combination = require('../lib/combination.js');

describe('Game mecanics', function () {
    it('does not auto pass with dragon', function () {
        var game = new Game();
        game.state = 'PLAY'
        game.players.forEach((p) => {
            p.hand = [new Card('Dragon')];
        });
        hand = new Hand();
        hand.turn = 1;
        game.hands.push(hand);
        game.players[1].hand = [];
        game.players[1].mustGiveDragonAway = true;
        game.tick();
    });
    it('can play bomb out of turn', function () {
        var game = new Game();
        game.state = 'PLAY'
        hand = new Hand();
        hand.turn = 2;
        game.hands.push(hand);
        var cardsNotBomb = new Array(new Card('Q', 'Sword'), new Card('Q', 'Star'), new Card('K', 'Jade'), new Card('K', 'Pagoda'));
        var cardsBomb = new Array(new Card('K', 'Sword'), new Card('K', 'Star'), new Card('K', 'Jade'), new Card('K', 'Pagoda'));
        game.players[1].hand.push(...cardsNotBomb);
        console.debug(game);
        (function () {
            game.players[1].play(cardsNotBomb, game.lastHand(), null, null);
        }).should.throw(/Not this player's turn/);
        game.hands[0].combinations.push(new Combination(cardsNotBomb));
        game.players[3].hand.push(...cardsBomb);
        game.players[3].play(cardsBomb, game.lastHand(), null, null);
    });
});