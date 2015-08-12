/**
 * Created by christian on 7/24/2015.
 */
require('chai').should();
var Deck = require('../lib/deck.js');

describe('Deck creation', function () {
    it('creates a deck', function () {
        var deck = new Deck();
        deck.cards.should.have.length(56);
    })
});