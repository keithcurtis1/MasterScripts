// DeckExport.js
// Modeled after TableExport by The Aaron
// Adapted for Decks & Cards

var DeckExport = DeckExport || (function () {
    'use strict';

    var version = '0.1.3',
        lastUpdate = 1734300000,
        deckCache = {},
        escapes = {
            '[': '<%%91%%>',
            ']': '<%%93%%>',
            '--': '<%%-%%>',
            ' --': '[DECKEXPORT:ESCAPE]'
        };

    /* ================= UTILS ================= */

    var esRE = function (s) {
        return s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, "\\$1");
    };

    var nameEscape = (function () {
        var re = new RegExp('(' + _.map(_.keys(escapes), esRE).join('|') + ')', 'g');
        return function (s) {
            return s.replace(re, function (c) {
                return escapes[c] || c;
            });
        };
    }());

    var nameUnescape = (function () {
        var unesc = _.invert(escapes),
            re = new RegExp('(' + _.map(_.keys(unesc), esRE).join('|') + ')', 'g');
        return function (s) {
            return s.replace(re, function (c) {
                return unesc[c] || c;
            });
        };
    }());

    var checkInstall = function () {
        log('-=> DeckExport v' + version + ' <=-');
    };

    /* ================= CHAT HANDLER ================= */

    var handleInput = function (msg) {
        if (msg.type !== 'api' || !playerIsGM(msg.playerid)) {
            return;
        }

        var args, decks, matches, errors = [], accum = '';

        switch (true) {

            /* ---------- IMPORT DECK BACK (MUST COME FIRST) ---------- */

            case /^!import-deck-back\b/.test(msg.content):
                args = msg.content.split(/\s+--/);
                if (args.length < 5) return;

                var deckName = args[1];
                var avatar = args[2] || '';
                var width = parseInt(args[3], 10) || '';
                var height = parseInt(args[4], 10) || '';

                var deck = findObjs({ type: 'deck', name: deckName })[0];
                if (!deck) {
                    sendChat('', '/w gm Error: Deck [' + deckName + '] not found for back.');
                    return;
                }

                deck.set({
                    avatar: avatar,
                    defaultwidth: width,
                    defaultheight: height
                });
                break;

            /* ---------- IMPORT DECK ---------- */

            case /^!import-deck\s/.test(msg.content):
                args = msg.content.split(/\s+--/);
                if (args.length < 2) return;

                var show = args[2] === 'show';

                var existing = findObjs({ type: 'deck', name: args[1] });
                if (existing.length) {
                    deckCache[args[1]] = existing[0].id;
                    break;
                }

                var d = createObj('deck', {
                    name: args[1],
                    showplayers: show
                });

                deckCache[args[1]] = d.id;
                break;

            /* ---------- IMPORT CARD ---------- */

            case /^!import-card\b/.test(msg.content):
                args = msg.content.split(/\s+--/);
                if (args.length < 4) return;

                var dName = args[1];
                var cName = nameUnescape(args[2]);
                var front = args[3] || '';
                var tooltip = args[4] || '';

                if (!deckCache[dName]) {
                    var found = findObjs({ type: 'deck', name: dName });
                    if (!found.length) return;
                    deckCache[dName] = found[0].id;
                }

                createObj('card', {
                    name: cName,
                    avatar: front,
                    tooltip: tooltip,
                    _deckid: deckCache[dName]
                });
                break;

            /* ---------- EXPORT DECK ---------- */

            case /^!export-deck\b/.test(msg.content):
                args = msg.content.split(/\s+--/);
                if (args.length < 2) return;

                decks = findObjs({ type: 'deck' });

                matches = _.chain(args)
                    .rest()
                    .map(function (n) {
                        var exact = _.filter(decks, function (d) {
                            return d.get('name').toLowerCase() === n.toLowerCase();
                        });
                        if (exact.length === 1) return exact;
                        return _.filter(decks, function (d) {
                            return d.get('name').toLowerCase().indexOf(n.toLowerCase()) !== -1;
                        });
                    })
                    .value();

                _.each(matches, function (m, i) {
                    if (m.length !== 1) {
                        errors.push('Deck [' + args[i + 1] + '] is ambiguous or missing.');
                    }
                });

                if (errors.length) {
                    sendChat('', '/w gm ' + errors.join('<br>'));
                    return;
                }

                matches = _.flatten(matches);

                var cards = filterObjs(o => o.get('_type') === 'card');

                _.each(matches, function (d) {
                    accum += '!import-deck --' +
                        nameEscape(d.get('name')) +
                        ' --' +
                        (d.get('showplayers') ? 'show' : 'hide') +
                        '<br>';

                    accum += '!import-deck-back --' +
                        nameEscape(d.get('name')) +
                        ' --' +
                        (d.get('avatar') || '') +
                        ' --' +
                        (d.get('defaultwidth') || '') +
                        ' --' +
                        (d.get('defaultheight') || '') +
                        '<br>';

                    _.each(_.filter(cards, c => c.get('_deckid') === d.id), function (c) {
                        accum += '!import-card --' +
                            nameEscape(d.get('name')) +
                            ' --' +
                            nameEscape(c.get('name')) +
                            ' --' +
                            (c.get('avatar') || '') +
                            ' --' +
                            (c.get('tooltip') || '') +
                            '<br>';
                    });
                });

                sendChat('', '/w gm ' + accum);
                break;
        }
    };

    /* ================= EVENTS ================= */

    var registerEventHandlers = function () {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready', function () {
    'use strict';
    DeckExport.CheckInstall();
    DeckExport.RegisterEventHandlers();
});
