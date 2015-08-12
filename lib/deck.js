/**
 * Created by christian on 7/24/2015.
 */
var Card = require('../lib/card');

function Deck() {
    this.cards = new Array();
    var that = this;
    Card.getFaces().forEach(function (face) {
        Card.getColors().forEach(function (color) {
            that.cards.push(new Card(face, color));
        });
    });
    Card.getSpecialCards().forEach(function (sp) {
        that.cards.push(new Card(sp, ''));
    });
}

Deck.prototype.shuffle = function () {
    var m = this.cards.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = this.cards[m];
        this.cards[m] = this.cards[i];
        this.cards[i] = t;
    }
}

Deck.prototype.toString = function () {
    return this.cards.join(', ');
}

module.exports = Deck;
