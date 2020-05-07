/**
 * Created by christian on 7/27/2015.
 */

var theGame = new Object();
var refreshInterval;
var oldState = '';
var socket;

function faceToString(face) {
    switch (face) {
        case '2':
            return 'two';
        case '3':
            return 'three';
        case '4':
            return 'four';
        case '5':
            return 'five';
        case '6':
            return 'six';
        case '7':
            return 'seven';
        case '8':
            return 'eight';
        case '9':
            return 'nine';
        case '10':
            return 'ten';
        case 'J':
            return 'jack';
        case 'Q':
            return 'queen';
        case 'K':
            return 'king';
        case 'A':
            return 'as';
        default:
            return face.toLowerCase();
    }
}

function drawHand(hand) {
    $('.myself .playerHand').empty();
    for (var c = 0; c < hand.length; c++) {
        var card = hand[c];
        jCard(card).appendTo('.myself .playerHand');
    }
}

function drawAlternatives(alternatives) {
    var $alternatives = $('.alternatives');
    $alternatives.show();
    $alternatives.find('.playerHand').empty();
    for (var a = 0; a < alternatives.length; a++) {
        var $container = $alternatives.find('[aid=' + a + ']');
        for (var c = 0; c < alternatives[a].length; c++) {
            var card = alternatives[a][c];
            $container.append(jCard(card));
        }
    }
}

function drawStack(n, tablePosition) {
    $('.playerView.' + tablePosition + ' .playerStack').empty();
    while (n--) {
        jCard({}, tablePosition === 'self' ? '' : 'small').appendTo('.playerView.' + tablePosition + ' .playerStack');
    }
}

function drawOtherHand(n, tablePosition) {
    $('.playerView.' + tablePosition + ' .playerHand').empty();
    while (n--) {
        jCard({}, 'small').appendTo('.playerView.' + tablePosition + ' .playerHand');
    }
}

function jCard(card, additionnalClasses) {
    var jCard = $('<div/>');
    if (card.face) {
        jCard = $('<div/>', {
            class: 'card ' + faceToString(card.face) + ' ' + card.color,
            json: JSON.stringify(card)
        });
    } else {
        jCard = $('<div/>', {
            class: 'card hidden',
            json: JSON.stringify(card)
        });
    }
    if (typeof additionnalClasses !== 'undefined') {
        jCard.addClass(additionnalClasses);
    }
    return jCard;
}

function drawMyTransfer(me) {
    $('.myself .given').empty();
    for (var i = 0; i < me.transferCards.length; i++) {
        var card = me.transferCards[i].card;
        var from = absoluteToRelative(me.position, me.transferCards[i].from);
        jCard(card, 'from' + from).appendTo('.myself .given');
    }
}

function drawOtherTransfer(player, position, myPosition) {
    $('.' + position + ' .given').empty()

    for (var i = 0; i < player.transferCards.length; i++) {
        var from = absoluteToRelative(player.position, player.transferCards[i].from);
        var card = player.transferCards[i].card;
        jCard(card, 'small from' + from).appendTo('.' + position + ' .given');
    }
}

function absoluteToRelative(thisPlayerId, whichId) {
    switch ((whichId - thisPlayerId + 4) % 4) {
        case 0:
            return 'self';
        case 1:
            return 'left';
        case 2:
            return 'front';
        case 3:
            return 'right';
    }
}

function relativeToAbsolue(thisPlayerId, position) {
    switch (position) {
        case 'self':
            return thisPlayerId;
        case 'left':
            return (thisPlayerId + 1) % 4;
        case 'front':
            return (thisPlayerId + 2) % 4;
        case 'right':
            return (thisPlayerId + 3) % 4;
    }
}

function selectForGiving(card) {
    if (typeof selectForGiving.positions === 'undefined') {
        selectForGiving.positions = ['right', 'left', 'front'];
    }
    if ($(card).hasClass('selected')) {
        $(card).removeClass('selected');
        selectForGiving.positions.push($(card).attr('giveto'));
        $(card).removeAttr('giveTo');
    } else if ($('.myself .selected').length < 3) {
        $(card).addClass('selected');
        $(card).attr('giveto', selectForGiving.positions.pop());
    }
}

