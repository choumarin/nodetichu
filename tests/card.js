/**
 * Created by christian on 7/24/2015.
 */
require('chai').should()
var Card = require('../lib/card.js')

describe('Card creation', function () {
    it('create a normal card', function () {
        var card = new Card('2', 'Jade');
        card.face.should.equal('2');
        card.color.should.equal('Jade');
        card.getValue().should.equal(2);
    });
    it('create a special card', function () {
        var card = new Card('Phoenix');
        card.face.should.equal('Phoenix');
        card.color.should.equal('Special');
    });
    it('fail to create a unknown card (face)', function () {
        (function () {
            var card = new Card('1', 'Jade');
        }).should.throw(/This card does not exist/);
    });
    it('fail to create a unknown card (color)', function () {
        (function () {
            var card = new Card('2', 'NonExistingColor')
        }).should.throw(/This card does not exist/);
    });
});
