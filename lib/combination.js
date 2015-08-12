/**
 * Created by christian on 7/24/2015.
 */

var Card = require('../lib/card.js');

function Combination(cards, alternativeId) {
    this.cards = cards.slice();
    // check that the combination is valid
    this.type = 'NONE';
    this.length = cards.length;
    this.playedBy = null;
    this.sort();
    this.alternative = {};
    if (cards.length === 1) {
        this.type = 'SINGLE';
        this.value = cards[0].getValue();
    }
    if (this.isPair()) {
        this.type = 'PAIR';
    }
    if (this.isTrio()) {
        this.type = 'TRIO';
    }
    if (this.isSteps()) {
        this.type = 'STEPS';
    }
    if (this.isFullHouse(alternativeId)) {
        this.type = 'FULLHOUSE';
    }
    if (this.isStraight(alternativeId)) {
        this.type = 'STRAIGHT';
    }
    if (this.isBomb()) {
        this.type = 'BOMB';
    }
    if (this.type === 'NONE' || this.value === undefined) {
        throw new Error('Invalid combination');
    }
}

Combination.prototype.isPair = function () {
    if (this.cards.length != 2) {
        return false;
    }
    if (this.cards[0].face === this.cards[1].face) {
        this.value = this.cards[0].getValue();
        return true
    }
    // dog, mahjong, phoenix, 2, 3... in that order
    if (this.cards[0].face === 'Phoenix' && this.cards[1].color !== 'Special') {
        this.value = this.cards[1].getValue();
        return true;
    }
    return false;
}

Combination.prototype.isTrio = function () {
    if (this.cards.length != 3) {
        return false;
    }
    if ((this.cards[0].face === this.cards[1].face || (this.cards[0].face === 'Phoenix' && this.cards[1].color !== 'Special')) && this.cards[1].face === this.cards[2].face) {
        this.value = this.cards[2].getValue();
        return true;
    }
    return false;
}

Combination.prototype.sort = function () {
    this.cards.sort(function (a, b) {
        if (a.face === 'Phoenix') {
            return -1;
        } else if (b.face === 'Phoenix') {
            return 1;
        } else {
            return (a.getValue() - b.getValue());
        }
    });
}

Combination.prototype.isSteps = function () {
    if ((this.cards.length % 2) !== 0) {
        // not an even number of cards
        return false;
    }
    if (this.cards.length < 4) {
        return false;
    }

    var uniq = this.cards.filter(function (item, pos, self) {
        for (var c = 0; c < self.length; c++) {
            if (item.face === self[c].face) {
                break;
            }
        }
        return c === pos;
    });
    var phoenixPresent = false;
    if (uniq[0].face === 'Phoenix') {
        phoenixPresent = true;
        uniq.splice(0, 1);
    }
    // is that a straight?
    var currentValue = uniq[0].getValue();
    for (var i = 1; i < uniq.length; i++) {
        if (uniq[i].getValue() !== currentValue + 1) {
            return false;
        }
        currentValue++;
    }

    var ofEach = {};
    this.cards.forEach(function (c) {
        if (ofEach[c.face]) {
            ofEach[c.face]++;
        } else {
            ofEach[c.face] = 1;
        }
    });

    var error = false;
    Object.keys(ofEach).forEach(function (k) {
        if (k !== 'Phoenix') {
            if (ofEach[k] == 2) {
            } else if (ofEach[k] == 1 && phoenixPresent) {
                // use the phoenix (only once)
                phoenixPresent = false;
            } else {
                error = true;
            }
        }
    });
    if (error) {
        return false;
    }
    // move the phoenix in the right place
    if (this.cards[0].face === 'Phoenix') {
        var p = this.cards.splice(0, 1)[0];
        for (var c = 0; c < this.cards.length; c += 2) {
            if (c + 1 === this.cards.length || this.cards[c].face !== this.cards[c + 1].face) {
                this.cards.splice(c, 0, p);
                break;
            }
        }
    }
    this.value = this.cards[this.cards.length - 1].getValue();
    return true;
}

