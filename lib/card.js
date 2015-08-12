/**
 * Created by christian on 7/24/2015.
 */
var Faces = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A'
];

var Values = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
    'Dog': 0,
    'Mahjong': 1,
    'Phoenix': 1.5, //handle separately
    'Dragon': 15
}

var Colors = [
    'Jade',
    'Sword',
    'Pagoda',
    'Star'
];

var SpecialCards = [
    'Dog',
    'Mahjong',
    'Phoenix',
    'Dragon'
];

function Card(face, color) {
    if (typeof (face) === 'object') {
        var t = face;
        face = t.face;
        color = t.color;
    }
    if (SpecialCards.indexOf(face) >= 0) {
        this.face = face;
        this.color = 'Special';
        return;
    }
    if (Faces.indexOf(face) >= 0) {
        if (Colors.indexOf(color) >= 0) {
            this.face = face;
            this.color = color;
            return;
        }
    }
    throw new Error('This card does not exist: ' + face + ' of ' + color);
}

Card.prototype.getPoints = function () {
    if (this.face === '5') {
        return 5;
    } else if (this.face === '10' || this.face === 'K') {
        return 10;
    } else if (this.face === 'Phoenix') {
        return -25;
    } else if (this.face === 'Dragon') {
        return 25;
    }
    return 0;
}

Card.prototype.equals = function (card) {
    return (this.face === card.face && this.color === card.color);
}

Card.getFaces = function () {
    return Faces;
}

Card.getColors = function () {
    return Colors;
}

Card.getSpecialCards = function () {
    return SpecialCards;
}

Card.prototype.getValue = function () {
    return Values[this.face];
}

module.exports = Card;