function refreshGame(theGame) {
    $('#theGame').show();
    $('#lobby').hide();
    switch (theGame.state) {
        case 'WAITING':
            $('#btnPlay').hide();
            $('#btnPass').hide();
            $('#btnGive').hide();
            $('#btnAccept').hide();
            $('#btnTichu').hide();
            break;
        case 'GIVING':
            $('#btnPlay').hide();
            $('#btnPass').hide();
            $('#btnGive').show();
            $('#btnAccept').hide();
            $('#btnTichu').hide();
            break;
        case 'ACCEPTING':
            $('#btnPlay').hide();
            $('#btnPass').hide();
            $('#btnGive').hide();
            $('#btnAccept').show();
            $('#btnTichu').hide();
            break;
        case 'PLAY':
            $('#btnPlay').hide();
            $('#btnPass').hide();
            $('#btnGive').hide();
            $('#btnAccept').hide();
            $('#btnTichu').show();
            break;
        default:
            break;
    }

    if (theGame.state === 'PLAY' && theGame.lastHand.turn === theGame.myPosition) {
        $('#btnPlay').show();
        $('#btnPass').show();
    }


    $('.tableName').text(theGame.name);
    var team1Name, team2Name = '';
    team1Name = theGame.players[0].name;
    if (theGame.players.length > 2) {
        team1Name += ' & ' + theGame.players[2].name;
    }
    if (theGame.players.length > 1) {
        team2Name = theGame.players[1].name;
    }
    if (theGame.players.length > 3) {
        team2Name += ' & ' + theGame.players[3].name;
    }
    $('.teamName').eq(0).text(team1Name);
    $('.teamName').eq(1).text(team2Name);
    $('.score').eq(0).text(theGame.points[0]);
    $('.score').eq(1).text(theGame.points[1]);


    for (var p = 0; p < theGame.players.length; p++) {
        if (p === theGame.myPosition) {
            if (theGame.players[p].hand.length < 14 || theGame.players[p].calledTichu === 'TICHU') {
                $('#btnTichu').hide();
            }

            if (theGame.state === 'GIVING' && theGame.players[p].hand.length < 14) {
                $('#btnGive').hide();
            }

            if (theGame.state === 'ACCEPTING' && theGame.players[p].hand.length === 14) {
                $('#btnAccept').hide();
            }

            if ($('.myself .playerView>.playerHand .card').length !== theGame.players[p].hand.length || oldState !== theGame.state) {
                drawHand(theGame.players[p].hand);
                selectForGiving.positions = ['right', 'left', 'front'];
                if (theGame.state !== 'GIVING') {
                    $('.myself .playerView>.playerHand .card').click(function () {
                        $(this).toggleClass('selected');
                    });
                } else if ($('.myself .playerView>.playerHand .card').length > 11) {
                    $('.myself .playerView>.playerHand .card').click(function () {
                        selectForGiving(this);
                    });
                }
            }
            drawMyTransfer(theGame.players[p]);
        } else {
            var tableId = absoluteToRelative(theGame.myPosition, p);
            $('.' + tableId + ' .playerName').text(theGame.players[p].name);
            if (!theGame.players[p].seatTaken) {
                $('.playerView.' + absoluteToRelative(theGame.myPosition, p)).addClass('emptySeat');
            } else {
                $('.playerView.' + absoluteToRelative(theGame.myPosition, p)).removeClass('emptySeat');
            }
            drawOtherHand(theGame.players[p].hand.length, tableId);
            drawOtherTransfer(theGame.players[p], tableId, theGame.myPosition);
        }
        var tableId = absoluteToRelative(theGame.myPosition, p);
        var nbCards = theGame.players[p].combinations.reduce(function (previousValue, currentValue, index, array) {
            return previousValue + (array[index].length ? array[index].length : 0);
        }, 0);
        drawStack(nbCards, tableId);
        if (theGame.players[p].calledTichu === 'TICHU') {
            $('.' + tableId + ' .calledTichu').text('TICHU').show();
        } else {
            $('.' + tableId + ' .calledTichu').hide();
        }
    }

    $('.played .playerHand').empty();
    var zIndex = 0;
    if (theGame.state === 'PLAY') {
        for (var i = 0; i < theGame.lastHand.combinations.length; i++) {
            var side = absoluteToRelative(theGame.myPosition, theGame.lastHand.combinations[i].playedBy);
            $('.played.' + side + ' .playerHand').empty();
            for (var c = 0; c < theGame.lastHand.combinations[i].cards.length; c++) {
                var card = theGame.lastHand.combinations[i].cards[c];
                jCard(card).appendTo('.played.' + side + ' .playerHand');
                $('.played.' + side).css("zIndex", zIndex++);
            }
        }
    }

    $('.playerView').removeClass('currentTurn');
    if (theGame.state === 'PLAY') {
        $('.playerView.' + absoluteToRelative(theGame.myPosition, theGame.lastHand.turn)).addClass('currentTurn');
    }

    if (theGame.players[theGame.myPosition].mustGiveDragonAway) {
        $('.giveDragonDialog').show();
    } else {
        $('.giveDragonDialog').hide();
    }

    // who has passed?
    $('.passed').hide();
    if (theGame.state === 'PLAY' && theGame.lastHand.combinations.length > 0) {
        var lastPlayerPosition = theGame.lastHand.combinations[theGame.lastHand.combinations.length - 1].playedBy;
        var i = (lastPlayerPosition + 1) % 4;
        while (i !== theGame.lastHand.turn) {
            $('.' + absoluteToRelative(theGame.myPosition, i)).find('.passed').show();
            i = (i + 1) % 4;
        }
    }

    $('.currentWish').hide();
    if (theGame.state === 'PLAY' && theGame.lastHand.wish !== null) {
        $('.currentWish').empty().append(jCard({ face: theGame.lastHand.wish, color: '' }, 'small')).show();
    }

    oldState = theGame.state;
}

