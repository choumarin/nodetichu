/**
 * Created by christian on 7/24/2015.
 */

Deck = require('../lib/deck');

function Hand() {
    this.combinations = new Array();
    this.wish = null;
    this.turn = -1;
    this.value = 0;
    this.lastPlayer = 0;
    this.firstOutPosition = null;
}

Hand.prototype.toString = function () {
    return 'Turn: ' + this.turn + ', combinations: ' + this.combinations.join('|');
}

module.exports = Hand;