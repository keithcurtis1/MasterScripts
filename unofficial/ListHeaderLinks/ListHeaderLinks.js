// ==================================================
// Script:   ListHeaderLinks
// Author:   Keith Curtis
// Version:  1.0.0
// ==================================================

var API_Meta = API_Meta || {};
API_Meta.ListHeaderLinks = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ListHeaderLinks.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

on("ready", () =>
{
    "use strict";

    const scriptName = "ListHeaderLinks";
    const version = "1.0.0";

    log(`-=> ${scriptName} v${version} is loaded.`);

    state.ListHeaderLinks = state.ListHeaderLinks ||
    {
        headers:
        {}
    };

    /* =========================================================
    CSS OBJECT
    ========================================================= */

    const getCSS = () => (
    {

        tableLayout: `
width:100%;
border-collapse:collapse;
`,

        leftPanel: `
width:40%;
vertical-align:top;
padding:6px;
background-color:#47311f;
border-right:1px solid #888;
`,

        rightPanel: `
width:60%;
vertical-align:top;
padding:6px;
`,

        handoutButton: `
display:block;
margin:3px 0;
padding:3px 6px;
background:#e2c69c;
color:#111 !important;
border:0px solid transparent;
border-radius:4px;
font-weight:bold;
text-decoration:none;
`,

        messageContainer: `
background:#bbb;
padding:12px;
border-radius:10px;
border:2px solid #888;
color:#111;
`,

        messageTitle: `
font-weight:bold;
font-size:20px;
margin-bottom:6px;
`,

        scrollPanel: `
max-height:800px;
overflow-y:auto;
padding-right:4px;
`,

        messageButton: `
display:inline-block;
padding:4px 8px;
background:#444;
color:white;
border-radius:4px;
text-decoration:none;
margin-top:6px;
`

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

    const sendStyledMessage = (titleOrMessage, messageOrUndefined, isPublic = false) =>
    {
        const css = getCSS();
        let title, message;

        if(messageOrUndefined === undefined)
        {
            title = scriptName;
            message = titleOrMessage;
        }
        else
        {
            title = titleOrMessage || scriptName;
            message = messageOrUndefined;
        }

        message = String(message).replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            (_, label, command) =>
            `<a href="${command}" style="${css.messageButton}">${label}</a>`
        );

        let html =
            `<div style="${css.messageContainer}">
<div style="${css.messageTitle}">${title}</div>
${message}
</div>`;

        html = html.replace(/[\r\n]+/g, '');

        sendChat(
            scriptName,
            `${isPublic?"":"/w gm "}${html}`,
            null,
            {
                noarchive: true
            }
        );
    };

    /* =========================================================
    HANDOUT MANAGEMENT
    ========================================================= */

    const getOrCreateIndexHandout = () =>
    {
        let handout = findObjs(
        {
            _type: "handout",
            name: "!HeaderLinks"
        })[0];
        if(!handout)
        {
            handout = createObj("handout",
            {
                name: "!HeaderLinks"
            });
        }
        return handout;
    };

    /* =========================================================
    HEADER PARSER
    ========================================================= */

    const parseHeaders = (html, handoutID) =>
    {
        const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
        let match;
        let results = [];

        while((match = regex.exec(html)) !== null)
        {
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]*>/g, "").trim();
            const encoded = text.replace(/ /g, "%20");
            const url = `http://journal.roll20.net/handout/${handoutID}/#${encoded}`;

            results.push(
            {
                level,
                text,
                url
            });
        }
        return results;
    };

    /* =========================================================
    HEADER FILTER ROW (H1–H4)
    ========================================================= */

    const renderHeaderFilterRow = (handoutID, currentLevel = 4) =>
    {

        const handout = findObjs(
        {
            _type: "handout",
            id: handoutID
        })[0];
        const handoutName = handout?.get("name") || "Unknown Handout";

        const levelColors = {
            1: "#a47148",
            2: "#c28b5a",
            3: "#d9a873",
            4: "#f0c98f"
        };

        // Table with no border/spacing/padding
        let row = `<table style="width:100%; border-collapse:collapse; border:0; border-spacing:0;" cellspacing="0" cellpadding="0"><tr>`;

        // Left: handout name, 50% width
        row += `
        <td style="width:50%; padding:0; margin:0; border:0; background:transparent;">
            <a style="${getCSS().handoutButton}; display:block; width:95%; text-align:center;" 
               href="!headerlinks --show ${handoutID} --level 4">
                ${handoutName}
            </a>
        </td>
    `;

        // Right: H1–H4 filter buttons, 12.5% each, with small margin-right for spacing
        for(let i = 1; i <= 4; i++)
        {
            const isActive = (i <= currentLevel); // cumulative
            const bgColor = isActive ? levelColors[i] : "#ccc";
            const borderColor = isActive ? "#444" : "#777";

            const style = `
            display:block;
            width:100%;
            text-align:center;
            padding:4px 0;
            background:${bgColor};
            color:black;
            border:1px solid ${borderColor};
            text-decoration:none;
            font-weight:bold;
            margin-right:3px;
        `;

            row += `
            <td style="width:11%; padding:0; margin:0; border:0; background:transparent;">
                <a style="${style}" 
                   href="!headerlinks --show ${handoutID} --level ${i}">
                   H${i}
                </a>
            </td>
        `;
        }

        row += `</tr></table>`;
        return row;
    };

    /* =========================================================
    HEADER LIST (H1–H4 ONLY)
    ========================================================= */
    const renderHeaderList = (handoutID, maxLevel = 4) =>
    {

        const headers = state.ListHeaderLinks.headers[handoutID] || [];
        const filtered = headers.filter(h => h.level <= maxLevel);
        if(filtered.length === 0)
            return "No headers found.";

        const levelColors = {
            1: "#a47148",
            2: "#c28b5a",
            3: "#d9a873",
            4: "#f0c98f"
        };

        const rightPadding = 4; // small space between prefix and link

        return filtered.map(h =>
        {

            // Indent via non-breaking spaces
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
    HANDOUT BUTTON LIST
    ========================================================= */

    const buildHandoutList = () =>
    {
        const css = getCSS();
        let handouts = findObjs(
        {
            _type: "handout"
        });
        handouts = handouts
            .filter(h => h.get("name") !== "!HeaderLinks")
            .sort((a, b) => a.get("name").localeCompare(b.get("name")));

        let html = "";
        handouts.forEach(h =>
        {
            html += `<a style="${css.handoutButton}" href="!headerlinks --show ${h.id} --level 4">
            ${h.get("name")}
        </a>`;
        });
        return html;
    };

    /* =========================================================
    PAGE RENDERER
    ========================================================= */

    const renderIndexPage = (selectedHeadersHTML = "") =>
    {
        const css = getCSS();
        const left = buildHandoutList();

        return `
    <div style="${css.handoutButton}font-size:16px;">Select a handout. A list of links will appear at right. Right-click to get the url for linking; do not copy and paste formatted link.<br>Use the filter buttons in the top row to constrain to a maximum header level.</div>
    <table style="${css.tableLayout}">
    <tr>
        <td style="${css.leftPanel}">
            <div style="${css.scrollPanel}">${left}</div>
        </td>
        <td style="${css.rightPanel}">
            ${selectedHeadersHTML || "Select a handout to list its headers."}
        </td>
    </tr>
    </table>
    `;
    };

    /* =========================================================
    REBUILD INDEX HANDOUT
    ========================================================= */

    const rebuildIndexHandout = () =>
    {
        const indexHandout = getOrCreateIndexHandout();
        const page = renderIndexPage();
        indexHandout.set("notes", page);
    };

    /* =========================================================
    SHOW HEADERS
    ========================================================= */

    const showHeaders = (handoutID, level = 4) =>
    {
        const indexHandout = getOrCreateIndexHandout();
        const filterRow = renderHeaderFilterRow(handoutID, level);
        const headersHTML = renderHeaderList(handoutID, level);
        const page = renderIndexPage(filterRow + headersHTML);
        indexHandout.set("notes", page);
    };

    /* =========================================================
    CACHE BUILD
    ========================================================= */

    const buildInitialCache = () =>
    {
        const handouts = findObjs(
        {
            _type: "handout"
        });
        handouts.forEach(h =>
        {
            h.get("notes", notes =>
            {
                state.ListHeaderLinks.headers[h.id] = parseHeaders(notes, h.id);
            });
        });
    };

    /* =========================================================
    HANDOUT CHANGE HANDLER
    ========================================================= */

    const handleHandoutChange = (handout) =>
    {
        if(handout.get("name") === "!HeaderLinks") return;
        handout.get("notes", notes =>
        {
            state.ListHeaderLinks.headers[handout.id] = parseHeaders(notes, handout.id);
            rebuildIndexHandout();
        });
    };

    /* =========================================================
    INITIAL COMMAND
    ========================================================= */

    const initializeIndex = () =>
    {
        const indexHandout = getOrCreateIndexHandout();
        rebuildIndexHandout();
        const link = `http://journal.roll20.net/handout/${indexHandout.id}`;
        sendStyledMessage("Header Link Index", `[Open Header Index](${link})`);
    };

    /* =========================================================
    CHAT HANDLER
    ========================================================= */

    on("chat:message", msg =>
    {
        if(msg.type !== "api") return;
        if(msg.content.startsWith("!headerlinks"))
        {
            const args = msg.content.split(/\s+/);
            if(args.length === 1)
            {
                initializeIndex();
                return;
            }
            if(args[1] === "--show")
            {
                let level = 4;
                const levelIndex = args.indexOf("--level");
                if(levelIndex !== -1) level = parseInt(args[levelIndex + 1]) || 4;
                showHeaders(args[2], level);
                return;
            }
        }
    });

    /* =========================================================
    EVENT REGISTRATION
    ========================================================= */

    on("change:handout:notes", handleHandoutChange);
    on("add:handout", rebuildIndexHandout);
    on("destroy:handout", rebuildIndexHandout);
    on("change:handout:name", rebuildIndexHandout);

    /* =========================================================
    INITIALIZATION
    ========================================================= */

    buildInitialCache();

});
{ try { throw new Error(''); } catch (e) { API_Meta.ListHeaderLinks.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ListHeaderLinks.offset); } }