Combination.prototype.isFullHouse = function (alternativeId) {
    if (this.cards.length !== 5) {
        return false;
    }

    // Manage phoenix
    var ofEach = {};
    this.cards.forEach(function (c) {
        if (ofEach[c.face]) {
            ofEach[c.face]++;
        } else {
            ofEach[c.face] = 1;
        }
    });
    if (ofEach['Phoenix']) {
        delete ofEach['Phoenix'];
    }

    if (Object.keys(ofEach).length == 2) {
        //pabbb paabb paaab aaabb aabbb
        //no    yes   no    no    no
        if (ofEach[Object.keys(ofEach)[0]] === ofEach[Object.keys(ofEach)[1]]) {
            // paabb phoenix
            this.alternative.cards = this.cards.slice();
            this.alternative.cards.push(this.alternative.cards.splice(0, 1)[0]);
            this.alternative.value = this.cards[this.cards.length - 1].getValue();
            this.value = this.cards[1].getValue();
        } else {
            if (ofEach[Object.keys(ofEach)[0]] === 3) {
                this.value = this.cards[1].getValue();
                if (this.cards[0].face === 'Phoenix') {
                    this.cards.push(this.cards.splice(0, 1)[0]);
                }
            } else {
                this.value = this.cards[this.cards.length - 2].getValue();
            }
        }
        if (typeof alternativeId !== 'undefined') {
            if (alternativeId === 0) {
                this.alternative = {};
            } else {
                this.cards = this.alternative.cards.slice();
                this.value = this.alternative.value;
                this.alternative = {};
            }
        }
        return true;
    }

    return false;
}

Combination.prototype.isStraight = function (alternativeId) {
    if (this.cards.length < 5) {
        return false;
    }
    if (this.cards[this.cards.length - 1].face === 'Dragon') {
        return false;
    }

    var phoenixPresent = false;
    if (this.cards[0].face === 'Phoenix') {
        phoenixPresent = true;
    }

    var insertPhoenix = -1;
    var currentValue = this.cards[(phoenixPresent ? 1 : 0)].getValue();
    for (var i = (phoenixPresent ? 2 : 1); i < this.cards.length; i++) {
        if (currentValue + 1 !== this.cards[i].getValue()) {
            if (phoenixPresent && currentValue + 2 === this.cards[i].getValue()) {
                insertPhoenix = i;
                currentValue += 2;//if the phoenix was inserted
                phoenixPresent = false;
            } else {
                return false;
            }
        } else {
            currentValue = this.cards[i].getValue();
        }
    }
    if (insertPhoenix >= 0) {
        this.cards.splice(insertPhoenix - 1, 0, this.cards.splice(0, 1)[0]);
    }
    // if there is still the phoenix, it should be used at the begining or at the end
    if (phoenixPresent) {
        if (this.cards[this.cards.length - 1].face === 'A') {
            // if ends with an As, only one possibility with phoenix at start
            this.value = this.cards[this.cards.length - 1].getValue();
        } else if (this.cards[1].face === '2' || this.cards[1].face === 'Mahjong') {
            // if start with a 2 or a 1, only one possibility with phoenix at the end
            this.cards.push(this.cards.splice(0, 1)[0])
            this.value = this.cards[this.cards.length - 2].getValue() + 1;
        } else if (true) { //fixme
            this.alternative.cards = this.cards.slice();
            this.alternative.cards.push(this.alternative.cards.splice(0, 1)[0]);
            this.alternative.value = this.alternative.cards[this.alternative.cards.length - 2].getValue() + 1;
            this.value = this.cards[this.cards.length - 1].getValue();
        }

        if (typeof alternativeId !== 'undefined') {
            if (alternativeId === 0) {
                this.alternative = {};
            } else {
                this.cards = this.alternative.cards.slice();
                this.value = this.alternative.value;
                this.alternative = {};
            }
        }
        return true;
    }
    this.value = this.cards[this.cards.length - 1].getValue();
    return true;
}


