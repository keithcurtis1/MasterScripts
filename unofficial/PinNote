(() => {
    'use strict';

    const SCRIPT_NAME = 'PinNote';

    /* ============================
     * Utilities
     * ============================ */

    const isGMPlayer = (playerid) => playerIsGM(playerid);

    const getTemplate = (name) => {
        if (typeof Supernotes_Templates === 'undefined') {
            return null;
        }
        if (!name) return Supernotes_Templates.generic;
        const key = name.toLowerCase();
        return Supernotes_Templates[key] || Supernotes_Templates.generic;
    };

    const sendGenericError = (msg, text) => {
        if (typeof Supernotes_Templates === 'undefined') return;

        const t = Supernotes_Templates.generic;
        sendChat(
            SCRIPT_NAME,
            t.boxcode +
            t.titlecode + SCRIPT_NAME +
            t.textcode + text +
            '</div></div>' +
            t.footer +
            '</div>'
        );
    };

    const parseArgs = (content) => {
        const args = {};
        content.replace(/--([^|]+)\|([^\s]+)/gi, (_, k, v) => {
            args[k.toLowerCase()] = v.toLowerCase();
            return '';
        });
        return args;
    };

    /* ============================
     * Main
     * ============================ */

    on('chat:message', (msg) => {
        if (msg.type !== 'api' || !msg.content.startsWith('!pinnote')) return;

        /* ---- Supernotes dependency ---- */
        if (typeof Supernotes_Templates === 'undefined') {
            sendChat(
                SCRIPT_NAME,
                `/w gm PinNote requires Supernotes_Templates to be loaded.`
            );
            return;
        }

        const args = parseArgs(msg.content);
        const isGM = isGMPlayer(msg.playerid);

        /* ---- Selection ---- */
        if (!msg.selected || msg.selected.length === 0) {
            return sendGenericError(msg, 'No pin selected.');
        }

        const sel = msg.selected.find(s => s._type === 'pin');
        if (!sel) {
            return sendGenericError(msg, 'Selected object is not a pin.');
        }

        const pin = getObj('pin', sel._id);
        if (!pin) {
            return sendGenericError(msg, 'Selected pin could not be resolved.');
        }

        /* ---- Desync check ---- */
        if (
            !pin.get('notesDesynced') &&
            !pin.get('gmNotesDesynced') &&
            !pin.get('imageDesynced')
        ) {
            return sendGenericError(
                msg,
                'This pin is not desynced from its linked handout.'
            );
        }

        const notes = (pin.get('notes') || '').trim();
        if (!notes) {
            return sendGenericError(msg, 'This pin has no notes to display.');
        }

        /* ---- Target resolution ---- */
        let to = (args.to || 'pc').toLowerCase();
        if (!isGM) {
            to = 'pc';
        }

        let whisperPrefix = '';
        if (to === 'gm') {
            whisperPrefix = '/w gm ';
        } else if (to === 'self') {
            whisperPrefix = `/w "${msg.who}" `;
        }

        /* ---- Template ---- */
        const template = getTemplate(args.template);
        if (!template) return;

        /* ---- Sender ---- */
        const sender = pin.get('title') || SCRIPT_NAME;

        /* ---- Image ---- */
        let imageBlock = '';
        const tooltipImage = pin.get('tooltipImage');
        if (tooltipImage) {
            imageBlock =
                `<img src="${tooltipImage}" ` +
                `style="max-width:100%; max-height:400px; display:block; margin-bottom:8px;">`;
        }

        /* ---- GM Notes (FIXED LOGIC) ---- */
        let gmBlock = '';
        if (isGM && to !== 'pc' && pin.get('gmNotes')) {
            gmBlock =
                `<div style=${template.whisperStyle}>` +
                pin.get('gmNotes') +
                `</div>`;
        }

        /* ---- Final message ---- */
        const html =
            template.boxcode +
            template.titlecode + sender +
            template.textcode +
            imageBlock +
            notes +
            gmBlock +
            '</div></div>' +
            template.footer +
            '</div>';

        sendChat(sender, whisperPrefix + html);
    });

})();
