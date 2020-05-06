/**
 * Created by christian on 7/24/2015.
 */

Player = require('../lib/player');
Hand = require('../lib/hand');
Deck = require('../lib/deck');

var seedrandom = require('seedrandom');


function Game(name, pointLimit) {
    this.name = name;
    this.pointLimit = pointLimit;
    this.players = [new Player(0), new Player(1), new Player(2), new Player(3)]
    this.state = 'WAITING';
    this.hands = new Array();
    this.points = [0, 0];
    this.lastPlay = Date.now();
}

Game.prototype.getPlayerAtPosition = function (position) {
    for (var p = 0; p < this.players.length; p++) {
        if (this.players[p].position === position) {
            return this.players[p];
        }
    }
    return false;
}

Game.prototype.orderPlayers = function () {
    this.players.sort(function (a, b) {
        return a.position - b.position
    });
}

Game.prototype.addPlayer = function (name, position) {
    if (!this.getPlayerAtPosition(position).seatTaken) {
        this.players[position].name = name;
        this.players[position].seatTaken = true;
    } else {
        throw new Error('Max player reached or position already taken');
    }
}

Game.prototype.lastHand = function () {
    if (this.hands.length) {
        return this.hands[this.hands.length - 1];
    } else {
        return [];
    }
}

Game.prototype.publicData = function (position) {
    var publicData = JSON.parse(JSON.stringify(this));
    if (typeof position !== 'undefined') {
        for (var p = 0; p < this.players.length; p++) {
            if (p !== position) {
                publicData.players[p] = this.players[p].publicData(position);
            }
        }
        if (this.state !== 'ACCEPTING') {
            for (var i = 0; i < publicData.players[position].transferCards.length; i++) {
                publicData.players[position].transferCards[i].card = {};
            }
        }
        publicData.myPosition = position;
        publicData.hands = [];
        publicData.lastHand = this.lastHand();
    } else {
        for (var p = 0; p < this.players.length; p++) {
            publicData.players[p].hand = [];
            publicData.players[p].combinations = [];
            publicData.players[p].transferCards = [];
            publicData.players[p].mustGiveDragonAway = null;
        }
        publicData.hands = [];
        publicData.myposition = null;

    }
    return publicData;
}

Game.prototype.tick = function () {
    switch (this.state) {
        case 'WAITING':
            var allhere = 0;
            for (var p = 0; p < this.players.length; p++) {
                if (this.players[p].seatTaken) {
                    allhere++;
                }
            }
            if (allhere === 4) {
                this.orderPlayers();
                this.players.forEach(function (p) {
                    p.newHand();
                });
                this.hands.push(new Hand());
                // Deal
                var i = 0;
                var deck = new Deck();
                // remove for prod
                //seedrandom('hello.', {global: true});
                deck.shuffle();
                while (deck.cards.length) {
                    this.players[i].hand.push(deck.cards.pop());
                    i = (i + 1) % 4;
                }
                this.players.forEach(function (p) {
                    p.hand.sort(function (a, b) {
                        return (a.getValue() - b.getValue());
                    });
                });

                this.state = 'GIVING';
            }
            break;
        case 'GIVING':
            var ready = true;
            for (var p = 0; p < this.players.length; p++) {
                if (this.players[p].transferCards.length !== 3) {
                    ready = false;
                    break;
                }
            }
            if (ready) {
                this.state = 'ACCEPTING';
            }
            break;
        case 'ACCEPTING':
            var ready = true;
            for (var p = 0; p < this.players.length; p++) {
                if (this.players[p].transferCards.length !== 0) {
                    ready = false;
                    break;
                }
            }
            if (ready) {
                for (var p = 0; p < this.players.length; p++) {
                    for (var c = 0; c < this.players[p].hand.length; c++) {
                        if (this.players[p].hand[c].face === 'Mahjong') {
                            this.lastHand().turn = this.players[p].position;
                            break;
                        }
                    }
                }
                this.state = 'PLAY';
            }
            break;
        case 'PLAY':
            var outs = [];
            for (var p = 0; p < this.players.length; p++) {
                if (this.players[p].hand.length === 0) {
                    if (this.lastHand().firstOutPosition === null) {
                        this.lastHand().firstOutPosition = this.players[p].position;
                    }
                    outs.push(this.players[p]);
                }
            }
            // detect 1-2
            //if (outs.length == 1) {
            if (outs.length == 2) {
                if (outs[0].position === (outs[1].position + 2) % 4) {
                    this.endHand('ONE-TWO');
                }
            }
            // detect end of hand
            if (outs.length >= 3) {
                this.endHand('END');
                break;
            }

            // auto pass
            if (this.players[this.lastHand().turn].hand.length === 0) {
                this.playerPass(this.lastHand, this.players[this.lastHand().turn]);
            }
            break;
        case 'FINISHED':

            break;
        default:
            break;
    }
}

Game.prototype.playerPass = function (hand, player) {
    player.pass(this.lastHand());
    if ((this.lastHand().turn) % 4 === this.lastHand().lastPlayer) {
        this.players[(this.lastHand().turn) % 4].win(this.lastHand());
    }
}

Game.prototype.endHand = function (reason) {
    var teamCards = [[], []];
    var firstOutPosition = this.lastHand().firstOutPosition;
    var that = this;
    this.players.forEach(function (player, index, self) {
        if (player.calledTichu === 'TICHU') {
            if (player.position === firstOutPosition) {
                that.points[index % 2] += 100;
            } else {
                that.points[index % 2] -= 100;
            }
        } else if (player.calledTichu === 'GRANDTICHU') {
            if (player.position === firstOutPosition) {
                that.points[index % 2] += 200;
            } else {
                that.points[index % 2] -= 200;
            }
        }
    })
    switch (reason) {
        case 'ONE-TWO':
            this.points[firstOutPosition % 2] += 200;
            break;
        case 'END':
            // cards on the table are won by the player that just played
            var thirdOut = this.players[this.lastHand().combinations[this.lastHand().combinations.length - 1].playedBy];
            while (this.lastHand().combinations.length) {
                thirdOut.combinations.push(this.lastHand().combinations.pop());
            }
            // who's last
            var lastOut;
            for (var p = 0; p < this.players.length; p++) {
                if (this.players[p].hand.length !== 0) {
                    lastOut = this.players[p];
                }
            }
            // hand to opposing team
            while (lastOut.hand.length) {
                teamCards[(lastOut.position + 1) % 2].push(lastOut.hand.pop());
            }
            // combination to wining team
            while (lastOut.combinations.length) {
                var thisCombination = lastOut.combinations.pop();
                while (thisCombination.cards.length) {
                    teamCards[firstOutPosition % 2].push(thisCombination.cards.pop());
                }
            }
            // put all cards where they belong
            for (var p = 0; p < this.players.length; p++) {
                while (this.players[p].combinations.length) {
                    var thisCombination = this.players[p].combinations.pop();
                    while (thisCombination.cards.length) {
                        teamCards[this.players[p].position % 2].push(thisCombination.cards.pop());
                    }
                }
            }
            // count the points
            var that = this;
            teamCards[0].forEach(function (c) {
                that.points[0] += c.getPoints();
            });
            teamCards[1].forEach(function (c) {
                that.points[1] += c.getPoints();
            });
            break;
        default:
            throw new Error('Unknown game end reason');
            break;
    }
    if (this.points[0] >= this.pointLimit || this.points[1] >= this.pointLimit) {
        this.state = 'FINISHED';
    } else {
        //restart
        this.state = 'WAITING';
    }
}

module.exports = Game;
