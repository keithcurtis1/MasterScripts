on('ready',()=>{

  const JournalCommandDecoder = (t) => {
    const fixStart = t => t.replace(/^"https:\/\/app.roll20.net\/editor\/%60/,'"`');
    const percentOut = t => t.replace(/%{/g,'::PERCENT_OPEN_CURLY::');
    const percentIn = t => t.replace(/::PERCENT_OPEN_CURLY::/g,'%{');
    return percentIn(decodeURIComponent(percentOut(fixStart(t))));
  };


  const fixHandoutURLs = (data) => {
    const re = new RegExp(`"https://app.roll20.net/editor/%60[^"]*"`,'g');
    return data.replace(re,JournalCommandDecoder);
  };

  const alterHandout = (obj)=>obj.get('notes',(notesPrime)=>obj.get('gmnotes',(gmnotesPrime)=>{
    let notes = fixHandoutURLs(notesPrime);
    let gmnotes = fixHandoutURLs(gmnotesPrime);
    if(notes !== notesPrime){
      setTimeout(()=>obj.set('notes',notes), 1000);
    }
    if(gmnotes !== gmnotesPrime){
      setTimeout(()=>obj.set('gmnotes',gmnotes), 2000);
    }
  }));

  on('chat:message',msg=>{
    if('api'===msg.type && /^!fix-all-handout-urls(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)){
      const who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
      let handouts=findObjs({type:'handout'});
      let c = handouts.length;
      sendChat('',`/w "${who}" processing ${c} handout(s)"`);
      const burndown = () => {
        let h = handouts.shift();
        if(h) {
          alterHandout(h);
          setTimeout(burndown,0);
        } else {
          sendChat('',`/w "${who}" examined ${c} handout(s)"`);
        }
      };
      burndown();
    }
  });

  on('change:handout',alterHandout);
});