Combination.prototype.isBomb = function () {
    for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[0].color === 'Special') {
            return false;
        }
    }
    if (this.cards.length === 4) {
        // 4 of a kind
        var currentFace = this.cards[0].face;
        for (var i = 1; i < this.cards.length; i++) {
            if (currentFace !== this.cards[i].face) {
                return false;
            }
        }
        this.value = this.cards[0].getValue();
        return true;
    }
    else if (this.cards.length >= 5) {
        // straight flush
        if (!this.isStraight()) {
            return false;
        }
        var currentColor = this.cards[0].color;
        for (var i = 1; i < this.cards.length; i++) {
            if (currentColor !== this.cards[i].color) {
                return false;
            }
        }
        this.cards[this.cards.length - 1].getValue();
        return true;
    }
    return false;
}

Combination.prototype.toString = function () {
    var text = '';
    text += this.cards.join(', ');
    return text;
}

Combination.prototype.getPoints = function () {
    var points = 0;
    this.cards.forEach(function (card) {
        points += card.getPoints();
    });
    return points;
}

Combination.prototype.isBetter = function (combination) {
    if (combination.cards.length === 0) {
        return true;
    } else {
        if (combination.type === 'BOMB' && this.type !== 'BOMB') {
            return false;
        }
        if (this.type === 'BOMB') {
            if (combination.type === 'BOMB') {
                if (this.length === combination.length) {
                    return combination.value < this.value;
                } else {
                    return combination.length < this.length;
                }
            } else {
                // bomb auto beats anything not bomb
                return true;
            }
        }
        if (this.type === combination.type && this.length === combination.length) {
            if (this.type === 'SINGLE' && this.cards[0].face === 'Phoenix') {
                return (combination.cards[0].face !== 'DRAGON');
            } else {
                return (combination.value < this.value);
            }
        }
    }
    return false;
}

Combination.prototype.fullfillsWish = function (wish) {
    for (var c = 0; c < this.cards.length; c++) {
        if (wish === this.cards[c].face) {
            return true;
            break;
        }
    }
    return false;
}

