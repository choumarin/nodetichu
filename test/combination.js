/**
 * Created by christian on 7/24/2015.
 */
require('chai').should();
var Combination = require('../lib/combination.js');
var Card = require('../lib/card.js');

describe('Combination creation', function () {
    var single, pair, trio, steps, fullhouse, straight, bomb4, bombstraight;
    it('create a SINGLE combination', function () {
        var cards = new Array(new Card('2', 'Jade'))
        single = new Combination(cards);
        single.type.should.eql('SINGLE');
        single.cards.should.have.length(1);
        single.cards[0].equals(new Card('2', 'Jade')).should.be.true;
        single.value.should.eql(2);
    });
    it('fail to create a wrong combination', function () {
        var cards = new Array(new Card('2', 'Jade'), new Card('3', 'Jade'));
        (function () {
            var combination = new Combination(cards);
        }).should.throw(/Invalid combination/);
    });
    it('create a PAIR combination', function () {
        var cards = new Array(new Card('3', 'Jade'), new Card('3', 'Sword'));
        pair = new Combination(cards);
        pair.type.should.eql('PAIR');
        pair.cards.should.have.length(2);
        pair.value.should.eql(3);
    });
    it('create a STEP combination', function () {
        var cards = new Array(new Card('3', 'Jade'), new Card('3', 'Sword'), new Card('4', 'Jade'), new Card('4', 'Sword'));
        steps = new Combination(cards);
        steps.type.should.eql('STEPS');
        steps.cards.should.have.length(4);
        steps.value.should.eql(4);
    });
    it('create an unordered STEP combination', function () {
        var cards = new Array(new Card('9', 'Jade'), new Card('J', 'Sword'), new Card('9', 'Sword'), new Card('10', 'Sword'), new Card('10', 'Sword'), new Card('J', 'Sword'));
        var combination = new Combination(cards);
        combination.type.should.eql('STEPS');
        combination.cards.should.have.length(6);
        combination.value.should.eql(11);
    });
    it('create a TRIO combination', function () {
        var cards = new Array(new Card('9', 'Jade'), new Card('9', 'Sword'), new Card('9', 'Pagoda'));
        trio = new Combination(cards);
        trio.type.should.eql('TRIO');
        trio.cards.should.have.length(3);
        trio.value.should.eql(9);
    });
    it('create a FULLHOUSE combination', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('9', 'Jade'), new Card('K', 'Sword'), new Card('9', 'Sword'), new Card('9', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(9);
    });
    it('create a STRAIGHT combination', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('A', 'Sword'), new Card('9', 'Jade'), new Card('10', 'Sword'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.value.should.eql(14);
    });
    it('fail to create a STRAIGHT combination with dragon', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('A', 'Sword'), new Card('Dragon', 'Special'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'));
        (function () {
            straight = new Combination(cards);
        }).should.throw(/Invalid combination/)
    });
    it('create a 4 of a kind BOMB combination', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('K', 'Star'), new Card('K', 'Jade'), new Card('K', 'Pagoda'));
        bomb4 = new Combination(cards);
        bomb4.type.should.eql('BOMB');
        bomb4.cards.should.have.length(4);
        bomb4.value.should.eql(13);
    });
    it('fail to create a 4 of a kind BOMB combination', function () {
        var cards = new Array(new Card('A', 'Sword'), new Card('K', 'Star'), new Card('K', 'Jade'), new Card('K', 'Pagoda'));
        (function () {
            var combination = new Combination(cards);
        }).should.throw(/Invalid combination/);
    });
    it('create a straight BOMB combination', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('A', 'Sword'), new Card('9', 'Sword'), new Card('10', 'Sword'), new Card('J', 'Sword'), new Card('Q', 'Sword'));
        bombstraight = new Combination(cards);
        bombstraight.type.should.eql('BOMB');
        bombstraight.cards.should.have.length(6);
        bombstraight.value.should.eql(14);
    });
    it('fail to create a straight BOMB combination', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('A', 'Sword'), new Card('9', 'Jade'), new Card('10', 'Sword'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'));
        var combination = new Combination(cards);
        combination.type.should.not.eql('BOMB');
    });

    it('single should beat single', function () {
        var cards = new Array(new Card('K', 'Sword'));
        var combination = new Combination(cards);
        combination.isBetter(single).should.be.true;
    });
    it('single should not beat single', function () {
        var cards = new Array(new Card('K', 'Sword'));
        var combination = new Combination(cards);
        single.isBetter(combination).should.not.be.true;
    });
    it('single should not beat itself', function () {
        single.isBetter(single).should.not.be.true;
    });
    it('pair should not beat single', function () {
        pair.isBetter(single).should.not.be.true;
    });
    it('single should not beat pair', function () {
        single.isBetter(pair).should.not.be.true;
    });
    it('pair should beat pair', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('K', 'Pagoda'));
        var combination = new Combination(cards);
        combination.isBetter(pair).should.be.true;
    });
    it('pair should not beat pair', function () {
        var cards = new Array(new Card('K', 'Sword'), new Card('K', 'Pagoda'));
        var combination = new Combination(cards);
        pair.isBetter(combination).should.not.be.true;
    });
    it('fullhouse should beat fullhouse', function () {
        var cards = new Array(new Card('8', 'Sword'), new Card('A', 'Pagoda'), new Card('A', 'Jade'), new Card('A', 'Star'), new Card('8', 'Pagoda'));
        var combination = new Combination(cards);
        combination.isBetter(fullhouse).should.be.true;
    });
    it('fullhouse should not beat fullhouse', function () {
        var cards = new Array(new Card('8', 'Sword'), new Card('A', 'Pagoda'), new Card('A', 'Jade'), new Card('A', 'Star'), new Card('8', 'Pagoda'));
        var combination = new Combination(cards);
        fullhouse.isBetter(combination).should.not.be.true;
    });
    it('bomb should beat fullhouse', function () {
        var cards = new Array(new Card('8', 'Sword'), new Card('A', 'Pagoda'), new Card('A', 'Jade'), new Card('A', 'Star'), new Card('8', 'Pagoda'));
        var combination = new Combination(cards);
        bomb4.isBetter(combination).should.be.true;
    });
    it('fullhouse should not beat bomb', function () {
        fullhouse.isBetter(bomb4).should.not.be.true;
    });
    it('bomb should beat bomb', function () {
        var cards = new Array(new Card('A', 'Sword'), new Card('A', 'Star'), new Card('A', 'Jade'), new Card('A', 'Pagoda'));
        var combination = new Combination(cards);
        combination.isBetter(bomb4).should.be.true;
    });
    it('bomb should beat bomb', function () {
        bombstraight.isBetter(bomb4).should.be.true;
    });
    it('bomb should not beat bomb', function () {
        bomb4.isBetter(bombstraight).should.not.be.true;
    });
    it('create a PAIR combination with the phoenix', function () {
        var cards = new Array(new Card('3', 'Jade'), new Card('Phoenix', 'Special'));
        pair = new Combination(cards);
        pair.type.should.eql('PAIR');
        pair.cards.should.have.length(2);
        pair.value.should.eql(3);
    });
    it('fail to create a PAIR combination with the phoenix', function () {
        var cards = new Array(new Card('Mahjong', 'Special'), new Card('Phoenix', 'Special'));
        (function () {
            new Combination(cards);
        }).should.throw(/Invalid combination/);
    });
    it('create a TRIO combination', function () {
        var cards = new Array(new Card('9', 'Jade'), new Card('Phoenix', 'Special'), new Card('9', 'Pagoda'));
        trio = new Combination(cards);
        trio.type.should.eql('TRIO');
        trio.cards.should.have.length(3);
        trio.value.should.eql(9);
    });
    it('create an unordered STEP combination with phoenix', function () {
        var cards = new Array(new Card('9', 'Jade'), new Card('J', 'Sword'), new Card('9', 'Sword'), new Card('Phoenix', 'Special'), new Card('10', 'Sword'), new Card('J', 'Sword'));
        var combination = new Combination(cards);
        combination.type.should.eql('STEPS');
        combination.cards.should.have.length(6);
        combination.value.should.eql(11);
        combination.cards[0].face.should.eql('9');
        combination.cards[1].face.should.eql('9');
        combination.cards[2].face.should.eql('Phoenix');
        combination.cards[3].face.should.eql('10');
        combination.cards[4].face.should.eql('J');
        combination.cards[5].face.should.eql('J');
    });
    it('create an unordered STEP combination with phoenix', function () {
        var cards = Array(new Card('Phoenix', 'Special'), new Card('J', 'Sword'), new Card('9', 'Sword'), new Card('10', 'Sword'), new Card('10', 'Sword'), new Card('J', 'Sword'));
        var combination = new Combination(cards);
        combination.type.should.eql('STEPS');
        combination.cards.should.have.length(6);
        combination.value.should.eql(11);
        combination.cards[0].face.should.eql('Phoenix');
        combination.cards[1].face.should.eql('9');
        combination.cards[2].face.should.eql('10');
        combination.cards[3].face.should.eql('10');
        combination.cards[4].face.should.eql('J');
        combination.cards[5].face.should.eql('J');
    });
    it('create an unordered STEP combination with phoenix', function () {
        var cards = Array(new Card('9', 'Jade'), new Card('Phoenix', 'Special'), new Card('9', 'Sword'), new Card('10', 'Sword'), new Card('10', 'Sword'), new Card('J', 'Sword'));
        var combination = new Combination(cards);
        combination.type.should.eql('STEPS');
        combination.cards.should.have.length(6);
        combination.value.should.eql(11);
        combination.cards[0].face.should.eql('9');
        combination.cards[1].face.should.eql('9');
        combination.cards[2].face.should.eql('10');
        combination.cards[3].face.should.eql('10');
        combination.cards[4].face.should.eql('Phoenix');
        combination.cards[5].face.should.eql('J');
    });
    it('create a FULLHOUSE combination with phoenix (with alternative)', function () {
        var cards = Array(new Card('K', 'Sword'), new Card('Phoenix', 'Special'), new Card('K', 'Sword'), new Card('9', 'Sword'), new Card('9', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(9);
        fullhouse.cards[0].face.should.eql('Phoenix');
        fullhouse.cards[1].face.should.eql('9');
        fullhouse.cards[2].face.should.eql('9');
        fullhouse.cards[3].face.should.eql('K');
        fullhouse.cards[4].face.should.eql('K');
        fullhouse.alternative.cards[0].face.should.eql('9');
        fullhouse.alternative.cards[1].face.should.eql('9');
        fullhouse.alternative.cards[2].face.should.eql('K');
        fullhouse.alternative.cards[3].face.should.eql('K');
        fullhouse.alternative.cards[4].face.should.eql('Phoenix');
        fullhouse.alternative.value.should.eql(13);
    });
    it('create a FULLHOUSE combination with phoenix (with alternative)', function () {
        var cards = Array(new Card('4', 'Sword'), new Card('Phoenix', 'Special'), new Card('4', 'Sword'), new Card('7', 'Sword'), new Card('7', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(4);
        fullhouse.cards[0].face.should.eql('Phoenix');
        fullhouse.cards[1].face.should.eql('4');
        fullhouse.cards[2].face.should.eql('4');
        fullhouse.cards[3].face.should.eql('7');
        fullhouse.cards[4].face.should.eql('7');
        fullhouse.alternative.cards[0].face.should.eql('4');
        fullhouse.alternative.cards[1].face.should.eql('4');
        fullhouse.alternative.cards[2].face.should.eql('7');
        fullhouse.alternative.cards[3].face.should.eql('7');
        fullhouse.alternative.cards[4].face.should.eql('Phoenix');
        fullhouse.alternative.value.should.eql(7);
    });
    it('create a FULLHOUSE combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('K', 'Sword'), new Card('Phoenix', 'Special'), new Card('K', 'Sword'), new Card('K', 'Sword'), new Card('9', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(13);
        fullhouse.alternative.should.eql({});
        fullhouse.cards[0].face.should.eql('Phoenix');
        fullhouse.cards[1].face.should.eql('9');
        fullhouse.cards[2].face.should.eql('K');
        fullhouse.cards[3].face.should.eql('K');
        fullhouse.cards[4].face.should.eql('K');
    });
    it('create a FULLHOUSE combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('7', 'Sword'), new Card('Phoenix', 'Special'), new Card('7', 'Sword'), new Card('7', 'Sword'), new Card('9', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(7);
        fullhouse.alternative.should.eql({});
        fullhouse.cards[0].face.should.eql('7');
        fullhouse.cards[1].face.should.eql('7');
        fullhouse.cards[2].face.should.eql('7');
        fullhouse.cards[3].face.should.eql('9');
        fullhouse.cards[4].face.should.eql('Phoenix');
    });
    it('create a FULLHOUSE combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('9', 'Sword'), new Card('Phoenix', 'Special'), new Card('7', 'Sword'), new Card('9', 'Sword'), new Card('9', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(9);
        fullhouse.alternative.should.eql({});
        fullhouse.cards[0].face.should.eql('Phoenix');
        fullhouse.cards[1].face.should.eql('7');
        fullhouse.cards[2].face.should.eql('9');
        fullhouse.cards[3].face.should.eql('9');
        fullhouse.cards[4].face.should.eql('9');
    });
    it('create a STRAIGHT combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('K', 'Sword'), new Card('A', 'Sword'), new Card('9', 'Jade'), new Card('10', 'Sword'), new Card('Phoenix', 'Special'), new Card('Q', 'Pagoda'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.value.should.eql(14);
        straight.alternative.should.eql({});
    });
    it('create a STRAIGHT combination with phoenix (with alternative)', function () {
        var cards = Array(new Card('K', 'Sword'), new Card('Phoenix', 'Special'), new Card('9', 'Jade'), new Card('10', 'Sword'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.cards[0].face.should.eql('Phoenix');
        straight.cards[1].face.should.eql('9');
        straight.cards[2].face.should.eql('10');
        straight.cards[3].face.should.eql('J');
        straight.cards[4].face.should.eql('Q');
        straight.cards[5].face.should.eql('K');
        straight.value.should.eql(13);
        straight.alternative.cards[0].face.should.eql('9');
        straight.alternative.cards[1].face.should.eql('10');
        straight.alternative.cards[2].face.should.eql('J');
        straight.alternative.cards[3].face.should.eql('Q');
        straight.alternative.cards[4].face.should.eql('K');
        straight.alternative.cards[5].face.should.eql('Phoenix');
        straight.alternative.value.should.eql(14);
    });
    it('create a STRAIGHT combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('2', 'Sword'), new Card('3', 'Sword'), new Card('4', 'Jade'), new Card('5', 'Sword'), new Card('Phoenix', 'Special'), new Card('6', 'Pagoda'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.value.should.eql(7);
        straight.cards[0].face.should.eql('2');
        straight.cards[1].face.should.eql('3');
        straight.cards[2].face.should.eql('4');
        straight.cards[3].face.should.eql('5');
        straight.cards[4].face.should.eql('6');
        straight.cards[5].face.should.eql('Phoenix');
        straight.alternative.should.eql({});
    });
    it('create a STRAIGHT combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('2', 'Sword'), new Card('3', 'Sword'), new Card('4', 'Jade'), new Card('5', 'Sword'), new Card('Phoenix', 'Special'), new Card('Mahjong', 'Special'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.value.should.eql(6);
        straight.cards[0].face.should.eql('Mahjong');
        straight.cards[1].face.should.eql('2');
        straight.cards[2].face.should.eql('3');
        straight.cards[3].face.should.eql('4');
        straight.cards[4].face.should.eql('5');
        straight.cards[5].face.should.eql('Phoenix');
        straight.alternative.should.eql({});
    });
    it('create a STRAIGHT combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('3', 'Sword'), new Card('4', 'Jade'), new Card('5', 'Sword'), new Card('Phoenix', 'Special'), new Card('Mahjong', 'Special'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(5);
        straight.value.should.eql(5);
        straight.cards[0].face.should.eql('Mahjong');
        straight.cards[1].face.should.eql('Phoenix');
        straight.cards[2].face.should.eql('3');
        straight.cards[3].face.should.eql('4');
        straight.cards[4].face.should.eql('5');
        straight.alternative.should.eql({});
    });
    it('create a STRAIGHT combination with phoenix (no alternative)', function () {
        var cards = Array(new Card('2', 'Sword'), new Card('3', 'Sword'), new Card('Phoenix', 'Special'), new Card('5', 'Sword'), new Card('6', 'Jade'), new Card('Mahjong', 'Special'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.value.should.eql(6);
        straight.cards[0].face.should.eql('Mahjong');
        straight.cards[1].face.should.eql('2');
        straight.cards[2].face.should.eql('3');
        straight.cards[3].face.should.eql('Phoenix');
        straight.cards[4].face.should.eql('5');
        straight.cards[5].face.should.eql('6');
        straight.alternative.should.eql({});
    });
    it('create a STRAIGHT combination with phoenix (and choose alternative 0)', function () {
        var cards = Array(new Card('K', 'Sword'), new Card('Phoenix', 'Special'), new Card('9', 'Jade'), new Card('10', 'Sword'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'));
        straight = new Combination(cards, 0);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.cards[0].face.should.eql('Phoenix');
        straight.cards[1].face.should.eql('9');
        straight.cards[2].face.should.eql('10');
        straight.cards[3].face.should.eql('J');
        straight.cards[4].face.should.eql('Q');
        straight.cards[5].face.should.eql('K');
        straight.value.should.eql(13);
        straight.alternative.should.eql({});
    });
    it('create a STRAIGHT combination with phoenix (and choose alternative 1)', function () {
        var cards = Array(new Card('K', 'Sword'), new Card('Phoenix', 'Special'), new Card('9', 'Jade'), new Card('10', 'Sword'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'));
        straight = new Combination(cards, 1);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(6);
        straight.cards[0].face.should.eql('9');
        straight.cards[1].face.should.eql('10');
        straight.cards[2].face.should.eql('J');
        straight.cards[3].face.should.eql('Q');
        straight.cards[4].face.should.eql('K');
        straight.cards[5].face.should.eql('Phoenix');
        straight.value.should.eql(14);
        straight.alternative.should.eql({});
    });
    it('create a FULLHOUSE combination with phoenix (and choose alternative 0)', function () {
        var cards = Array(new Card('4', 'Sword'), new Card('Phoenix', 'Special'), new Card('4', 'Sword'), new Card('7', 'Sword'), new Card('7', 'Pagoda'));
        fullhouse = new Combination(cards, 0);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(4);
        fullhouse.cards[0].face.should.eql('Phoenix');
        fullhouse.cards[1].face.should.eql('4');
        fullhouse.cards[2].face.should.eql('4');
        fullhouse.cards[3].face.should.eql('7');
        fullhouse.cards[4].face.should.eql('7');
        fullhouse.alternative.should.eql({});
    });
    it('create a FULLHOUSE combination with phoenix (and choose alternative 1)', function () {
        var cards = Array(new Card('4', 'Sword'), new Card('Phoenix', 'Special'), new Card('4', 'Sword'), new Card('7', 'Sword'), new Card('7', 'Pagoda'));
        fullhouse = new Combination(cards, 1);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.cards[0].face.should.eql('4');
        fullhouse.cards[1].face.should.eql('4');
        fullhouse.cards[2].face.should.eql('7');
        fullhouse.cards[3].face.should.eql('7');
        fullhouse.cards[4].face.should.eql('Phoenix');
        fullhouse.value.should.eql(7);
        fullhouse.alternative.should.eql({});
    });
    it('create a FULLHOUSE combination', function () {
        var cards = new Array(new Card('2', 'Sword'), new Card('2', 'Jade'), new Card('2', 'Sword'), new Card('4', 'Sword'), new Card('4', 'Pagoda'));
        fullhouse = new Combination(cards);
        fullhouse.type.should.eql('FULLHOUSE');
        fullhouse.cards.should.have.length(5);
        fullhouse.value.should.eql(2);
        fullhouse.cards[0].face.should.eql('2');
        fullhouse.cards[1].face.should.eql('2');
        fullhouse.cards[2].face.should.eql('2');
        fullhouse.cards[3].face.should.eql('4');
        fullhouse.cards[4].face.should.eql('4');
    });
    it('create a STRAIGHT combination with phoenix amd ONE (no alternative)', function () {
        var cards = Array(new Card('Mahjong', 'Special'), new Card('Phoenix', 'Special'), new Card('2', 'Sword'), new Card('3', 'Sword'), new Card('5', 'Sword'), new Card('6', 'Jade'), new Card('7', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'));
        straight = new Combination(cards);
        straight.type.should.eql('STRAIGHT');
        straight.cards.should.have.length(9);
        straight.value.should.eql(9);
        straight.cards[0].face.should.eql('Mahjong');
        straight.cards[1].face.should.eql('2');
        straight.cards[2].face.should.eql('3');
        straight.cards[3].face.should.eql('Phoenix');
        straight.cards[4].face.should.eql('5');
        straight.cards[5].face.should.eql('6');
        straight.cards[6].face.should.eql('7');
        straight.cards[7].face.should.eql('8');
        straight.cards[8].face.should.eql('9');
        straight.alternative.should.eql({});
    });
    it('straight 8 cannot be beaten by straight 7', function () {
        var straight8 = new Combination([new Card('2', 'Star'), new Card('3', 'Pagoda'), new Card('4', 'Jade'), new Card('5', 'Star'), new Card('6', 'Star'), new Card('7', 'Jade'), new Card('8', 'Pagoda'), new Card('Phoenix', 'Special')]);
        var straight7 = new Combination([new Card('8', 'Star'), new Card('9', 'Sword'), new Card('10', 'Jade'), new Card('J', 'Sword'), new Card('Q', 'Pagoda'), new Card('K', 'Pagoda'), new Card('A', 'Sword')]);
        straight7.isBetter(straight8).should.not.be.true;
    });
});
