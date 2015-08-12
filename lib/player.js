/**
 * Created by christian on 7/24/2015.
 */

var Combination = require('../lib/combination.js');
var Card = require('../lib/card.js');

function Player(position) {
    this.name = '';
    this.position = position;
    this.hand = new Array();
    this.transferCards = new Array();
    this.combinations = new Array();
    this.mustGiveDragonAway = false;
    this.seatTaken = false;
    this.calledTichu = '';
}

Player.prototype.newHand = function () {
    this.hand = [];
    this.transferCards = [];
    this.combinations = [];
    this.calledTichu = '';
}

Player.prototype.toString = function () {
    return this.name + '((' + this.hand.length + ') ' + this.hand.join(', ') + ')';
}

Player.prototype.play = function (cards, hand, alternativeId, wish) {
    // player must give the dragon before playing
    if (this.mustGiveDragonAway) {
        throw new Error('You must give the dragon away before playing');
    }

    var thisCombination = new Combination(cards, alternativeId);

    // if there is an alternative combination to play
    if (thisCombination.alternative.value) {
        var e = new Error('Multiple possibilities, please choose');
        e.xtype = 'ALTERNATIVE';
        e.xalternatives = [thisCombination.cards, thisCombination.alternative.cards];
        throw e;
    }

    // TODO check if there is a wish that should be fulfilled
    if (hand.wish !== null) {
        if (hand.combinations.length > 0) {
            if (hand.combinations[hand.combinations.length - 1].canFullfillWish(hand.wish, this.hand)) {
                if (!thisCombination.fullfillsWish(hand.wish)) {
                    throw new Error('Wish not fullfilled')
                }
            }
        } else {
            if (!thisCombination.fullfillsWish(hand.wish)) {
                for (var c = 0; c < this.hand.length; c++) {
                    if (this.hand[c].face === hand.wish) {
                        throw new Error('Wish not fullfilled')
                    }
                }
            }
        }
    }

    // ask for a wish
    var addTheWish = false;
    for (var c = 0; c < thisCombination.cards.length; c++) {
        if (thisCombination.cards[c].face === 'Mahjong') {
            if (!wish) {
                var e = new Error('Mahjong played, do you want to make a wish?');
                e.xtype = 'WISH';
                throw e;
            } else {
                if (wish === 'none') {
                    hand.wish = null;
                } else {
                    wish = '' + wish;
                    if (Card.getFaces().indexOf(wish) >= 0) {
                        addTheWish = true;
                    } else {
                        throw new Error('Can only wish for a normal card')
                    }
                }
            }
        }
    }

    // check player turn (bomb can be played out of turn)
    // TODO add a wait time before collection to enable bombing?
    if (this.position !== hand.turn) {
        if (thisCombination.type === 'BOMB' && (hand.combinations.length > 0 && hand.combinations[hand.combinations.length - 1].cards[0].face !== 'Dog')) {
            // another player can BOMB out of turn, but only if there is something on the table (not a dog)
            hand.turn = this.position;
        } else {
            throw new Error('Not this player\'s turn');
        }
    }
    // check that the player has the cards he wants to play
    var handCopy = this.hand.slice();
    for (var i = 0; i < cards.length; i++) {
        var found = false;
        for (var j = 0; j < handCopy.length; j++) {
            if (cards[i].equals(handCopy[j])) {
                handCopy.splice(j, 1);
                found = true;
                break; //for j
            }
        }
        if (!found) {
            throw new Error('Player does not have the cards he\'s trying to play');
        }
    }

    // check that the combination can be played on top of the hand
    if (hand.combinations.length) {
        if (hand.combinations[hand.combinations.length - 1].cards[0].face !== 'Dog') {
            if (!thisCombination.isBetter(hand.combinations[hand.combinations.length - 1])) {
                throw new Error('This combination is not better that the current one');
            }
        }
    }

    // Commit!

    if (hand.wish !== null && thisCombination.fullfillsWish(hand.wish)) {
        hand.wish = null;
    }
    if (addTheWish) {
        hand.wish = wish;
    }
    thisCombination.playedBy = this.position;
    if (thisCombination.type === 'SINGLE' && thisCombination.cards[0].face === 'Phoenix') {
        if (hand.combinations.length) {
            thisCombination.value = hand.combinations[hand.combinations.length - 1].cards[0].getValue() + 0.5;
        }
    }
    hand.combinations.push(thisCombination);

    // remove cards from the player's hand
    for (var i = 0; i < cards.length; i++) {
        this.removeCard(cards[i])
    }

    hand.lastPlayer = this.position;
    hand.turn = (hand.turn + 1) % 4;
    if (thisCombination.type === 'SINGLE' && thisCombination.cards[0].face === 'Dog') {
        hand.turn = (hand.turn + 1) % 4;
    }

    return true;
}

