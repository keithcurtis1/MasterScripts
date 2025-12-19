var HoHoHoDeck = HoHoHoDeck || (function () {
    'use strict';

    const DECK_NAME = 'Holiday Cards';

    const BACK = {
        img: 'https://files.d20.io/images/468295972/25VJFYxmcJn4woEjqz5QuA/max.png?1766123881',
        width: 181.5,
        height: 250
    };

    const CARDS = [
        { name: 'Carol of Courage', img: 'https://files.d20.io/images/468295975/kwqHN-y5MuyChnmzptBEtA/max.png?1766123880' },
        { name: "Caroler's Harmony", img: 'https://files.d20.io/images/468295974/aQ8jdoN7-BQD5HPVfKhm1g/max.png?1766123880' },
        { name: 'Candy Cane Focus', img: 'https://files.d20.io/images/468295971/S-faJudjf6CJqyyEme51Gw/max.png?1766123880' },
        { name: 'Bells of Warning', img: 'https://files.d20.io/images/468295973/o1059-mmglDzz56s26fk6g/max.png?1766123881' },
        { name: "Caroler's Resolve", img: 'https://files.d20.io/images/468295978/jyezEFbA4tOWvBYOyGsLZg/max.png?1766123884' },
        { name: 'Elf-Crafted Tools', img: 'https://files.d20.io/images/468295983/LyYFSDpTrKg29QHtYiZOmg/max.png?1766123885' },
        { name: 'Cocoa Break', img: 'https://files.d20.io/images/468295979/ywq3XCfBj1AqMAnAAR0SIw/max.png?1766123885' },
        { name: 'Crackling Hearth', img: 'https://files.d20.io/images/468295980/PmxzUqbm8tITxhhwvw2R1w/max.png?1766123887' },
        { name: "Elf Worker's Craftmanship", img: 'https://files.d20.io/images/468295981/xZ0Ffd-a1O60ZO33bfhVwg/max.png?1766123888' },
        { name: 'Evergreen Focus', img: 'https://files.d20.io/images/468295985/eTlZZ6JC2CGDqzV0ULx8mg/max.png?1766123891' },
        { name: 'Everlight Candle', img: 'https://files.d20.io/images/468295988/fEnMWrQUgCR3mi9j7rH8sg/max.png?1766123892' },
        { name: 'Festive Confidence', img: 'https://files.d20.io/images/468295989/HUGFXJizHVwKML_7W9thWQ/max.png?1766123893' },
        { name: 'Evergreen Shield', img: 'https://files.d20.io/images/468295987/4tIn52WsGWidDDffqgKegQ/max.png?1766123894' },
        { name: 'Festive Flourish', img: 'https://files.d20.io/images/468295991/rF7IouV8dGbKZ7cGzkVBvA/max.png?1766123896' },
        { name: 'Festive Footing', img: 'https://files.d20.io/images/468295992/bIPgHrTTHyITacEOQW4vLQ/max.png?1766123897' },
        { name: 'Festive Resilience', img: 'https://files.d20.io/images/468295995/sUNqwEwNl9v7mk4CvRvqQg/max.png?1766123898' },
        { name: 'Fireside Focus', img: 'https://files.d20.io/images/468296000/KDv6gdLwJ_qvPw-IuTF3kw/max.png?1766123899' },
        { name: 'Festooned Armor', img: 'https://files.d20.io/images/468295996/loNWPXt-oxIxolRJlB6TVw/max.png?1766123900' },
        { name: 'Gift Bow Timing', img: 'https://files.d20.io/images/468296001/vr9tALExn5lxRcLeNC1GNQ/max.png?1766123900' },
        { name: 'Gift Exchange', img: 'https://files.d20.io/images/468296003/GOdIi5dKFvefLkyIGGfVmw/max.png?1766123902' },
        { name: 'Glittering Snow', img: 'https://files.d20.io/images/468296006/-e4kO09ok4j31PaES1h4mg/max.png?1766123904' },
        { name: 'Heath-Bound Luck', img: 'https://files.d20.io/images/468296007/4psFZaEAzDYM_nDQdosVpA/max.png?1766123905' },
        { name: 'Gift Receipt', img: 'https://files.d20.io/images/468296004/6c9C8Fg3wyodcocA8_J1yQ/max.png?1766123906' },
        { name: 'Gift Tag Mixup', img: 'https://files.d20.io/images/468296005/W804OaSXOkvSbV2iZE4hnQ/max.png?1766123906' },
        { name: 'Heathfire Timing', img: 'https://files.d20.io/images/468296008/qP9t5THK2LvXTPHVTzVINQ/max.png?1766123908' },
        { name: 'Holiday Grace', img: 'https://files.d20.io/images/468296013/bHqllFeliioTmnqDBBOggw/max.png?1766123910' },
        { name: 'Holiday Patience', img: 'https://files.d20.io/images/468296014/cGEQnvetQps3e_RqqUd4cQ/max.png?1766123911' },
        { name: 'Holly Berry Luck', img: 'https://files.d20.io/images/468296017/GhCdZYgRmxBzO9SbW-yyIA/max.png?1766123913' },
        { name: 'Holiday Peace', img: 'https://files.d20.io/images/468296018/r8pqJiY64IGQzH0sl07UzA/max.png?1766123914' },
        { name: 'Holly-Crowned Authority', img: 'https://files.d20.io/images/468296022/Ix8bwIk4HBa8dunBQp6g8w/max.png?1766123917' },
        { name: 'Icicle Grip', img: 'https://files.d20.io/images/468296024/6DJ4hS0Q11gIPqUlEaQneA/max.png?1766123917' },
        { name: 'Icicle Precision', img: 'https://files.d20.io/images/468296029/Ib7zY5u4YE1tVaC3Xnhb2w/max.png?1766123919' },
        { name: 'Hot Cocoa Resolve', img: 'https://files.d20.io/images/468296023/Y2Wn8-O_5hsjpHLeqJL6nA/max.png?1766123919' },
        { name: 'Last-Minute Gift', img: 'https://files.d20.io/images/468296031/hJ2pimwUWPFIpJAllTmDjQ/max.png?1766123920' },
        { name: 'Merriment Echo', img: 'https://files.d20.io/images/468296035/DyDz2E20UfalPC1UX2_wwQ/max.png?1766123923' },
        { name: 'March of the Wooden Soldiers', img: 'https://files.d20.io/images/468296034/rhxw8XsolAvq3yjQZoD9YQ/max.png?1766123923' },
        { name: 'Merry Momentum', img: 'https://files.d20.io/images/468296036/lNsgkWfWV9UTsRcSOIrNgA/max.png?1766123923' },
        { name: 'Mistletoe Charm', img: 'https://files.d20.io/images/468296038/tO_y8N5zRb-ECqPnugRPqQ/max.png?1766123924' },
        { name: 'North Pole Bureaucracy', img: 'https://files.d20.io/images/468296040/3YggDZSWyLkFBBbEbRncrw/max.png?1766123926' },
        { name: 'North Wind Push', img: 'https://files.d20.io/images/468296045/e6YVj2oYHDNVOZTsjBSHCw/max.png?1766123929' },
        { name: 'North Pole Insight', img: 'https://files.d20.io/images/468296044/aDdg5EAkY1T84RnB6iISrA/max.png?1766123929' },
        { name: 'Quick as a Wink', img: 'https://files.d20.io/images/468296047/7ki6kBtUJwCmIYzbOVkBrw/max.png?1766123930' },
        { name: 'North Start Bearing', img: 'https://files.d20.io/images/468296046/Kx07nRzKeOSDhlFBcW9o4w/max.png?1766123931' },
        { name: 'Reindeer Pathfinding', img: 'https://files.d20.io/images/468296048/EpEtWKBWYYnuLaqnMRlB3A/max.png?1766123931' },
        { name: 'Reindeer Reflexes', img: 'https://files.d20.io/images/468296051/-MsHeygLWGDU6bOxFlOQJg/max.png?1766123935' },
        { name: 'Reindeer Teamwork', img: 'https://files.d20.io/images/468296050/h7u_0gbNtdg-uaRUdxfAHw/max.png?1766123935' },
        { name: 'Ribbon Snare', img: 'https://files.d20.io/images/468296053/QrHPbua955vTwVcaNrFAlw/max.png?1766123935' },
        { name: 'Seasonal Inspiration', img: 'https://files.d20.io/images/468296055/hpflSGD5G3eWYlZ5w1yQMA/max.png?1766123936' },
        { name: 'Sack of Holding', img: 'https://files.d20.io/images/468296054/OnAeiNQVm8efDo8TICjlow/max.png?1766123936' },
        { name: 'Sleigh Momentum', img: 'https://files.d20.io/images/468296059/yc2Sh9A2qIB4YkvA2BCVQg/max.png?1766123940' },
        { name: 'Snow Globe Moment', img: 'https://files.d20.io/images/468296060/6Wo-ybaVWgmbbcGRGhO7zQ/max.png?1766123941' },
        { name: 'Silent Night', img: 'https://files.d20.io/images/468296058/1vlzXQ1C0eZqqeQDlMuocg/max.png?1766123941' },
        { name: 'Snow-Quiet Step', img: 'https://files.d20.io/images/468296062/wn8ACFJ2I8nPtynnb6iHjQ/max.png?1766123942' },
        { name: 'Holiday Memory', img: 'https://files.d20.io/images/468296063/qiiZCxap0LDOWiWWpmDqzg/max.png?1766123944' },
        { name: 'Snowbound Patience', img: 'https://files.d20.io/images/468296068/jPtYIT9s8jhk1dNouFHQew/max.png?1766123945' },
        { name: 'Snowfall Calm', img: 'https://files.d20.io/images/468296069/0AZ8MkEc16eVQ5uDX9f1Ig/max.png?1766123947' },
        { name: 'Snowdrift Cushion', img: 'https://files.d20.io/images/468296070/ijduLyUdWH_NoXNzMNrksw/max.png?1766123947' },
        { name: 'Snowman Fortitude', img: 'https://files.d20.io/images/468296072/EpSSgmDEwA42bE8OxDRU3Q/max.png?1766123948' },
        { name: 'Star on the Tree', img: 'https://files.d20.io/images/468296073/BSzC7F9ClKpl-l297djQmg/max.png?1766123949' },
        { name: 'Stocking Luck', img: 'https://files.d20.io/images/468296074/9MEdyMFlJNF3SsvdyJWjwA/max.png?1766123951' },
        { name: 'Stocking Stuffer', img: 'https://files.d20.io/images/468296075/_d4pwajNx-Jj9ymGLB0UVg/max.png?1766123952' },
        { name: 'Surprise Present', img: 'https://files.d20.io/images/468296077/S4L0DqpOBaWVucVzXQmU6w/max.png?1766123954' },
        { name: 'Stocking Surprise', img: 'https://files.d20.io/images/468296076/FlLztZB6K6MwVSgqLx_WfA/max.png?1766123954' },
        { name: 'Tin Soldier Discipline', img: 'https://files.d20.io/images/468296078/P4VQXhLd0L80xbiY1Ygc4A/max.png?1766123956' },
        { name: 'Tinsel Distraction', img: 'https://files.d20.io/images/468296079/17iNFhn8I62JDqrGo7Leqg/max.png?1766123957' },
        { name: 'Tinsel Reflection', img: 'https://files.d20.io/images/468296080/wl8FMsu1oGJ_tQcMEu0sJg/max.png?1766123957' },
        { name: 'Toboggan Run', img: 'https://files.d20.io/images/468296081/-Vzb43ENtryD56_8GEP5lQ/max.png?1766123960' },
        { name: 'Unwrap Early', img: 'https://files.d20.io/images/468296082/XTEmQIHuQ-IovKNeiD9-Hg/max.png?1766123960' },
        { name: 'Winter Solstice Balance', img: 'https://files.d20.io/images/468296086/stMMhXsuA2Nd9OeDe4UySg/max.png?1766123964' },
        { name: 'Warm Mittens', img: 'https://files.d20.io/images/468296083/iS3MYXTDcja_OyH1eYOClg/max.png?1766123964' },
        { name: "Winter's Poise", img: 'https://files.d20.io/images/468296085/GC_XeL5fj7uHmZQ-6-2HyQ/max.png?1766123964' },
        { name: 'Wreath of Focus', img: 'https://files.d20.io/images/468296090/_sWyJtCT5ecBfSBuI3dsLQ/max.png?1766123968' },
        { name: 'Yule Log Endurance', img: 'https://files.d20.io/images/468296091/P-C0TiLXN3Cylbg2kKDDOA/max.png?1766123970' },
        { name: 'Yuletide Precision', img: 'https://files.d20.io/images/468296093/De9ZFTSeE9BoOH_ugo4s5Q/max.png?1766123972' }
    ];

    const createDeck = function () {
        findObjs({ _type: 'deck', name: DECK_NAME }).forEach(d => d.remove());

        const deck = createObj('deck', {
            name: DECK_NAME,
            avatar: BACK.img,
            avatar_width: BACK.width,
            avatar_height: BACK.height,
            shown: true,
            defaultwidth: 181.5,
            defaultheight: 250
        });

        CARDS.forEach(c => {
            createObj('card', {
                name: c.name,
                deckid: deck.id,
                avatar: c.img,
                sides: 1
            });
        });

        sendChat('HoHoHo','/w gm <div style="background:#b30000;color:white;padding:10px 14px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;max-width:600px;"><div style="text-align:center;font-size:20px;margin-bottom:10px;">🎄 Happy Holidays! 🎄</div>This deck of Holiday Cards contains a host of player buffs. The suggested use is:<br><br><ul style="padding-left:20px;margin:0;"><li style="margin-bottom:10px;">Allow players to draw three cards at the beginning of a session. The cards can be played at any time. No card can last past the end of the session.</li><li style="margin-bottom:10px;">The holiday season is all about generosity. A player can play one of their cards on behalf of another player, as if that player had played the card. GMs might want to award Inspiration (or its equivalent) to reward such behavior.</li><li style="margin-bottom:10px;">No single deck can cover all game systems. GMs are encouraged to honor the spirit of the card if the suggested mechanics do not exist in the system they are playing. Just like players, GMs should interpret generously.</li><li>Be sure to shuffle before you use the deck.</li></ul></div>');
    };

    on('chat:message', function (msg) {
        if (msg.type === 'api' && msg.content === '!hohoho' && playerIsGM(msg.playerid)) {
            createDeck();
        }
    });

    return {};
}());