Combination.prototype.canFullfillWish = function (wish, hand) {
    var handCopy = hand.slice();
    handCopy.sort(function (a, b) {
        return a.getValue() - b.getValue();
    });
    var theWishedCard = null;
    for (var c = 0; c < handCopy.length; c++) {
        if (wish === handCopy[c].face) {
            theWishedCard = handCopy.splice(c, 1)[0];
            break;
        }
    }
    if (theWishedCard === null) {
        return false;
    }
    var combinationType = this.type;
    var combinationLength = this.length;
    if (hand.length < combinationLength) {
        return false;
    }

    // either in a 4 of a kind OR in a straight flush
    // 4 of a kind?
    var cards = [theWishedCard];
    while (cards.length < 4) {
        var c = pickValue(theWishedCard.face, handCopy);
        if (c !== null) {
            cards.push(c);
        } else {
            break;
        }
    }
    // is this 4 of a kind better?
    if (cards.length === 4 && (new Combination(cards)).isBetter(this)) {
        return true;
    } else {

        var handCopy = hand.slice();
        handCopy.sort(function (a, b) {
            return a.getValue() - b.getValue();
        });
        var theWishedCard = null;
        for (var c = 0; c < handCopy.length; c++) {
            if (wish === handCopy[c].face) {
                theWishedCard = handCopy.splice(c, 1)[0];
                break;
            }
        }
        var cards = [theWishedCard];

        // grow a straight flush around
        var currentValue = theWishedCard.getValue() - 1;
        while (true) {
            var c = pickValueAndColor(currentValue, theWishedCard.color, handCopy);
            if (c === null) {
                break;
            }
            cards.push(c);
            currentValue--;
        }
        // steps up
        var currentValue = theWishedCard.getValue() + 1;
        while (true) {
            var c = pickValueAndColor(currentValue, theWishedCard.color, handCopy);
            if (c === null) {
                break;
            }
            cards.push(c);
            currentValue++;
        }
        cards.sort(function (a, b) {
            return a.getValue() - b.getValue();
        });
        if (cards.length >= 5 && (new Combination(cards)).isBetter(this)) {
            return true
        }
    }

    var handCopy = hand.slice();
    handCopy.sort(function (a, b) {
        return a.getValue() - b.getValue();
    });
    var theWishedCard = null;
    for (var c = 0; c < handCopy.length; c++) {
        if (wish === handCopy[c].face) {
            theWishedCard = handCopy.splice(c, 1)[0];
            break;
        }
    }

    switch (combinationType) {
        case 'SINGLE':
            var theSingle = new Combination([theWishedCard]);
            return theSingle.isBetter(this);
            break;
        case 'PAIR':
            for (var c = 0; c < handCopy.length; c++) {
                if (handCopy[c].face === theWishedCard.face || handCopy[c].face === 'Phoenix') {
                    var thePair = new Combination([theWishedCard, handCopy[c]]);
                    return thePair.isBetter(this);
                }
            }
            break;
        case 'TRIO':
            var cards = [theWishedCard];
            var c = pickValueOrPhoenix(theWishedCard.face, handCopy);
            if (c !== null) {
                cards.push(c);
            }
            c = pickValueOrPhoenix(theWishedCard.face, handCopy);
            if (c !== null) {
                cards.push(c);
            }
            try {
                var theTrio = new Combination(cards);
                return theTrio.isBetter(this);
            } catch (e) {
                return false;
            }
            break;
        case 'STEPS':
            var cards = [theWishedCard];
            var c = pickValueOrPhoenix(theWishedCard.face, handCopy);
            if (c !== null) {
                cards.push(c);
            }
            if (cards.length !== 2) {
                return false;
            }
            //I have a pair, build the longest steps possible around it
            // steps down
            var currentValue = theWishedCard.getValue() - 1;
            while (true) {
                var c1 = pickValueOrPhoenix(currentValue, handCopy);
                if (c1 === null) {
                    break;
                }
                var c2 = pickValueOrPhoenix(currentValue, handCopy);
                if (c2 === null) {
                    break;
                }
                //commit two at a time
                cards.push(c1);
                cards.push(c2);
                currentValue--;
            }
            // I have the longest down steps (maybe only a pair)
            // steps up
            var currentValue = theWishedCard.getValue() + 1;
            while (true) {
                var c1 = pickValueOrPhoenix(currentValue, handCopy);
                if (c1 === null) {
                    break;
                }
                var c2 = pickValueOrPhoenix(currentValue, handCopy);
                if (c2 === null) {
                    break;
                }
                //commit two at a time
                cards.push(c1);
                cards.push(c2);
                currentValue++;
            }
            // I now have the longest steps around the wish
            cards.sort(function (a, b) {
                return a.getValue() - b.getValue();
            });
            return (cards[cards.length - 1].getValue() > this.value && cards.length >= this.length);
            break;
        case 'FULLHOUSE':
            var cards = [theWishedCard];
            var c = pickValueOrPhoenix(theWishedCard.face, handCopy);
            if (c === null) {
                return false;
            }
            cards.push(c);

            //we have a pair is there a trio high enough?
            // cards are ordered, so let's search for 3 cards following high enough that are the same
            // if there is a phoenix, I only need 2
            var p = pickPhoenix(handCopy);
            if (p !== null) {
                //phoenix, need 2 more
                var i = 0;
                while (handCopy[i].getValue() < this.value + 1) {
                    i++
                }
                i += 1;
                while (i < handCopy.length) {
                    if (handCopy[i].getValue() === handCopy[i - 1].getValue()) {
                        return true
                    }
                    i++;
                }
            } else {
                //no phoenix, need 3 more
                var i = 0;
                while (handCopy[i].getValue() < this.value + 1) {
                    i++
                }
                i += 2;
                while (i < handCopy.length) {
                    if (handCopy[i].getValue() === handCopy[i - 1].getValue() && handCopy[i - 1].getValue() === handCopy[i - 2].getValue()) {
                        return true
                    }
                    i++;
                }
            }
            //no high enough trio with the pair
            var c1 = pickValueOrPhoenix(theWishedCard.face, handCopy);
            if (c1 === null) {
                return false;
            } else {
                if (!(theWishedCard.getValue() > this.value)) {
                    // the trio is not high enough
                    return false;
                } else {
                    //find a pair
                    var p = pickPhoenix(handCopy);
                    if (p !== null) {
                        // phoenix just check if there is another card not special
                        var i = 0;
                        while (i < handCopy.length) {
                            if (handCopy[i].face !== 'Special') {
                                return true
                            }
                            i++;
                        }
                    } else {
                        // no phoenix, find a pair
                        var i = 1;
                        while (i < handCopy.length) {
                            if (handCopy[i].getValue() === handCopy[i - 1].getValue()) {
                                return true
                            }
                            i++;
                        }
                    }
                }
            }
            break;
        case 'STRAIGHT':
            //same as for steps, construct longest around the card then compare length and max
            // steps down
            var currentValue = theWishedCard.getValue() - 1;
            while (true) {
                var c = pickValueOrPhoenix(currentValue, handCopy);
                if (c === null) {
                    break;
                }
                cards.push(c);
                currentValue--;
            }
            // steps up
            var currentValue = theWishedCard.getValue() + 1;
            while (true) {
                var c = pickValueOrPhoenix(currentValue, handCopy);
                if (c === null) {
                    break;
                }
                cards.push(c);
                currentValue++;
            }
            cards.sort(function (a, b) {
                return a.getValue() - b.getValue();
            });
            return (cards[cards.length - 1].getValue() > this.value && cards.length >= this.length);
            break;
        case 'BOMB':
            break;
    }
    return false;
}