Player.prototype.pass = function (hand) {
    // check player turn
    if (this.position !== hand.turn) {
        throw new Error('Not this player\'s turn');
    }
    // Cannot pass if first play unless no more cards
    if (this.hand.length > 0 && (hand.combinations.length === 0 || hand.combinations[hand.combinations.length - 1].cards[0].face === 'Dog')) {
        throw new Error('Cannot pass at the beginning of the turn');
    }
    if (this.mustGiveDragonAway) {
        throw new Error('Please give the Dragon away');
    }

    if (hand.wish !== null) {
        if (hand.combinations.length > 0) {
            if (hand.combinations[hand.combinations.length - 1].canFullfillWish(hand.wish, this.hand)) {
                throw new Error('Wish not fullfilled')
            }
        } else {
            for (var c = 0; c < this.hand.length; c++) {
                if (this.hand[c].face === wish) {
                    throw new Error('Wish not fullfilled')
                }
            }
        }
    }

    hand.turn = (hand.turn + 1) % 4;
}

Player.prototype.giveTheDragon = function (hand, to) {
    //check flag and dragon in combinations
    if (!this.mustGiveDragonAway) {
        throw new Error('You don\'t have to give the Dragon away');
    }
    var lastCombination = hand.combinations[hand.combinations.length - 1];
    if (lastCombination.cards[0].face !== 'Dragon') {
        throw new Error('You didn\'nt win with the Dragon');
    }
    if (to.position === (this.position + 2) % 4) {
        throw new Error('You must give the Dragon to the other team');
    }
    while (hand.combinations.length > 0) {
        to.combinations.push(hand.combinations.shift());
    }
    this.mustGiveDragonAway = false;
}

Player.prototype.win = function (hand) {
    // give the dragon away
    var lastCombination = hand.combinations[hand.combinations.length - 1];
    if (lastCombination.cards[0].face === 'Dragon') {
        this.mustGiveDragonAway = true;
    } else {
        while (hand.combinations.length > 0) {
            this.combinations.push(hand.combinations.shift());
        }
    }
    hand.turn = this.position;
}


Player.prototype.acceptTransfer = function () {
    for (var c = 0; c < this.transferCards.length; c++) {
        this.hand.push(this.transferCards[c].card);
    }
    this.hand.sort(function (a, b) {
        return (a.getValue() - b.getValue());
    });
    this.transferCards = [];
}

Player.prototype.cardIndex = function (card) {
    for (var i = 0; i < this.hand.length; i++) {
        if (card.equals(this.hand[i])) {
            return i;
        }
    }
    return -1;
}

Player.prototype.removeCard = function (card) {
    var p = this.cardIndex(card);
    if (p >= 0) {
        this.hand.splice(p, 1);
    } else {
        throw new Error('Cannot remove a card that is not in the hand');
    }

}

Player.prototype.publicData = function (position) {
    var publicData = JSON.parse(JSON.stringify(this));
    publicData.hand = new Array(this.hand.length);
    for (var c = 0; c < publicData.transferCards.length; c++) {
        if (position !== publicData.transferCards[c].from) {
            publicData.transferCards[c].card = {};
        }
    }
    publicData.combinations.forEach(function (combination) {
        combination.cards.forEach(function (card) {
            card = {};
        });
    });
    return publicData;
}

Player.prototype.callTichu = function (hand) {
    if (this.hand.length === 14) {
        this.calledTichu = 'TICHU';
    } else {
        throw new Error('Can only call Tichu before playing a card');
    }
}

module.exports = Player;