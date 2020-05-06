/**
 * Created by christian on 8/5/2015.
 */

require('chai').should();
var Combination = require('../lib/combination.js');
var Card = require('../lib/card.js');

describe('Wishes', function () {
    var wish = '9';
    it('simple wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword')]);
        var hand = [new Card('2', 'Jade'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('K', 'Jade')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('simple wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword')]);
        var hand = [new Card('2', 'Jade'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('Phoenix', 'Special'), new Card('K', 'Jade')];
        tableCombination.canFullfillWish(wish, hand).should.be.false;
    });
    it('pair wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade')]);
        var hand = [new Card('2', 'Jade'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('K', 'Jade')];
        tableCombination.canFullfillWish(wish, hand).should.be.false;
    });
    it('pair wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade')]);
        var hand = [new Card('2', 'Jade'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('9', 'Sword')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('pair wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade')]);
        var hand = [new Card('2', 'Jade'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('Phoenix', 'Special')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('trio wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('K', 'Jade')];
        tableCombination.canFullfillWish(wish, hand).should.be.false;
    });
    it('trio wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('Phoenix', 'Special')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('trio wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('9', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('step wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('7', 'Sword'), new Card('7', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('3', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('9', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.false;
    });
    it('step wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('7', 'Sword'), new Card('7', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('8', 'Jade'), new Card('5', 'Jade'), new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('9', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('step wish', function () {
        var tableCombination = new Combination([new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('7', 'Sword'), new Card('7', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('8', 'Jade'), new Card('5', 'Jade'), new Card('Phoenix', 'Special'), new Card('9', 'Jade'), new Card('9', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('step wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('7', 'Sword'), new Card('7', 'Pagoda')]);
        var hand = [new Card('9', 'Pagoda'), new Card('8', 'Jade'), new Card('5', 'Jade'), new Card('Phoenix', 'Special'), new Card('9', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('fullhouse wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('8', 'Jade'), new Card('5', 'Jade'), new Card('Phoenix', 'Special'), new Card('9', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('fullhouse wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('9', 'Jade'), new Card('5', 'Jade'), new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('3', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.false;
    });
    it('fullhouse wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('9', 'Jade'), new Card('K', 'Jade'), new Card('K', 'Sword'), new Card('K', 'Jade'), new Card('3', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('fullhouse wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('9', 'Jade'), new Card('Phoenix', 'Special'), new Card('K', 'Sword'), new Card('K', 'Jade'), new Card('3', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('fullhouse wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('9', 'Jade'), new Card('5', 'Jade'), new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('fullhouse wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('5', 'Jade'), new Card('6', 'Sword'), new Card('6', 'Jade'), new Card('6', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('9', 'Jade'), new Card('K', 'Jade'), new Card('K', 'Sword'), new Card('K', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('10', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('straight wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('7', 'Jade'), new Card('6', 'Sword'), new Card('8', 'Jade'), new Card('4', 'Sword')]);
        var hand = [new Card('8', 'Pagoda'), new Card('9', 'Jade'), new Card('7', 'Jade'), new Card('10', 'Sword'), new Card('Q', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('2', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('straight wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('7', 'Jade'), new Card('6', 'Sword'), new Card('8', 'Jade'), new Card('4', 'Sword')]);
        var hand = [new Card('8', 'Pagoda'), new Card('9', 'Jade'), new Card('7', 'Jade'), new Card('Phoenix', 'Special'), new Card('Q', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('2', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('bomb wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('7', 'Jade'), new Card('6', 'Sword'), new Card('8', 'Jade'), new Card('4', 'Sword')]);
        var hand = [new Card('9', 'Pagoda'), new Card('9', 'Jade'), new Card('9', 'Sword'), new Card('Phoenix', 'Special'), new Card('Q', 'Jade'), new Card('9', 'Star'), new Card('10', 'Jade'), new Card('2', 'Star')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
    it('overbomb wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('7', 'Sword'), new Card('6', 'Sword'), new Card('8', 'Sword'), new Card('4', 'Sword')]);
        var hand = [new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('7', 'Jade'), new Card('Phoenix', 'Special'), new Card('Q', 'Jade'), new Card('9', 'Sword'), new Card('10', 'Jade'), new Card('2', 'Jade')];
        tableCombination.canFullfillWish(wish, hand).should.be.false;
    });
    it('overbomb wish', function () {
        var tableCombination = new Combination([new Card('5', 'Sword'), new Card('7', 'Sword'), new Card('6', 'Sword'), new Card('8', 'Sword'), new Card('4', 'Sword')]);
        var hand = [new Card('8', 'Jade'), new Card('9', 'Jade'), new Card('7', 'Jade'), new Card('Phoenix', 'Special'), new Card('Q', 'Jade'), new Card('J', 'Jade'), new Card('10', 'Jade'), new Card('2', 'Jade')];
        tableCombination.canFullfillWish(wish, hand).should.be.true;
    });
});
