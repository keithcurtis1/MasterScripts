// ==================================================
// Script:   ListHeaderLinks
// Author:   Keith Curtis
// Version:  0.0.1
// ==================================================

var API_Meta = API_Meta || {};
API_Meta.ListHeaderLinks = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ListHeaderLinks.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

on("ready", () => {
"use strict";

const scriptName = "ListHeaderLinks";
const version = "0.0.1";
    //Changelog
    //0.0.1 Added GMnotes/Notes toggle
    //0.0.0 Initial script

log(`-=> ${scriptName} v${version} is loaded.`);

state.ListHeaderLinks = state.ListHeaderLinks || { headers: {} };

/* =========================================================
CSS OBJECT
========================================================= */
const getCSS = () => ({
    tableLayout: `width:100%; border-collapse:collapse;`,
    leftPanel: `width:40%; vertical-align:top; padding:6px; background-color:#47311f; border-right:1px solid #888;`,
    rightPanel: `width:60%; vertical-align:top; padding:6px;`,
    handoutButton: `display:block; margin:3px 0; padding:3px 6px; background:#e2c69c; color:#111 !important; border:0px solid transparent; border-radius:4px; font-weight:bold; text-decoration:none;`,
    messageContainer: `background:#bbb; padding:12px; border-radius:10px; border:2px solid #888; color:#111;`,
    messageTitle: `font-weight:bold; font-size:20px; margin-bottom:6px;`,
    scrollPanel: `max-height:630px; overflow-y:auto; padding-right:4px;`,
    headerContainer: `
width:100%;
`,

headerScroll: `
max-height:600px;
overflow-y:auto;
padding-right:4px;
`,
    
    headerFilterRow: `
width:100%;
white-space:nowrap;
margin-bottom:4px;
`,

headerFilterButton: `
display:inline-block;
text-align:center;
padding:4px 0;
color:black;
text-decoration:none;
font-weight:bold;
margin-right:1px;
border:1px solid #777;
`,

headerHandoutButton: `
display:inline-block;
text-align:center;
padding:4px 0;
background:#e2c69c;
color:#111;
text-decoration:none;
font-weight:bold;
margin-right:6px;
border:0px solid transparent;`,

    messageButton: `display:inline-block; padding:4px 8px; background:#444; color:white; border-radius:4px; text-decoration:none; margin-top:6px;`
});

/* =========================================================
LEVEL COLORS (H1–H4)
========================================================= */
const levelColors = {
    1: "#a47148",
    2: "#c28b5a",
    3: "#d9a873",
    4: "#f0c98f"
};

/* =========================================================
STYLED MESSAGE HELPER
========================================================= */
const sendStyledMessage = (titleOrMessage, messageOrUndefined, isPublic=false) => {
    const css = getCSS();
    let title, message;

    if(messageOrUndefined === undefined) {
        title = scriptName;
        message = titleOrMessage;
    } else {
        title = titleOrMessage || scriptName;
        message = messageOrUndefined;
    }

    message = String(message).replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        (_,label,command) => `<a href="${command}" style="${css.messageButton}">${label}</a>`
    );

    let html =
        `<div style="${css.messageContainer}">
            <div style="${css.messageTitle}">${title}</div>
            ${message}
        </div>`;

    html = html.replace(/[\r\n]+/g,'');

    sendChat(scriptName, `${isPublic?"":"/w gm "}${html}`, null, {noarchive:true});
};

/* =========================================================
HANDOUT MANAGEMENT
========================================================= */
const getOrCreateIndexHandout = () => {
    let handout = findObjs({_type:"handout", name:"!HeaderLinks"})[0];
    if(!handout) handout = createObj("handout",{name:"!HeaderLinks"});
    return handout;
};


/* =========================================================
BUILD HANDOUT QUERY
========================================================= */
const buildHandoutQuery = () => {

    const handouts = findObjs({_type:"handout"})
        .filter(h => h.get("name") !== "!HeaderLinks")
        .sort((a,b)=>a.get("name").localeCompare(b.get("name")));

    const options = handouts.map(h =>
        `${h.get("name")},${h.id}`
    ).join("|");

    return `?{Select Handout|${options}}`;
};


/* =========================================================
HEADER PARSER
========================================================= */
const parseHeaders = (html, handoutID) => {
    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    let results = [];
    while((match = regex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]*>/g,"").trim();
        const encoded = text.replace(/ /g,"%20");
        const url = `http://journal.roll20.net/handout/${handoutID}/#${encoded}`;
        results.push({level, text, url});
    }
    return results;
};