function getData() {
    $.get('/api/myGame', function (result) {
        if (result.error) {
            alert(result.error);
        } else {
            refreshPage(result);
        }
    });
}

function refreshPage(data) {
    if (data.state) {
        theGame = data;
        refreshGame(data);
    } else {
        refreshAllGames(data);
    }
}

function refreshAllGames(result) {
    $('#theGame').hide();
    $('#lobby').show();

    $('#allGames').empty();
    Object.keys(result).forEach(function (key) {
        var game = result[key];
        var index = key;
        var thePlayers = $('<div/>', {
            class: 'players'
        });
        var positions = [2, 1, 3, 0];
        positions.forEach(function (position) {
            for (var p = 0; p < game.players.length; p++) {
                if (game.players[p].position === position) {
                    break;
                }
            }
            if (game.players[p].seatTaken) {
                thePlayers.append(
                    $('<div/>', { class: 'playerName' }).text(game.players[p].name)
                );
            } else {
                thePlayers.append(
                    $('<div/>', { class: 'playerName' })
                        .append(
                            $('<button/>', { class: 'btnJoin', gameId: index, positionId: position }).text('Join')
                        )
                )
            }
        });
        $('#allGames').append(
            $('<div/>', {
                class: 'oneGame'
            })
                .attr('gameId', index)
                .append(
                    $('<div/>', {
                        class: 'gameName'
                    })
                        .text(game.name)
                )
                .append(
                    $('<div/>', {
                        class: 'gameState'
                    })
                        .text(game.state)
                )
                .append(
                    $('<div/>', {
                        class: 'pointLimit'
                    })
                        .text(game.pointLimit)
                )
                .append(thePlayers)
        );

        $('.playerName button').click(function () {
            var data = { name: $('#userName').val() };
            var that = this;
            $.post('/api/login', data, function (result) {
                if (result.error) {
                    alert(result.error);
                } else {
                    var data = { position: $(that).attr('positionId'), gameId: $(that).attr('gameId') };
                    $.post('/api/joinGame', data, function (result) {
                        if (result.error) {
                            alert(result.error);
                        } else {
                            socket.emit('chat', 'Joined');
                            $(".chat .history").empty();
                        }
                    });
                }
            });
        });
    });
}

