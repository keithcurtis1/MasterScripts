/**
 * TAM2024 - Token Action Manager for D&D 5e (Beacon)
 * Author: Keith Curtis with GPT5
 * Date: 2025-09-02
 */

const TAM2024 = (() => {
    "use strict";

    // =======================
    // Category & Macro Metadata
    // =======================
const categoryMeta = {
    attacks: {
        pc:  { section: "attacks",       macroPrefix: "repeating_attack",  macroType: "attack", label: "Attack" },
        npc: null
    },
    trait: {
        pc:  { section: "features",         macroPrefix: "repeating_trait",   macroType: "output", label: "Feature" },
        npc: null
    },
//    proficiency: {
//        pc:  { section: "proficiencies", macroPrefix: "repeating_proficiencies", macroType: "output", label: "Proficiency" },
//        npc: null
//    },
    action: {
        pc:  null,
        npc: { section: "npcactions",    macroPrefix: "repeating_npcaction",   macroType: "action", label: "NPCAction" }
    },
    bonus: {
        pc:  null,
        npc: { section: "npcbonusactions", macroPrefix: "repeating_npcbonusaction", macroType: "action", label: "NPCBonus" }
    },
    reaction: {
        pc:  null,
        npc: { section: "npcreactions",  macroPrefix: "repeating_npcreaction", macroType: "action", label: "NPCReaction" }
    },
    legendary: {
        pc:  null,
        npc: { section: "npcactions-l",  macroPrefix: "repeating_npcaction-l", macroType: "action", label: "NPCLegendary" }
    },
    mythic: {
        pc:  null,
        npc: { section: "npcactions-m",  macroPrefix: "repeating_npcaction-m", macroType: "action", label: "NPCMythic" }
    }
};


    // =======================
    // Keyword Aliases
    // =======================
    const keywordAliases = {
        attack: "attacks",
        attacks: "attacks",
        feature: "feature",
        features: "feature",
        trait: "feature",
        traits: "trait",
        proficiency: "proficiency",
        proficiencies: "proficiency",
        action: "action",
        actions: "action",
        bonus: "bonus",
        bonusactions: "bonus",
        reaction: "reaction",
        reactions: "reaction",
        legendary: "legendary",
        mythic: "mythic",
        save: "saves",
        saves: "saves",
        check: "checks",
        checks: "checks",
        init: "init",
        initiative: "init",
        spell: "spells",
        spells: "spells"
    };






    // =======================
    // Utility
    // =======================
    function ensureExperimentalMode(msg) {
        const isExperimental = (typeof $20 !== "undefined");
        if (!isExperimental) {
            sendMsg(msg, "Sandbox Requirement", "This script requires the EXPERIMENTAL sandbox. Please visit your mods page to switch sandboxes.");
            log("TAM2024: Not running — requires EXPERIMENTAL sandbox.");
            return false;
        }
        return true;
    }
    
    /**
     * sendMsg - Sends a Roll20 default template message to the player who triggered the command
     * @param {object} msg - The chat:message object from the event handler
     * @param {string} title - The title to appear in the template name
     * @param {string} message - The body of the message
     */
    function sendMsg(msg, title, message) {
        if (!msg || !msg.playerid) {
            log(`sendMsg: Missing msg or playerid. Title: ${title}, Message: ${message}`);
            return;
        }

        const playerId = msg.playerid;
        const playerObj = getObj("player", playerId);
        const playerName = playerObj ? `"${playerObj.get("displayname")}"` : `"GM"`;

        const chatString = `&{template:default} {{name=${title}}} {{=${message}}}`;
        sendChat("TAM2024", `/w ${playerName} ${chatString}`);
    }

const TAM_HELP = `Creates token action macros for the selected token’s character sheet. Works only with the official D&D 5e (2024) Roll20 sheet.<br>
<b>USAGE:</b>&#10;
<code>!tam</code> — Create all standard token actions.&#10;
<code>!tam name</code> — Same as above, but uses the character name instead of the character id in each macro (useful when moving a character to a new game).&#10;
<code>!tam [categories]</code> — Create token actions only for the specified categories.&#10;
<code>!tam [categories] name</code> — Same as above, but using the character name instead of the character id in each macro.&#10;
<code>!tamdelete/</code> — Deletes all unprotected token actions. Protect macros by putting a period after the name.&#10;
<code>!tamdeleteall</code> — Deletes ALL macros, regardless of if they are protected.&#10;
<code>!tam help</code> — Show this help message.<br>
<b>CATEGORIES:</b>&#10;
if a category does not apply to the tye of character, it will be skipped. Example: NPCs have Actions, not Attacks. Singular or plural for each keyword are acepted.&#10;
<b>attacks</b>: PC attacks.&#10;
<b>actions</b>: NPC actions.&#10;
<b>spells</b>: Spellcasting chat menu.&#10;
<b>bonus</b>: NPC Bonus actions.&#10;
<b>reactions</b>: NPC Reactions.&#10;
<b>legendary</b>: NPC legendary actions.&#10;
<b>mythic</b>: NPC Mythic actions.&#10;
<b>checks</b>: Ability and skill checks.&#10;
<b>saves</b>: Saving throws.&#10;
<b>init</b>: Initiative roll.<br>
<b>EXAMPLES:</b>&#10;
<code>!tam</code> — Full set of NPC or PC macros.&#10;
<code>!tam attacks spells</code> — Only attacks(PC) and spells.&#10;
<code>!tam checks name</code> — All ability and skill checks using the character name in the macro code.<br>
<b>NOTES:</b>&#10;
Run the command with the token(s) selected.&#10;
Macros are created as token actions, visible only when that token is selected.`;


    
    

    // =======================
    // Parse !ta Command Input
    // =======================
function parseTamCommand(msgContent) {
    const parts = msgContent.trim().split(/\s+/).slice(1);

    const categories = new Set();
    let useNames = false;

    if (parts.length === 0) {
        // default: everything
        return { 
            categories: [...Object.keys(categoryMeta), "saves", "checks", "init", "spells"],
            useNames
        };
    }

    parts.forEach(word => {
        const lc = word.toLowerCase();
        if (lc === "name" || lc === "names") {
            useNames = true;
            return;
        }
        const cat = keywordAliases[lc];
        if (cat) categories.add(cat);
    });

    // ✅ if only "name" was given (no categories), default to everything
    if (categories.size === 0) {
        return { 
            categories: [...Object.keys(categoryMeta), "saves", "checks", "init", "spells"],
            useNames
        };
    }

    return { categories: Array.from(categories), useNames };
}


    // =======================
    // get Spell IDs
    // =======================
    async function getSpells(characterId) {
        const result = {};

        // Cantrips
        const cantripIds = await getComputed(characterId, "reporder_spell-cantrip") || [];
        if (cantripIds.length) {
            result[0] = cantripIds;
        }

        // Levels 1–9
        for (let lvl = 1; lvl <= 9; lvl++) {
            const ids = await getComputed(characterId, `reporder_spell-${lvl}`) || [];
            if (ids.length) {
                result[lvl] = ids;
            }
        }

        return result; // object keyed by level → array of ids
    }


    // =======================
    // Builds the spell macro
    // =======================
    function buildSpellsMacro(spells, characterName, characterId, useNames) {
        const sections = [];
        // idRef used for attribute references and "~" prefix targets; if useNames is true we'll use the character name instead of id
        const idRef = useNames ? characterName : characterId;

        for (const [lvl, ids] of Object.entries(spells)) {
            let header;

            if (lvl === "0") {
                header = "**Cantrips**";
            } else {
                // total and expended - we want to show current/max (remaining then total)
                // note: we wrap totals in [[...]] where appropriate. We also avoid Roll20 trying to render as roll by adding unmatched bracket trick later
                const total = `[[@{${idRef}|lvl${lvl}_slots_total}]]`;
                const expended = `@{${idRef}|lvl${lvl}_slots_expended}`;
                const remaining = `[[${total} - ${expended}]]`;
                header = `**Level ${lvl}** - ${remaining} / ${total}`;
            }

            const buttons = ids.map((id, idx) => {
                const label = (lvl === "0")
                    ? `Cantrip-${String(idx + 1).padStart(2, "0")}`
                    : `Spell-${lvl}-${String(idx + 1).padStart(2, "0")}`;
                const prefix = (lvl === "0") ? "repeating_spell-cantrip" : `repeating_spell-${lvl}`;
                // use character id/name reference for "~" and attribute references
                return `[ⓘ](~${idRef}|${prefix}_${id}_output) [${label}](~${idRef}|${prefix}_${id}_spell)`;
            }).join("\n");

            sections.push(`${header}\n${buttons}`);
        }

        const title = `${characterName} Spells`;
        // Add unmatched square brackets right after name to prevent automatic roll formatting in headers
        const template = `&{template:default} {{name=${title}}}[[]{{=${sections.join("\n\n")}}}`;

        // Whisper to the selected character name (so the user sees the output in whisper). The template itself uses character references inside.
        return `/w "@{selected|character_name}" ${template}`;
    }





    // =======================
    // processToken (fixed NPC/PC detection + passes meta through)
    // =======================
    async function processToken(token, categories = [], useNames = false) {
        const tokenObj = getObj("graphic", token._id);
        if (!tokenObj) {
            log(`TAM2024: Could not get token object for ID ${token._id}`);
            return;
        }

        const characterId = tokenObj.get("represents");
        if (!characterId) {
            log(`TAM2024: Token "${tokenObj.get("name")}" does not represent a character.`);
            return;
        }

        const charObj = getObj("character", characterId);
        const characterName = charObj ? charObj.get("name") : "Character";

        log(`TAM2024: Processing token "${tokenObj.get("name")}" representing character ${characterId}`);

        // --- Determine if this is an NPC or PC (async) ---
        let npcAttrRaw = "";
        try {
            npcAttrRaw = await getSheetItem(characterId, "npc");
        } catch (err) {
            log(`TAM2024: ERROR fetching "npc" attribute for character ${characterId}: ${err}`);
        }

        const normalized = String(npcAttrRaw ?? "").toLowerCase().trim();
        // treat "on", "1", "true" as PC; everything else -> NPC
        const isPc = (normalized === "on" || normalized === "1" || normalized === "true");
        const isNpc = !isPc;
        const type = isNpc ? "npc" : "pc";

        log(`TAM2024: npc attribute raw="${npcAttrRaw}", normalized="${normalized}" => ${isNpc ? "NPC" : "PC"}`);

        // ensure categories is an array (defensive)
        categories = Array.isArray(categories) ? categories : Array.from(categories || []);

        const catPromises = categories.map(async (category) => {
            // === Special-case: Checks, Saves, Initiative ===
            if (category === "checks" || category === "saves" || category === "init") {
                await createBasicAbilities(characterId, category);
                return;
            }

            // === Spells handling ===
            if (category === "spells") {
                try {
                    const spells = await getSpells(characterId);
                    if (Object.keys(spells).length === 0) {
                        log(`TAM2024: No spells found for character ${characterId}`);
                        return;
                    }

                    const macro = buildSpellsMacro(spells, characterName, characterId, useNames);
                    log(`TAM2024: Creating Spells token action with macro:\n${macro}`);
                    await createTokenAction(characterId, "Spells", macro);
                    log(`TAM2024: Spells token action created for character ${characterId}`);
                } catch (err) {
                    log(`TAM2024: ERROR building Spells for ${characterId}: ${err}`);
                }
                return;
            }

            // === Normal category flow ===
            const meta = categoryMeta[category] ? categoryMeta[category][type] : null;
            if (!meta) {
                log(`TAM2024: Skipping category "${category}" for ${isNpc ? "NPC" : "PC"}`);
                return;
            }

            log(`TAM2024: Fetching items for category "${category}" (using section "${meta.section}")`);
            let items;
            try {
                items = await getItemsForCategory(characterId, category, meta);
            } catch (err) {
                log(`TAM2024: ERROR fetching items for category "${category}": ${err}`);
                return;
            }

            log(`TAM2024: Found ${items.length} valid items for category "${category}"`);

            for (let item of items) {
                if (!item || !item.id) {
                    log(`TAM2024: Skipping invalid item in category "${category}": ${JSON.stringify(item)}`);
                    continue;
                }

                const macro = generateMacro(characterId, characterName, category, item, meta, useNames);
                if (!macro) {
                    log(`TAM2024: Failed to generate macro for item ID "${item.id}" in category "${category}"`);
                    continue;
                }

                log(`TAM2024: Creating token action "${macro.name}" with macro: ${macro.macro}`);
                try {
                    await createTokenAction(characterId, macro.name, macro.macro);
                } catch (err) {
                    log(`TAM2024: ERROR creating token action "${macro.name}" for category "${category}": ${err}`);
                }
            }
        });

        await Promise.all(catPromises);
    }

    // =======================
    // createBasicAbilities
    // =======================
    async function createBasicAbilities(characterId, which) {
        const abilityAttrs = [
            "strength_bonus","dexterity_bonus","constitution_bonus",
            "intelligence_bonus","wisdom_bonus","charisma_bonus"
        ];
        const skillAttrs = [
            "acrobatics_bonus","animal_handling_bonus","arcana_bonus","athletics_bonus",
            "deception_bonus","history_bonus","insight_bonus","intimidation_bonus",
            "investigation_bonus","medicine_bonus","nature_bonus","perception_bonus",
            "performance_bonus","persuasion_bonus","religion_bonus",
            "sleight_of_hand_bonus","stealth_bonus","survival_bonus"
        ];

        const bonuses = {};
        for await (const [attr, val] of [...abilityAttrs, ...skillAttrs]
            .map(async x => [x, await getSheetItem(characterId, x).catch(_ => 0)])) {
            try {
                bonuses[attr] = parseInt(val) || 0;
            } catch {
                bonuses[attr] = 0;
            }
        }


        if (which === "init") {
            createTokenAction(characterId, "Init", "%{selected|initiative}");
            return;
        }

        function formatOption(label, attr, bonus) {
            const sign = bonus >= 0 ? "+" : "";
            return `| ${label} ${sign}${bonus}, %{selected&#124;${attr}&#125;`;
        }

        if (which === "saves") {
            const saveOptionsRaw = [
                ["Strength", "npc_strength_save", bonuses.strength_bonus],
                ["Dexterity", "npc_dexterity_save", bonuses.dexterity_bonus],
                ["Constitution", "npc_constitution_save", bonuses.constitution_bonus],
                ["Intelligence", "npc_intelligence_save", bonuses.intelligence_bonus],
                ["Wisdom", "npc_wisdom_save", bonuses.wisdom_bonus],
                ["Charisma", "npc_charisma_save", bonuses.charisma_bonus]
            ];

            const saveOptions = saveOptionsRaw.map(([label, attr, bonus]) => formatOption(label, attr, bonus));
            if (saveOptions.length) {
                saveOptions[saveOptions.length - 1] = saveOptions[saveOptions.length - 1].replace(/&#125;$/, "&#125;}");
            }
            const saveAction = `?{Saving Throw?\n${saveOptions.join("\n")}`;
            createTokenAction(characterId, "Save", saveAction);
            return;
        }

        if (which === "checks") {
            const checkOptions = [];

            for (let [label, attr] of [["Strength","strength"],["Dexterity","dexterity"],["Constitution","constitution"],["Intelligence","intelligence"],["Wisdom","wisdom"],["Charisma","charisma"]]) {
                checkOptions.push(formatOption(label, attr, bonuses[`${attr}_bonus`] || 0));
            }

            for (let skill of skillAttrs) {
                const bonus = bonuses[skill] || 0;
                const cleanName = skill.replace("_bonus","").replace(/_/g," ");
                const baseName = skill.replace("_bonus","");
                const labelName = cleanName.replace(/\b\w/g, c => c.toUpperCase());
                checkOptions.push(formatOption(labelName, baseName, bonus));
            }

            if (checkOptions.length) {
                checkOptions[checkOptions.length - 1] = checkOptions[checkOptions.length - 1].replace(/&#125;$/, "&#125;}");
            }
            const checkAction = `?{Check?\n${checkOptions.join("\n")}`;
            createTokenAction(characterId, "Check", checkAction);
            return;
        }
    }

    // =======================
    // getItemsForCategory (expects meta passed in from processToken)
    // =======================
    async function getItemsForCategory(characterId, category, meta) {
        if (!meta) return [];
        const ids = await getComputed(characterId, `reporder_${meta.section}`);
        if (!ids || !ids.length) return [];
        const labelBase = meta.label || category.charAt(0).toUpperCase() + category.slice(1);
        return ids
            .filter(id => !!id)
            .map((id, index) => {
                const paddedIndex = String(index + 1).padStart(2, "0");
                return { id, name: `${labelBase}-${paddedIndex}` };
            });
    }



    // =======================
    // generateMacro (accepts optional meta)
    // =======================
    function generateMacro(characterId, characterName, category, item, meta, useNames) {
        try {
            const idRef = useNames ? characterName : characterId;
            const macroString = `%{${idRef}|${meta.macroPrefix}:${item.id}:${meta.macroType}}`;
            return { name: item.name, macro: macroString };
        } catch (e) {
            log(`TAM2024: ERROR generating macro for category ${category}: ${e}`);
            return null;
        }
    }

    // =======================
    // createTokenAction
    // =======================
    async function createTokenAction(characterId, actionName, macroString) {
        if (!macroString) return;

        const existing = findObjs({
            _type: "ability",
            characterid: characterId,
            name: actionName
        })[0];

        const setTokenAction = (obj) => new Promise(resolve => {
            setTimeout(() => {
                obj.set({ istokenaction: true });
                resolve();
            }, 50);
        });

        if (existing) {
            existing.set({ action: macroString });
            await setTokenAction(existing);
        } else {
            const ability = createObj("ability", {
                characterid: characterId,
                name: actionName,
                action: macroString
            });
            await setTokenAction(ability);
        }
    }

    // =======================
    // processSelectedTokens
    // =======================
async function processSelectedTokens(selectedTokens, categories = [], useNames = false) {
    if (!selectedTokens || selectedTokens.length === 0) return;

    // ✅ defensive: ensure categories is always a proper array
    if (!Array.isArray(categories)) {
        if (categories && typeof categories[Symbol.iterator] === "function") {
            categories = Array.from(categories); // handle Set or iterable
        } else {
            categories = []; // fallback safe default
        }
    }

    for (let token of selectedTokens) {
        try {
            await processToken(token, categories, useNames);
        } catch (err) {
            log(`TAM2024: ERROR processing token: ${err}`);
        }
    }
}

    
    
    // =======================
    // Delete Token Actions
    // =======================
    async function deleteTokenActions(selectedTokens, protectPeriodEnding = true) {
        if (!selectedTokens || selectedTokens.length === 0) return;

        const tokenPromises = selectedTokens.map(async token => {
            const tokenObj = getObj("graphic", token._id);
            if (!tokenObj) return;

            const characterId = tokenObj.get("represents");
            if (!characterId) return;

            const abilities = findObjs({ _type: "ability", characterid: characterId });

            const abilityPromises = abilities.map(async ab => {
                const name = ab.get("name");
                if (protectPeriodEnding && name.endsWith(".")) return;

                try {
                    await ab.remove();
                    log(`TAM2024: Deleted token action "${name}" for character ${characterId}`);
                } catch (e) {
                    log(`TAM2024: Failed to delete token action "${name}" for character ${characterId}: ${e}`);
                }
            });

            await Promise.all(abilityPromises);
        });

        await Promise.all(tokenPromises);
    }



    // =======================
    // Chat Command Handler
    // =======================
    on("chat:message", async function(msg) {
        if (msg.type !== "api") return;
        if (!msg.content.startsWith("!tam")) return;
        if (!ensureExperimentalMode(msg)) return;
            if (msg.content === "!tam help") {
        sendMsg(msg, "Token Action Maker 24 Help", TAM_HELP);
//        sendChat("TAM2024", `/w "${msg.who}" ${TAM_HELP}`);
        return;
    }

        const cmd = msg.content.trim();

        // ---- Validate token selection ----
        if (!msg.selected || msg.selected.length === 0) {
            sendMsg(msg, "Error", "No tokens selected!");
            return;
        }

        // ---- Delete token actions on selected tokens, protected by period ----
        if (cmd === "!tamdelete") {
            await deleteTokenActions(msg.selected, true);
            sendMsg(msg, "Token Action Manager", `Token actions deleted (except protected macros whose name ends in a period) for ${msg.selected.length} token(s).`);
            return;
        }

        // ---- Ask for confirmation before deleting all token actions ----
        if (cmd === "!tamdeleteall") {
            const buttonMessage = `Are you sure you wish to delete ALL token actions on the selected characters? This cannot be undone.<BR>[Delete ALL](!tamdeleteallconfirmed) | [Cancel](!tamcancel)`;
            sendMsg(msg, "Confirmation Required", buttonMessage);
            return;
        }

        // ---- Delete all token actions after user confirms ----
        if (cmd === "!tamdeleteallconfirmed") {
            await deleteTokenActions(msg.selected, false);
            sendMsg(msg, "All Token Actions Deleted", `All token actions deleted for ${msg.selected.length} token(s).`);
            return;
        }

        // ---- Cancel deletion ----
        if (cmd === "!tamcancel") {
            sendMsg(msg, "Deletion Canceled", "No token actions were deleted.");
            return;
        }

        // ---- Standard !tam command to create token actions ----
        const parsed = parseTamCommand(msg.content);
        // ensure defaults
let categories = parsed.categories;
if (!Array.isArray(categories)) {
    categories = categories ? [categories] : [];
}
        const useNames = !!parsed.useNames;

        // ---- Inform the user if multiple tokens or full suite of actions are requested ----
        const selectedCount = msg.selected.length;
        const categoryCount = categories.length;

        let infoMessage = "";
        if (selectedCount > 1) {
            infoMessage += `This may take a few seconds to generate actions on ${selectedCount} tokens.`;
        }

        if (categoryCount > 1 || categories.includes("checks") || categories.includes("saves") || categories.includes("init")) {
            if (infoMessage) infoMessage += " ";
            infoMessage += "This may take a few seconds to generate a full set of actions.";
        }

        if (infoMessage) {
            sendMsg(msg, "Processing Token Actions", infoMessage);
        }

        await processSelectedTokens(msg.selected, categories, useNames);
        sendMsg(msg, "Token Actions Created", `Finished creating token actions for ${msg.selected.length} token(s).`);
    });

    return { parseTamCommand, processToken, processSelectedTokens };
})();