/* =========================================================
HEADER LIST (RENDER)
========================================================= */
const renderHeaderListForSection = (headers) => {
    const rightPadding = 4;
    return headers.map(h => {
        const nbspCount = (h.level - 1);
        const nbspIndent = '\u00A0'.repeat(nbspCount);
        const color = levelColors[h.level] || "#ccc";
        return `
        <div style="
            display:inline-block;
            width:32px;
            background:${color};
            text-align:left;
            color:#111;
            font-weight:bold;
            margin-right:5px;
            padding-right:${rightPadding}px;
        ">
            ${nbspIndent}H${h.level}
        </div>
        <a href="${h.url}">${h.text}</a>
        <br>
        `;
    }).join("");
};

/* =========================================================
HEADER FILTER ROW WITH NOTES/GMNOTES
========================================================= */
const renderHeaderFilterRow = (handoutID, currentLevel=4, currentSection="gmnotes") => {

    const css = getCSS();

    const handout = findObjs({_type:"handout", id:handoutID})[0];
    const handoutName = handout?.get("name") || "Unknown Handout";

    const sections = ["notes","gmnotes"];
    const sectionColors = { notes: "#f0c98f", gmnotes: "#f0c98f" };

    let row = `<div style="${css.headerFilterRow}">`;

    /* Handout Name Button (40%) */
const query = buildHandoutQuery();

row += `
<a style="${css.headerHandoutButton} width:50%;"
   href="!headerlinks --show ${query} --level 4 --section=${currentSection}">
    ${handoutName}
</a>
`;

    /* Notes / GMNotes buttons (10% each) */
    sections.forEach(sec => {

        const isActive = (sec === currentSection);
        const bgColor = isActive ? sectionColors[sec] : "#ccc";
        const borderColor = isActive ? "transparent" : "transparent";
        const textColor = isActive ? "#111" : "#555";

        row += `
            <a style="${css.headerFilterButton}
                width:10%;
                color:${textColor};
                background:${bgColor};
                border:0px solid ${borderColor};
            "
            href="!headerlinks --show ${handoutID} --level ${currentLevel} --section=${sec}">
                ${sec.toUpperCase()}
            </a>
        `;
    });

row += `\u00A0\u00A0`;

    /* H1–H4 buttons (8% each) */
    for(let i=1; i<=4; i++) {

        const isActive = (i <= currentLevel);

        const bgColor = isActive ? levelColors[i] : "#ccc";
        const borderColor = isActive ? "transparent" : "transparent";

        row += `
            <a style="${css.headerFilterButton}
                width:5%;
                background:${bgColor};
                border:0px solid ${borderColor};
            "
            href="!headerlinks --show ${handoutID} --level ${i} --section=${currentSection}">
                H${i}
            </a>
        `;
    }

    row += `</div>`;

    return row;
};

/* =========================================================
HANDOUT BUTTON LIST
========================================================= */
const buildHandoutList = () => {
    const css = getCSS();
    let handouts = findObjs({_type:"handout"});
    handouts = handouts
        .filter(h => h.get("name") !== "!HeaderLinks")
        .sort((a,b)=>a.get("name").localeCompare(b.get("name")));

    let html = "";
    handouts.forEach(h => {
        html += `<a style="${css.handoutButton}" href="!headerlinks --show ${h.id} --level 4 --section=gmnotes">
            ${h.get("name")}
        </a>`;
    });
    return html;
};

