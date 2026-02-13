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
     * Helper: Extract Section
     * ============================ */

    const extractHandoutSection = ({ handout, subLink, subLinkType }) => {
        return new Promise((resolve) => {

            if (!handout) return resolve(null);

            if (!subLink) {
                // Entire handout
                const field = subLinkType === 'headerGM' ? 'gmnotes' : 'notes';
                handout.get(field, (content) => resolve(content || null));
                return;
            }

            if (!['headerplayer', 'headergm'].includes(subLinkType?.toLowerCase())) {
                return resolve(null);
            }

            const field = subLinkType.toLowerCase() === 'headergm'
                ? 'gmnotes'
                : 'notes';

            handout.get(field, (content) => {
                if (!content) return resolve(null);

                const headerRegex = /<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/gi;
                let match;

                while ((match = headerRegex.exec(content)) !== null) {
                    const fullHeader = match[0];
                    const tagName = match[1]; // h1-h4
                    const innerHTML = match[2];

                    const stripped = innerHTML.replace(/<[^>]+>/g, '');

                    if (stripped === subLink) {
                        const level = parseInt(tagName[1], 10);
                        const startIndex = match.index;

                        const remainder = content.slice(headerRegex.lastIndex);

                        const stopRegex = new RegExp(
                            `<h([1-${level}])\\b[^>]*>`,
                            'i'
                        );

                        const stopMatch = stopRegex.exec(remainder);

                        const endIndex = stopMatch
                            ? headerRegex.lastIndex + stopMatch.index
                            : content.length;

                        const extracted = content.slice(startIndex, endIndex);
                        //log("html =" + extracted);
                        return resolve(extracted);
                    }
                }

                resolve(null);
            });
        });
    };

    /* ============================
     * Main
     * ============================ */

    on('chat:message', async (msg) => {
        if (msg.type !== 'api' || !msg.content.startsWith('!pinnote')) return;

        if (typeof Supernotes_Templates === 'undefined') {
            sendChat(
                SCRIPT_NAME,
                `/w gm PinNote requires Supernotes_Templates to be loaded.`
            );
            return;
        }

        const args = parseArgs(msg.content);
        const isGM = isGMPlayer(msg.playerid);

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

        const isSynced =
            !pin.get('notesDesynced') &&
            !pin.get('gmNotesDesynced') &&
            !pin.get('imageDesynced');

        const linkType = pin.get('linkType');

        /* ============================================================
         * LINKED HANDOUT MODE (ONLY IF SYNCED)
         * ============================================================ */

        if (isSynced && linkType === 'handout') {

            const handoutId = pin.get('link');
            const subLink = pin.get('subLink');
            const subLinkType = pin.get('subLinkType');

            const handout = getObj('handout', handoutId);
            if (!handout) {
                return sendGenericError(msg, 'Linked handout not found.');
            }

            const extracted = await extractHandoutSection({
                handout,
                subLink,
                subLinkType
            });

            if (!extracted) {
                return sendGenericError(msg, 'Requested section not found in handout.');
            }

            const template = getTemplate(args.template);
            if (!template) return;

            const sender = pin.get('title') || SCRIPT_NAME;

            let to = (args.to || 'pc').toLowerCase();
            if (!isGM) to = 'pc';

            let whisperPrefix = '';

            const extractingGM = subLinkType?.toLowerCase() === 'headergm';

            if (extractingGM) {
                whisperPrefix = '/w gm ';
            } else {
                if (to === 'gm') {
                    whisperPrefix = '/w gm ';
                } else if (to === 'self') {
                    whisperPrefix = `/w "${msg.who}" `;
                }
            }

            const html =
                template.boxcode +
                template.titlecode + sender +
                template.textcode +
                extracted +
                '</div></div>' +
                template.footer +
                '</div>';

            sendChat(sender, whisperPrefix + html);
            return;
        }

        /* ============================================================
         * EXISTING CUSTOM PIN BEHAVIOR
         * ============================================================ */

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

        const template = getTemplate(args.template);
        if (!template) return;

        const sender = pin.get('title') || SCRIPT_NAME;

        let imageBlock = '';
        const tooltipImage = pin.get('tooltipImage');
        if (tooltipImage) {
            imageBlock =
                `<img src="${tooltipImage}" ` +
                `style="max-width:100%; max-height:400px; display:block; margin-bottom:8px;">`;
        }

        let gmBlock = '';
        if (isGM && to !== 'pc' && pin.get('gmNotes')) {
            gmBlock =
                `<div style=${template.whisperStyle}>` +
                pin.get('gmNotes') +
                `</div>`;
        }

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
