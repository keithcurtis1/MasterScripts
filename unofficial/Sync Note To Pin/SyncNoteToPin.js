on('change:pin', function(pin, prev) {
    // Only react if the pin actually moved
    if (pin.get('x') === prev.x && pin.get('y') === prev.y) {
        return;
    }

    let pageId = pin.get('_pageid');
    let pinName = pin.get('subLink') || pin.get('title');

    if (!pinName) {
        return;
    }

    // Find tokens with the exact same name on the same page
    var tokens = findObjs({
        _type: 'graphic',
        _pageid: pageId,
        name: pinName
    }).filter(t => {
        let charId = t.get('represents');
        if (!charId) return false;

        let ch = getObj('character', charId);
        if (!ch) return false;

        let cname = ch.get('name');
        return cname === 'Utility' || cname === 'Site';
    });

    if (!tokens.length) {
        return;
    }

    // Move the first matching token
    tokens[0].set({
        left: pin.get('x'),
        top: pin.get('y') + 15
    });
});
