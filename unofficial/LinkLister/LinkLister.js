on('chat:message', (msg_orig) => {
    let msg = _.clone(msg_orig);
    if (!/^!summarize/.test(msg.content)) {
        return;
    }
    let handoutTitle = '!LinkList';
    let handoutBaseUrl = `http://journal.roll20.net/handout/`;
    let characterBaseUrl = `http://journal.roll20.net/character/`;
    let noteHandout = findObjs({
        type: 'handout',
        name: handoutTitle
    });
    noteHandout = noteHandout ? noteHandout[0] : undefined;
    if (!noteHandout) {
        noteHandout = createObj('handout', {
            name: handoutTitle,
            archived: false,
            inplayerjournals: "all",
            controlledby: "all"
        });
        let noteHandoutid = noteHandout.get("_id");
    }


    let characters = findObjs({ type: 'character' });
    let handouts = findObjs({ type: 'handout' });
    let output = `<h3>Characters:</h3><br>${characters.map((obj) => { return "<a href ='" + characterBaseUrl + obj.get('id') + "'>" + obj.get('name') + "</a> " + handoutBaseUrl + obj.get('id') }).join('<br>')}<br><br><h3>Handouts:</h3><br>${handouts.map((obj) => { return "<a href ='" + handoutBaseUrl + obj.get('id') + "'>" + obj.get('name') + "</a> " + handoutBaseUrl + obj.get('id') }).join('<br>')}`;
    noteHandout.set("notes", output);
    //uncomment next line to send to chat;
    // sendChat('Journal Summary','&{template:default}{{name=links}}{{ ='+output+'}}');
});