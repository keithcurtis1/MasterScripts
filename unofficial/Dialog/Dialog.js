on('ready', () => {
    const version = '0.0.5';
    const sheetVersion = 'D&D 5th Edition by Roll20';


    on('chat:message', (msg) => {
        if ('api' === msg.type && /^!dialog/i.test(msg.content)) {

            let p = getObj('player', msg.playerid);
            let theMessage = "";
            let toName = "";
            let repeatCode = "";
            let tt = [];
            let wType = "";
            let toCharID = "";
            let fromGM = false;
            let gmTokenImage = "https://s3.amazonaws.com/files.d20.io/images/213404917/Z84Y2BBqDlCctOjUdmYiyA/original.png?16175744605";
            let tokenImage = "";
            let tokenName = "";
            let tokenID = "";
            let tokenControlledby = "";
            let languageSender = "";
            let ls = [];
            let languageBackgroundColor = "#e6e6e6";
            let languageTextColor = "#000";

            let currentGM = findObjs({
                    type: 'player'
                })
                .filter((p) => playerIsGM(p.id))[0];
            let currentGMID = currentGM.get("_id");
            if (msg.content.includes("--id|gm") && currentGMID !== p.get("_id")) {
                sendChat('', `/w ${p.get('_displayname')} A player cannot use Dialog as the GM.`);
            } else {

                //CSS Declarations
                const openBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 6px 6px 6px 6px;  box-shadow: 2px 2px 4px 2px #000; background-color: #ffffff; min-height:60px; display: block; padding:2px 5px 0px 5px; text-align: left;  white-space: pre-wrap; !important'>";
                const openQuoteBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 35px 6px 6px 6px; box-shadow: 2px 2px 4px 2px #000; background-color: #e0e0d1; min-height:60px; display: block; padding:2px 5px 0px 5px; text-align: left;  white-space: pre-wrap;'>";
                const openWhisperBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 35px 6px 6px 6px; box-shadow: 2px 2px 4px 2px #000; background-color: #666; background-image: linear-gradient(0deg, #888, #555);min-height:60px; display: block; padding:0px 5px 0px 5px; text-align: left;  white-space: pre-wrap;'>";
                const openoocBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 35px 6px 6px 6px; box-shadow: 2px 2px 4px 2px #000; background-color: #ffffff; min-height:60px; display: block; padding:5px 2x 0px 5px; text-align: left;  white-space: pre-wrap;'>";
                const openEmoteBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 35px 6px 6px 6px; box-shadow: 2px 2px 4px 2px #000; background-color: #68895d; min-height:60px; display: block; padding:5px 2px 0px 5px; text-align: left;  white-space: pre-wrap;'>";
                let openLanguageBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 35px 6px 6px 6px; box-shadow: 2px 2px 4px 2px #000; background-color: " + languageBackgroundColor + "; min-height:60px; display: block; padding:5px 5px 0px 5px; text-align: left;  white-space: pre-wrap;'>";
                const openLanguageAnnouncementBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 0px; border-radius: 12px 12px 12px 12px; background-color: #000; display: block; padding:1px 3px 1px 3px; text-align: left;  white-space: pre-wrap;'>";
                const closeBox = "</div>";
                const openBigQuote = "<span style='color: #989867'>&#10077;</span> "
                const closeBigQuote = "&nbsp;<span style='color: #989867; display: inline-block, margin-top:3px !important'>&#10078;</span>"
                const quoteStyle = `<p style = 'font-size: 1.2em; line-height:1.0; font-family: serif; font-style: normal; font-weight: 700; color: #372d16; margin: 5px;'>${openBigQuote}`
                const whisperStyle = `<p style = 'font-size: 1.2em; line-height:1.0; font-family: serif; font-style: italic; font-weight: 700; color: #f2f2f2; margin: 5px;'>`
                const oocStyle = `<p style = 'font-size: 1.2em; line-height:1.0; font-family: serif; font-weight: 700; color: #372d16; margin: 5px;'>`
                const emoteStyle = `<p style = 'font-size: 1.2em; line-height:1.0; font-family: serif; font-style: italic; font-weight: 700; color: #fff; margin: 5px;'>&#10095; `
                let languageStyle = `<p style = 'font-size: 1.4em; line-height:1.0; font-family: serif; font-style: italic; font-weight: 700; color: ${languageTextColor}; margin: 5px;'>&#171; `
                const LanguageAnnouncementStyle = `<div style = 'font-size: 1.0em; line-height:1.0; text-align: center; font-family: serif; font-style:normal; font-weight: 700; color: #fff; margin: 5px !important'>`
                const buttonStyle = "'background-color: transparent; align:right; font-size: 0.8em; line-height:1.2; font-family: sans-serif; font-style: normal; font-weight: normal; padding: 0px;color: #ce0f69;display: inline-block;border: none; !important'";
                const quoteButtonStyle = "<a style = 'border: 0px none; background-color: #5b4b24; width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; line-height:1.2; margin: 0px 1px 0px 1px; padding: 0px; display: inline-block !important'";
                const whisperButtonStyle = "<a style = 'border: 0px none; background-color: #333;    width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; line-height:1.2; margin: 0px 1px 0px 1px; padding: 0px; display: inline-block !important'";
                const oocButtonStyle = "<a style = 'border: 0px none; background-color: #000;    width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; line-height:1.2; margin: 0px 1px 0px 1px; padding: 0px; display: inline-block !important'";
                const emoteButtonStyle = "<a style = 'border: 0px none; background-color: #3a4c34; width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; line-height:1.2; margin: 0px 1px 0px 1px; padding: 0px; display: inline-block !important'";
                const languageButtonStyle = "<a style = 'border: 0px none; background-color: #000; width:95%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; line-height:1.2; margin: 0px 1px 0px 1px; padding: 0px; display: inline-block !important'";
                const helpText = openBox + "<div style = 'background-color: #000; color: #fff; line-height: 1.4em;!important'>** DIALOG 0.1**</div>" +
                    "Dialog is a script that makes chat a bit more fun and easier to parse. It is token-based, either using selected and targeted tokens or specific token IDs." +
                    "<BR><BR>" +
                    "<code>**!Dialog** --id|*token_id* --to|*token_id* --type|*type* --*message*</code>" +
                    "<BR><BR>" +
                    "<code>--id|*token_id*</code>: Required. Specifies the speaker" +
                    "<BR><BR>" +
                    "<code>--to|*token_id*</code>: Optional. If a recipient is specified, the dialog becomes a whisper." +
                    "<BR><BR>" +
                    "<code>--type|*quote|whisper|emote|ooc*</code>: Optional. This determines the style of the dialog box to display. If not used, the script assumes an in-character quote. Whisper doesn't actually do anything, but is included as an option for making it plain that a whisper is intended. specifying a --to|*token_id* automatically chooses the whisper style." +
                    "<BR><BR>" +
                    "<code>--*message*</code>: anything placed after -- that does not match one of the other tags becomes the defacto message." +
                    "<BR><BR>" +
                    "**Token Image:** Clicking on the token image will repeat the last configuration. If you sent an emote, it will send another emote, propting you for the content. If you sent a whisper, it will send a whisper to the person you were whispering to. In this way, two characters who have started a whispered conversation can keep it going by just clicking on their token image in chat." +
                    "<BR>" + "**Button Line:** There is a line of buttons at the bottom of the dialog that you can use to change the type of dialog. This will also set the token image button to repeat the dialog type." +
                    "<BR>" +
                    "**Note about whispers:** because the API cannot issue a target command, you must initiate a whisper using a macro. Once it is established, you can use the token image button." +
                    "<BR><BR>" +
                    "**Sample Macros**" +
                    "<BR>" +
                    "**Basic quote: **<code>!dialog --id|&#64;&#123;selected|token_id&#125; --?{message|message}</code>" +
                    "<BR><BR>" +
                    "**Start a whisper: **<code>!dialog --id|&#64;&#123;selected|token_id&#125; --&#64;&#123;target|token_id&#125; --?{message|message}</code>" +
                    "<BR><BR>" +
                    "<code>!dialog --help</code>: displays this help box." +
                    closeBox;


                const HE = (() => {
                    const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
                    const e = (s) => `&${s};`;
                    const entities = {
                        '<': e('lt'),
                        '>': e('gt'),
                        "'": e('#39'),
                        '@': e('#64'),
                        '{': e('#123'),
                        '|': e('#124'),
                        '}': e('#125'),
                        '[': e('#91'),
                        ']': e('#93'),
                        '"': e('quot'),
                        '*': e('#42')
                    };
                    const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
                    return (s) => s.replace(re, (c) => (entities[c] || c));
                })();

                const L = (o) => Object.keys(o).forEach(k => log(`${k} is ${o[k]}`));


                function makeButton(label, command, style) {
                    return style + `href = '` + command + `'>` + label + `</a>`;
                }

                function isColor(value) {
                    return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value)

                }

                function imageFormat(imgsrc, tokenID) {
                    return `<a style='background-color: transparent; float:left; border: none; !important' href = '${repeatCode}'><img style = 'max-height: 70px; margin:-10px 2px 5px -10px' src = '${imgsrc}'></a>`;
                }

                function messageFormat(theMessage) {
                    return `${messageStyle}${theMessage}</p>`;
                }

                function isID(id) {
                    return ((id.charAt(0) === "-" && id.length === 20) ? true : false);
                }


                function dialog(tokenImage, theMessage) {
                    return '<a style = ' + buttonStyle + ' href="' + link + '">' + name + '</a>';
                }
                let fromID = "";

                const hexToRGB = (h) => {
                    let r = 0,
                        g = 0,
                        b = 0;

                    // 3 digits
                    if (h.length === 4) {
                        r = "0x" + h[1] + h[1];
                        g = "0x" + h[2] + h[2];
                        b = "0x" + h[3] + h[3];
                        // 6 digits
                    } else if (h.length === 7) {
                        r = "0x" + h[1] + h[2];
                        g = "0x" + h[3] + h[4];
                        b = "0x" + h[5] + h[6];
                    }
                    return [+r, +g, +b];
                };

                const RGBToHex = (r, g, b) => {
                    r = r.toString(16);
                    g = g.toString(16);
                    b = b.toString(16);

                    if (r.length === 1)
                        r = "0" + r;
                    if (g.length === 1)
                        g = "0" + g;
                    if (b.length === 1)
                        b = "0" + b;

                    return "#" + r + g + b;
                };

                const getAltColor = (primarycolor) => {
                    let pc = hexToRGB(primarycolor);
                    let sc = [0, 0, 0];

                    for (let i = 0; i < 3; i++) {
                        sc[i] = Math.floor(pc[i] + (.35 * (255 - pc[i])));
                    }

                    return RGBToHex(sc[0], sc[1], sc[2]);
                };

                const getTextColor = (h) => {
                    let hc = hexToRGB(h);
                    return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
                };

                /* -- THIS DOESN'T WORK BECAUSE TARGETING LOSES THE SELECTED VALUE
                log ("msg.selected[0]._id is " + msg.selected[0]._id);
                if (msg.selected) {ls = findObjs({type: 'graphic', id: msg.selected[0]._id})[0];}


                                            let t = findObjs({
                                                type: 'graphic',
                                                id: fromID
                                            })[0];
                if(undefined !== ls){
                    languageSender = ls.get("name");
                }else{
                      languageSender = "Unkown Speaker";
                            }
                            log ("languageSender is " + languageSender);
                */
                if (p) {

                    if (msg.content !== "!dialog --help" && msg.content !== "!dialog --macro" && !msg.content.includes("!dialog --assign")) {

                        let args = msg.content.split(" --")

                        let toID = "";
                        let toName = "";
                        let messageType = "quote";
                        let theMessage = "";

                        args.forEach(arg => {


                            switch (true) {
                                case (arg.substring(0, 3) === "id|"):

                                    if (isID(arg.split("|")[1])) {
                                        fromID = arg.split("|")[1];
                                    } else {
                                        if (arg.split("|")[1] === "gm") {
                                            fromID = p.get('_id');
                                            fromGM = true
                                        } else {
                                            fromID = ""
                                        }
                                    }
                                    break;

                                case arg.substring(0, 3) === "to|":
                                    if (isID(arg.split("|")[1])) {
                                        toID = arg.split("|")[1];
                                    } else {
                                        toName = arg.split("|")[1];
                                        toID = toName
                                    }
                                    break;


                                case arg.substring(0, 5) === "type|" && undefined !== arg.split("|")[1].match(/ooc|whisper|emote|quote|language/g):
                                    messageType = arg.split("|")[1];
                                    break;

                                case arg === "!dialog":
                                    theMessage = "";

                                    break;
                                default:
                                    theMessage = arg;
                            }
                            //If there is a recipient, it must be a whisper
                            if (toID !== "") {
                                if (messageType !== "language") {
                                    messageType = "whisper"
                                }
                            }

                        });
                        if (fromID !== "") {
                            let t = findObjs({
                                type: 'graphic',
                                id: fromID
                            })[0];

                            if (fromGM) {
                                tokenImage = gmTokenImage;
                                tokenName = "GM";
                                tokenID = "";
                                tokenControlledby = p.get('_id')

                            } else {
                                tokenImage = t.get('imgsrc');
                                tokenName = t.get('name');
                                tokenID = t.get('_id');
                                //tokenControlledby = t.get('controlledby')
                                tokenControlledby = getObj('character', t.get('represents')).get('controlledby');

                            }

                            if (isID(toID)) {
                                let tt = findObjs({
                                    type: 'graphic',
                                    id: toID
                                })[0];
                                toName = tt.get("name");
                                toCharID = tt.get("represents")
                            } else {
                                toName = toName
                            }

                            if (undefined === fromID || fromID === "") {
                                fromID = tokenID
                            }


                            if (fromID === p.get('_id') || tokenControlledby.includes(p.get('_id')) || playerIsGM(p.get('_id')) || tokenControlledby === 'all' || messageType === "language") {
                                /*
                                                        if (msg.content.split(" --")[1]) {
                                                            theMessage = msg.content.split(" --")[1];
                                                        } else {
                                                            theMessage = "says nothing."
                                                        }
                                                        */

                                if (undefined === theMessage) {
                                    theMessage = "says nothing."
                                }
                                //clean up the message
                                theMessage = theMessage
                                    .replace(/(\[.*?\])(\(.*?\))+/g, "$2$1")
                                    .replace(/(\()+/g, "<a style =" + buttonStyle + " href = '")
                                    .replace(/(\)\[)+/g, "'>")
                                    .replace(/(\])+/g, "</a>")
                                    .replace(/\/n/g, "<BR>")
                                    .replace(/Q{/g, '?{')
                                    .replace(/A{/g, '&#64;{');




                                if (t || fromGM) {
                                    let button1 = `<a style = 'border: 0px none; border-radius: 0px 0px 0px 2px; background-color: #5b4b24; width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; padding: 0px; display: inline-block !important' href=''>EMOTE</a> `;
                                    let button2 = `<a style = 'border: 0px none; border-radius: 0px 0px 0px 2px; background-color: #5b4b24; width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; padding: 0px; display: inline-block !important' href=''>OOC</a> `;
                                    let button3 = `<a style = 'border: 0px none; border-radius: 0px 0px 0px 2px; background-color: #5b4b24; width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; padding: 0px; display: inline-block !important' href=''>WHISPER</a> `;
                                    let button4 = `<a style = 'border: 0px none; border-radius: 0px 0px 0px 2px; background-color: #5b4b24; width:23%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; padding: 0px; display: inline-block !important' href=''>QUOTE</a>`;


                                    let emoteCommand = `!dialog --id|${fromID} --type|emote --?{Emote|Emote}`;
                                    let oocCommand = `!dialog --id|${fromID} --type|ooc --?{Out of Character|ooc}`;
                                    let languageCommand = "!dialog --id|" + fromID + " --to|" + HE(HE('@{selected|token_id}')) + " --type|language --?{Input Speech to translate|speech}";
                                    let whisperCommand = "!dialog --id|" + ((toID === currentGMID) ? 'gm' : toID) + " --to|" + ((fromGM) ? 'gm' : fromID) + " --?{Input Whisper|Whisper}";
                                    let whisperGMCommand = `!dialog --id| --id|${fromID} --to|gm --?{Input Whisper|Whisper}`;
                                    let quoteCommand = `!dialog --id|${fromID} --type|quote --?{Speech|speech}`;
                                    let buttonsIncluded = "";


                                    switch (messageType) {
                                        case "quote":
                                            box = openQuoteBox;
                                            messageStyle = quoteStyle
                                            button1 = makeButton("QUOTE", quoteCommand, quoteButtonStyle);
                                            button2 = makeButton("EMOTE", emoteCommand, quoteButtonStyle);
                                            button3 = makeButton("OOC", oocCommand, quoteButtonStyle);
                                            buttonsIncluded = `${button1}${button2}${button3}`;
                                            button4 = makeButton("TO GM", whisperGMCommand, quoteButtonStyle);
                                            repeatCode = `!dialog --id|${fromID} --?{Input Dialog|Speech}`
                                            theMessage = theMessage + closeBigQuote;
                                            break;

                                        case "whisper":
                                            box = openWhisperBox;
                                            messageStyle = whisperStyle
                                            button1 = makeButton("QUOTE", quoteCommand, whisperButtonStyle);
                                            button2 = makeButton("EMOTE", emoteCommand, whisperButtonStyle);
                                            button3 = makeButton("OOC", oocCommand, whisperButtonStyle);
                                            button4 = makeButton("RESPOND", whisperCommand, whisperButtonStyle);
                                            repeatCode = "!dialog --id|" + ((toID === currentGMID) ? 'gm' : toID) + " --to|" + ((fromGM) ? 'gm' : fromID) + " --?{Input Whisper|Whisper}";
                                            theMessage = "<span style='font-size: .7em; padding-bottom: 5px; display:inline-block; font-style: normal; line-height:.7; color: #bbb !important'>" + tokenName + " => " + toName + ":</span><BR>" + theMessage
                                            break;
                                        case "language":
                                            languageBackgroundColor = t.get("bar1_value");
                                            log("languageBackgroundColor is " + languageBackgroundColor);
                                            log("Is color? " + isColor(languageBackgroundColor));
                                            if (isColor(languageBackgroundColor)) {
                                                languageTextColor = getTextColor(languageBackgroundColor)
                                                languageStyle = `<p style = 'font-size: 1.4em; line-height:1.0; font-family: serif; font-style: italic; font-weight: 700; color: ${languageTextColor}; margin: 5px;'>&#171; `
                                                openLanguageBox = "<div style='margin-left:-30px; border: 0px none; margin-top: 5px; border-radius: 35px 6px 6px 6px; box-shadow: 2px 2px 4px 2px #000; background-color: " + languageBackgroundColor + "; min-height:60px; display: block; padding:5px 5px 0px 5px; text-align: left;  white-space: pre-wrap;'>";
                                            } else {
                                                languageBackgroundColor = "#e6e6e6";
                                                languageTextColor = "#000"
                                            }

                                            box = openLanguageBox;
                                            messageStyle = languageStyle;

                                            button1 = ""; //makeButton("QUOTE", quoteCommand, whisperButtonStyle);
                                            button2 = ""; //("EMOTE", emoteCommand, whisperButtonStyle);
                                            button3 = ""; //("OOC", oocCommand, whisperButtonStyle);
                                            button4 = makeButton("RESPOND IN " + tokenName.toUpperCase(), languageCommand, languageButtonStyle);
                                            repeatCode = "!dialog --id|" + toID + " --to|" + fromID + " --?{Input Speech to translate|speech}";
                                            repeatCode = languageCommand;
                                            //theMessage = "<span style='font-size: .7em; padding-bottom: 5px; display:inline-block; font-style: normal; line-height:.7; color: #bbb !important'>" + tokenName + " => " + toName + ":</span><BR>" + theMessage
                                            break;
                                        case "ooc":
                                            box = openoocBox;
                                            messageStyle = oocStyle
                                            button1 = makeButton("QUOTE", quoteCommand, oocButtonStyle);
                                            button2 = makeButton("EMOTE", emoteCommand, oocButtonStyle);
                                            button3 = makeButton("OOC", oocCommand, oocButtonStyle);
                                            button4 = makeButton("TO GM", whisperGMCommand, oocButtonStyle);
                                            repeatCode = `!dialog --id|${fromID} --type|ooc --?{Input Dialog|Speech}`
                                            break;
                                        case "emote":
                                            box = openEmoteBox;
                                            messageStyle = emoteStyle
                                            button1 = makeButton("QUOTE", quoteCommand, emoteButtonStyle);
                                            button2 = makeButton("EMOTE", emoteCommand, emoteButtonStyle);
                                            button3 = makeButton("OOC", oocCommand, emoteButtonStyle);
                                            button4 = makeButton("TO GM", whisperGMCommand, emoteButtonStyle);
                                            repeatCode = `!dialog --id|${fromID} --type|emote --?{Input Dialog|Speech}`
                                            theMessage = tokenName + " " + theMessage
                                            break;
                                        default:
                                            box = openQuoteBox;
                                            messageStyle = quoteStyle
                                            button1 = makeButton("QUOTE", quoteCommand, quoteButtonStyle);
                                            button2 = makeButton("EMOTE", emoteCommand, quoteButtonStyle);
                                            button3 = makeButton("OOC", oocCommand, quoteButtonStyle);
                                            button4 = makeButton("TO GM", whisperGMCommand, quoteButtonStyle);
                                            repeatCode = `!dialog --id|${fromID} --?{Input Dialog|Speech}`;
                                    }


                                    if (toCharID !== "") {
                                        toName = (getObj('character', toCharID)).get('name')
                                    }


                                    let buttonHolder = `<p><div style = 'bottom: -10px; border: 0px none;  border-top: 1px solid rgba(0,0,0,0.1); border-radius: 0px 0px 0px 2px;  align:center; width:100%%; text-align: center; font-size: 0.85em; font-family: sans-serif; font-style: normal; font-weight: normal; color: #fff; padding: 0px; display: inline-block !important'>${button1}${button2}${button3}${button4}</div></p>`

                                    switch (messageType) {
                                        case "whisper":
                                            sendChat(tokenName, `/w "${toName}"` + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                            log("A");
                                            sendChat(tokenName, `/w "${p.get('_displayname')}" ` + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                            log("B");
                                            break;
                                        case "language":
                                            let speakerName = (getObj('graphic', toID)).get('name');
                                            let speakerImg = `<img src ='${(getObj('graphic', toID)).get('imgsrc')}' style = 'max-height: 25px; float: left; margin-top: -6px; margin-left: -10px !important'> `;
                                            log("speakerImg is " + speakerImg);
                                            theMessage = theMessage + " &#187;";
                                            sendChat('Language', openLanguageAnnouncementBox + LanguageAnnouncementStyle + speakerImg + `${speakerName} speaks in ${tokenName}</div>`);
                                            sendChat(tokenName, `/w "${tokenName}"` + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                            break;
                                        default:
                                            sendChat(tokenName, "" + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                    }



                                    /*                                    if (messageType === "whisper") {

                                                                            sendChat(tokenName, `/w "${toName}"` + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                                                            sendChat(tokenName, `/w "${p.get('_displayname')}" ` + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                                                        } else {
                                     if (messageType === "language"){sendChat(tokenName, "" + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                    }


                                                                        } else {
                                                                            sendChat(tokenName, "" + box + imageFormat(tokenImage, tokenID) + messageFormat(theMessage) + buttonHolder + closeBox);
                                                                        }*/




                                } else {
                                    sendChat('', `/w gm No character found for that ID!`);
                                }

                            } else {
                                sendChat('', `/w ${p.get('_displayname')} You do not control this character.`);
                            }

                        } else {
                            sendChat('', `/w ${p.get('_displayname')} You must specify a token ID of a character you control.`);
                        }
                    } else {

                        switch (msg.content) {
                            case "!dialog --help":
                                sendChat('Dialog', helpText);
                                break;
                            case "!dialog --macro":
                                // code block
                                if (msg.selected) {
                                    selection = msg.selected
                                        .map(o => getObj('graphic', o._id))
                                        .filter(o => undefined !== o)

                                    let languageTokens = selection
                                        .filter(t => t.get('represents').length)
                                        .map(t => ({
                                            token: t,
                                            character: getObj('character', t.get('represents'))
                                        }))
                                        .filter(o => undefined !== o.character);

                                    let macroCode = `!dialog --id|?{Select a Language`;
                                    let ltName = "";
                                    let ltID = "";

                                    languageTokens.forEach(lt => {
                                        ltName = lt.character.get("name");
                                        ltID = lt.token.get("_id");
                                        macroCode = macroCode + `|${ltName},${ltID}`
                                    });

                                    macroCode = macroCode + `} --to|${HE(HE('@{selected|token_id}'))} --type|language --?{message|message}`;
                                    sendChat('Dialog', `Paste this code into a macro or ability.<BR><pre>${macroCode}</pre>`);

                                    L({
                                        macroCode
                                    })
                                } else {
                                    log("You must select some language tokens");

                                }
                                break;
                            default:
                                break;
}

                                if (msg.content.includes("!dialog --assign")) {
                                    

                                    let speaker = msg.content.split(/\s+/)[2]
                                    let language = msg.content.split(/\s+/)[3]
                                    if (isID(speaker) && isID(language)) {
                                        let speakerCharacter = getObj('character', speaker);
                                        let languageCharacter = getObj('character', language);

                                        let speakerName = speakerCharacter.get('name');
                                        let languageName = languageCharacter.get('name');
                                        let languageControllers = languageCharacter.get('controlledby');
                                        let speakerController = speakerCharacter.get('controlledby');
                                        L({
                                            languageControllers,
                                            speakerController
                                        });

                                        let lcControl = languageControllers.split(/\s*,\s*/);
                                        let scControl = speakerController.split(/\s*,\s*/);
                                        let targetControl = [...new Set([...lcControl, ...scControl])];

                                        targetControl = targetControl.join(',');
                                        languageCharacter.set("controlledby", targetControl);
                                        sendChat('Dialog', `${openBox}${speakerName} can now speak ${languageName}${closeBox}`);
                                        L({
                                            targetControl
                                        });

                                    }
                                    if (speaker && language) {
                                        L({
                                            speaker,
                                            language
                                        });
                                    } else {
                                        log("Character ids not recorded. Make sure you have a player character token selected, that they are listed as the first controller in the list of controllers. Make sure that the token you target (the second id passed to the script) is a token that represents a character that is intended to be a language.");
                                    }

                                }

                        
                    }

                }
            }
        }
    });
    log(`Dialog v.${version} is ready! Command is: !Dialog --id|token_id [--to|token_id] [--type|type] --message`);
});