function pickValueOrPhoenix(value, array) {
    if (typeof value === 'string') {
        var c = new Card(value, 'Jade');
        value = c.getValue();
    }
    for (var c = 0; c < array.length; c++) {
        if (array[c].getValue() === value) {
            return array.splice(c, 1)[0];
        }
    }
    for (var c = 0; c < array.length; c++) {
        if (array[c].face === 'Phoenix') {
            return array.splice(c, 1)[0];
        }
    }
    return null;
}

function pickValue(value, array) {
    if (typeof value === 'string') {
        var c = new Card(value, 'Jade');
        value = c.getValue();
    }
    for (var c = 0; c < array.length; c++) {
        if (array[c].getValue() === value) {
            return array.splice(c, 1)[0];
        }
    }
    return null;
}
function pickValueAndColor(value, color, array) {
    if (typeof value === 'string') {
        var c = new Card(value, 'Jade');
        value = c.getValue();
    }
    for (var c = 0; c < array.length; c++) {
        if (array[c].getValue() === value && array[c].color === color) {
            return array.splice(c, 1)[0];
        }
    }
    return null;
}

function pickBetterValueOrPhoenix(value, array) {
    if (typeof value === 'string') {
        var c = new Card(value, 'Jade');
        value = c.getValue();
    }
    for (var c = 0; c < array.length; c++) {
        if (array[c].getValue() > value) {
            return array.splice(c, 1)[0];
        }
    }
    for (var c = 0; c < array.length; c++) {
        if (array[c].face === 'Phoenix') {
            return array.splice(c, 1)[0];
        }
    }
    return null;
}

function pickPhoenix(array) {
    for (var c = 0; c < array.length; c++) {
        if (array[c].face === 'Phoenix') {
            return array.splice(c, 1)[0];
        }
    }
    return null;
}

module.exports = Combination;