on('ready',()=>{

    const IN_PLAYER_JOURNALS = true;

    const TIME_TO_CHECK = 1000;
    const styles = {
        box: 'display: block; border: 1px solid #999; border-radius: .3em; padding: .3em; color:#ccc; background-color: #555; box-shadow: 0 0 25px 2px #999; margin: 1em 0 1em 0;',
        charRow: 'display: block; vertical-align:middle; border-radius:10em; margin: 0em .3em .2em .2em;background-color: #333',
        img: 'max-width: 2em; max-height: 2em; width:auto; height:auto;float:left;margin: .2em .4em .2em .2em; display: inline-block; float:left',
        link: 'color: #eee; border: 1px solid #999; border-radius: .1em 10em 10em .1em; min-height:100%; padding: .3em 1em; background-color:#702c91;font-weight: bold;display: inline-block;float: right; margin: .3em;',
        addBtn: 'color: #fff; border: 1px solid #999; border-radius: 10em; padding: .3em .3em; background-color:#ce0f69;font-weight: bold;display: inline-block;float: right;margin: .3em;',
        linkBtn:  'color: #eee; border: 1px solid #999; border-radius: 10em; padding: .3em 1em; width:85%; background-color:#702c91;font-weight: bold;display: inline-block; margin: .1em .3em .0em .3em;'
    };
    const defaultImg = 'https://app.roll20.net/images/character.png';
    const clear = ()=>`<div style="clear:both"></div>`;

    const GetCharImage = (c) => c.get('avatar')||defaultImg;
    const GetShowCharacter = (c) => `<div style="${styles.charRow}"><a style="${styles.link}" href="http://journal.roll20.net/character/${c.id}">Open</a><img style="${styles.img}" src="${GetCharImage(c)}"/>${c.get('name')}${clear()}</div>`;
    const AddButton = () => `<a style="${styles.addBtn}" href="!add-player-character">Make New</a>`;

    const AddPlayerCharacter = (player) => {
        let c = createObj('character',{
            controlledby: player.id,
            name: `${player.get('displayname')}'s New Character`,
            inplayerjournals: (IN_PLAYER_JOURNALS ? 'all' : '')
        });
        return c;
    };

    const ShowPlayerCharacters = (player,chars)=>{
        chars = chars||findObjs({
            type: 'character',
            archived: false
        }).filter(c=>c.get('controlledby').split(/\s*,\s*/).includes(player.id))
        .filter(c=>c.get('archived')===false);

        sendChat('',`/w "${player.get('displayname')}" <div style="${styles.box}"><div>${AddButton()}<div style="display:inline-box; padding:.6em 0em 0em .1em; font-weight:bold">Your Characters:</div>${clear()}</div>${chars.map(GetShowCharacter).join('')}<BR><b>Player Links:</b><BR><a href="http://journal.roll20.net/handout/-NHmGp_bkCXooGI3xEqL" style="${styles.linkBtn}">⚔️ Quest Log 🪄</a><BR><a href="http://journal.roll20.net/handout/-LujcAJKmCYaa0ZjqMpR" style="${styles.linkBtn}">Character Creation Guidelines</a><BR><a href="http://journal.roll20.net/handout/-NHmOL7G1zr9ihd-uaoF" style="${styles.linkBtn}">Ancrist Player notes</a><BR><a href="http://journal.roll20.net/handout/-NM6v5RMLJEOluZQ06Ur" style="${styles.linkBtn}">NEW--Afterlife</a><BR><a href="!&#13;&#37;{Macros|Menu}" style="${styles.linkBtn}">Player Menu <i>(select token first)</i></a></div></div>`);
    };

    const CheckPlayerCharacters = (player) => {
        if(playerIsGM(player.id)){
            return;
        }
        let chars = findObjs({
            type: 'character',
            archived: false
        }).filter(c=>c.get('controlledby').split(/\s*,\s*/).includes(player.id));

        if( ! chars.length){
            chars.push(AddPlayerCharacter(player));
        }
        ShowPlayerCharacters(player,chars);
    };

    
    on('chat:message', (msg) => {
        if('api' === msg.type && /^!add-player-character\b/i.test(msg.content)){
            let player = getObj('player',msg.playerid);
            if(player){
                AddPlayerCharacter(player);
                ShowPlayerCharacters(player);
            }
        }
    });


    const checkAll = () => {
        findObjs({
            type: 'player'
        }).forEach(CheckPlayerCharacters);
    };



    setTimeout(()=>{
            checkAll();
            on('change:player:_online',(obj)=>{
                if(true === obj.get('online')){
                    setTimeout(()=>CheckPlayerCharacters(obj),TIME_TO_CHECK);
                }
            });
        },
        TIME_TO_CHECK
    );

});