$(document).ready(function () {

    $('#formCreate').on('submit', function () {
        var data = { name: $('#userName').val() };
        $.post('/api/login', data, function (result) {
            if (result.error) {
                alert(result.error);
            } else {
                var data = { gameName: $('#gameName').val(), pointLimit: $('#points').val() };
                $.post('/api/createGame', data, function (result) {
                    if (result.error) {
                        alert(result.error);
                    } else {
                        socket.emit('chat', 'Joined');
                    }
                });
            }
        });
        return false;
    });

    $('#btnGive').click(function () {
        var data = {
            transfers: $.map($('.myself .selected'), function (card) {
                return {
                    to: relativeToAbsolue(theGame.myPosition, $(card).attr('giveto')),
                    card: JSON.parse($(card).attr('json'))
                }
            })
        }

        $.post('/api/give', data, function (result) {
            if (result.error) {
                alert(result.error);
            } else {
            }
        });
    });

    $('#btnAccept').click(function () {
        $.post('/api/accept', function (result) {
            if (result.error) {
                alert(result.error);
            } else {
            }
        });
    });

    $('#btnPlay').click(function () {
        var cards = {
            cards: $.map($('.myself .selected'), function (c) {
                return JSON.parse($(c).attr('json'));
            })
        };
        $.post('/api/play', cards, function (result) {
            if (result.error) {
                if (result.alternatives) {
                    drawAlternatives(result.alternatives);
                } else if (result.wish === 'needed') {
                    $('.wish').show();
                } else {
                    alert(result.error);
                }
            } else {
            }
        });
    });

    $('#btnPass').click(function () {
        $.post('/api/pass', function (result) {
            if (result.error) {
                alert(result.error);
            } else {
            }
        });
    });

    $('#btnTichu').click(function () {
        $.post('/api/callTichu', function (result) {
            if (result.error) {
                alert(result.error);
            } else {
            }
        });
    });

    $('.alternatives .playerHand').click(function () {
        var cards = $.map($('.alternatives .playerHand[aid=' + $(this).attr('aID') + '] .card '), function (c) {
            return JSON.parse($(c).attr('json'));
        });
        $.post('/api/play', { cards: cards, alternativeId: $(this).attr('aID') }, function (result) {
            $('.alternatives').hide();
            if (result.error) {
                if (result.alternatives) {
                    drawAlternatives(result.alternatives);
                } else {
                    alert(result.error);
                }
            } else {
            }
        });
    });

    $('.giveDragonDialog button').click(function () {
        var to = $(this).attr('to');
        to = relativeToAbsolue(theGame.myPosition, to);
        $.post('/api/giveDragon', { to: to }, function (result) {
            if (result.error) {
                alert(result.error);
            }
        });
    });

    $('#btnCancelAlternatives').click(function () {
        $('.alternatives').hide();
    });

    $('#btnLeave').click(function () {
        $.post('/api/leaveGame', function (result) {
            if (result.error) {
                alert(result.error);
            } else {
                socket.emit('chat', '** has left. **');
            }
        });
    });

    $('.playerStack').mouseover(function () {
        $(this).children().last().append(
            $('<div/>', { class: 'count' })
                .text($(this).children().length)
        )
    })
    $('.playerStack').mouseout(function () {
        $(this).children().last().empty();
    })

    $('#btnClear').click(function () {
        $('.selected').removeAttr('giveto');
        $('.selected').removeClass('selected');
        selectForGiving.positions = ['right', 'left', 'front'];
    });

    $('.wish').find('.card').click(function () {
        $('.wish').hide();
        var data = {
            cards: $.map($('.myself .selected'), function (c) {
                return JSON.parse($(c).attr('json'));
            }),
            wish: $(this).attr('face')
        };
        $.post('/api/play', data, function (result) {
            if (result.error) {
                alert(result.error);
            } else {
            }
        });

    });

    refreshInterval = setInterval(getData, 1000);

    socket = io();
    socket.on('connect', () => {
        console.log("socket connected");
    });

    socket.on('chat', (data) => {
        $(".chat .history").append($("<p></p>").text(data));
        console.log(data);
    });

    $('#formChat').on('submit', function () {
        socket.emit('chat', $('#chatMessage').val());
        $('#chatMessage').val("");
        return false;
    });

    setInterval(() => {
        if (!socket.connected) {
            console.log("reconnecting")
            socket.connect();
        }
    }, 1000);
});