/* =========================================================
PAGE RENDERER
========================================================= */
const renderIndexPage = (selectedHeadersHTML={}) => {
    const css = getCSS();
    const left = buildHandoutList();
    return `
    <div style="${css.handoutButton}font-size:14px;">Select a handout to display its header links. Once the filter bar appears, you can click the handout name there to select a different handout from a dropdown list.<br>To copy a link, RIGHT CLICK THE LINK AND COPY ITS URL. Do NOT copy and paste the formatted link text. Use the top-row buttons to limit the max header level.</div>
    <table style="${css.tableLayout}">
    <tr>
        <td style="${css.leftPanel}">
            <div style="${css.scrollPanel}">${left}</div>
        </td>
<td style="${css.rightPanel}">
    <div style="${css.headerContainer}">
        ${selectedHeadersHTML.headerRow || ""}
    </div>
    <div style="${css.headerScroll}">
        ${selectedHeadersHTML.headerList || "Select a handout to list its headers."}
    </div>
</td>
    </tr>
    </table>
    `;
};

/* =========================================================
REBUILD INDEX HANDOUT
========================================================= */
const rebuildIndexHandout = () => {
    const indexHandout = getOrCreateIndexHandout();
    const page = renderIndexPage();
    indexHandout.set("notes", page);
};

/* =========================================================
SHOW HEADERS (WITH SECTION)
========================================================= */
const showHeaders = (handoutID, level=4, section="gmnotes") => {
    const indexHandout = getOrCreateIndexHandout();
    const filterRow = renderHeaderFilterRow(handoutID, level, section);
    const headers = ((state.ListHeaderLinks.headers[handoutID] || {})[section]) || [];
    const filtered = headers.filter(h => h.level <= level);
    const headersHTML = filtered.length
        ? renderHeaderListForSection(filtered)
        : "No headers found.";
    const page = renderIndexPage({
        headerRow: filterRow,
        headerList: headersHTML
    });

    indexHandout.set("notes", page);
};

/* =========================================================
CACHE BUILD (notes & gmnotes)
========================================================= */
const buildInitialCache = () => {
    const handouts = findObjs({_type:"handout"});
    handouts.forEach(h => {
        h.get("notes", notes => {
            h.get("gmnotes", gmnotes => {
                state.ListHeaderLinks.headers[h.id] = {
                    notes: parseHeaders(notes || "", h.id),
                    gmnotes: parseHeaders(gmnotes || "", h.id)
                };
            });
        });
    });
};

/* =========================================================
HANDOUT CHANGE HANDLER
========================================================= */
const handleHandoutChange = (handout) => {
    if(handout.get("name") === "!HeaderLinks") return;
    handout.get("notes", notes => {
        handout.get("gmnotes", gmnotes => {
            state.ListHeaderLinks.headers[handout.id] = {
                notes: parseHeaders(notes || "", handout.id),
                gmnotes: parseHeaders(gmnotes || "", handout.id)
            };
            rebuildIndexHandout();
        });
    });
};

/* =========================================================
INITIAL COMMAND
========================================================= */
const initializeIndex = () => {
    const indexHandout = getOrCreateIndexHandout();
    rebuildIndexHandout();
    const link = `http://journal.roll20.net/handout/${indexHandout.id}`;
    sendStyledMessage("Header Link Index", `[Open Header Index](${link})`);
};

/* =========================================================
CHAT HANDLER
========================================================= */
on("chat:message", msg => {
    if(msg.type !== "api") return;
    if(msg.content.startsWith("!headerlinks")) {
        const args = msg.content.split(/\s+/);
        if(args.length === 1) { initializeIndex(); return; }
        if(args[1] === "--show") {
            let level = 4;
            let section = "gmnotes";
            const levelIndex = args.indexOf("--level");
            if(levelIndex !== -1) level = parseInt(args[levelIndex+1]) || 4;
            const sectionIndex = args.findIndex(a => a.startsWith("--section"));
            if(sectionIndex !== -1) section = args[sectionIndex].split("=")[1] || "gmnotes";
            showHeaders(args[2], level, section);
        }
    }
});

/* =========================================================
EVENT REGISTRATION
========================================================= */
on("change:handout:notes", handleHandoutChange);
on("change:handout:gmnotes", handleHandoutChange);
on("add:handout", rebuildIndexHandout);
on("destroy:handout", rebuildIndexHandout);
on("change:handout:name", rebuildIndexHandout);

/* =========================================================
INITIALIZATION
========================================================= */
buildInitialCache();

});
{ try { throw new Error(''); } catch (e) { API_Meta.ListHeaderLinks.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ListHeaderLinks.offset); } }
