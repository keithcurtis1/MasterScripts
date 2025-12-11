var API_Meta = API_Meta || {};
API_Meta.tab24 = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
};
{
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.tab24.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}
/**
 * tokenActionBuilder - Token Action Builder for D&D  2024 by Roll20 sheet (Beacon)
 * Author: Keith Curtis
 * Date: 2025-09-06
 * Changelog:
 * 1.0.0 Debut script
 */
on('ready', () => {
    const version = '1.0.0';
    log(`-=> Token Action Builder v${version} loaded. Use !tab for D&D 2024 Beacon Sheet token actions. Type !tab help for instructions.`);
});

 
 
 

const tokenActionBuilder = (() => {
    "use strict";

    // =======================
    // Category & Macro Metadata
    // =======================
    const categoryMeta = {
        attacks: {
            pc: {
                section: "attacks",
                macroPrefix: "repeating_attack",
                macroType: "attack",
                label: "Attack",
                namePrefix: ""
            },
            npc: null
        },
        trait: {
            //pc:  null,
            pc: {
                section: "features",
                macroPrefix: "repeating_trait",
                macroType: "output",
                label: "Feature",
                namePrefix: ""
            },
            npc: {
                section: "features",
                macroPrefix: "repeating_trait",
                macroType: "output",
                label: "Feature",
                namePrefix: ""
            }
        },
        action: {
            pc: null,
            npc: {
                section: "npcactions",
                macroPrefix: "repeating_npcaction",
                macroType: "action",
                label: "NPCAction",
                namePrefix: ""
            }
        },
        bonus: {
            pc: null,
            npc: {
                section: "npcbonusactions",
                macroPrefix: "repeating_npcbonusaction",
                macroType: "action",
                label: "NPCBonus",
                namePrefix: "_B."
            }
        },
        reaction: {
            pc: null,
            npc: {
                section: "npcreactions",
                macroPrefix: "repeating_npcreaction",
                macroType: "action",
                label: "NPCReaction",
                namePrefix: "_R."
            }
        },
        legendary: {
            pc: null,
            npc: {
                section: "npcactions-l",
                macroPrefix: "repeating_npcaction-l",
                macroType: "action",
                label: "NPCLegendary",
                namePrefix: "_L_"
            }
        },
        mythic: {
            pc: null,
            npc: {
                section: "npcactions-m",
                macroPrefix: "repeating_npcaction-m",
                macroType: "action",
                label: "NPCMythic",
                namePrefix: "_M_"
            }
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
        trait: "trait",
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
            log("Token Action Builder: Not running — requires EXPERIMENTAL sandbox.");
            return false;
        }
        return true;
    }


    // =======================
    // Outgoing Message Handler
    // =======================
    function sendMsg(msg, title, message) {
        if (!msg || !msg.playerid) return;
        const playerId = msg.playerid;
        const playerObj = getObj("player", playerId);
        const playerName = playerObj ? `"${playerObj.get("displayname")}"` : `"gm"`;
        const chatString = `&{template:default} {{name=${title}}} {{=${message}}}`;
        sendChat("Token Action Builder", `/w ${playerName} ${chatString}`, null, {
            noarchive: true
        });
    }


    // =======================
    // Help System
    // =======================

    const tab_HELP = `Creates token action macros for the selected token’s character sheet. Works only with the official D&D 5e (2024) Roll20 sheet.<br>
<b>USAGE:</b>&#10;
<code>!tab</code> — Create all standard token actions.&#10;
<code>!tab name</code> — Same as above, but uses the character name instead of the character id in each macro (useful when moving a character to a new game).&#10;
<code>!tab [categories]</code> — Create token actions only for the specified categories.&#10;
<code>!tab [categories] name</code> — Same as above, but using the character name instead of the character id in each macro.&#10;
<code>!tab delete</code> — Deletes all unprotected token actions. Protect macros by putting a period after the name.&#10;
<code>!tab deleteall</code> — Deletes ALL macros, regardless of if they are protected.&#10;
<code>!tab help</code> — Show this help message.<br>
<b>CATEGORIES:</b>&#10;
If a category does not apply to the tye of character, it will be skipped. Example: NPCs have Actions, not Attacks. Singular or plural for each keyword are acepted.&#10;
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
<code>!tab</code> — Full set of NPC or PC macros.&#10;
<code>!tab attacks spells</code> — Only attacks(PC) and spells.&#10;
<code>!tab checks name</code> — All ability and skill checks using the character name in the macro code.<br>
<b>NOTES:</b>&#10;
Run the command with the token(s) selected.&#10;
Macros are created as token actions, visible only when that token is selected.&#10;
Name Prefixes are used to group action types on NPCs:&#10;
&nbsp;_B.Bonus Actions, _R.Reactions,&#10;
&nbsp;_L.Legendary, and _M.Mythic.&#10;
Unless specified, Trait buttons are not created for PCs, to keep the token bar manageable.&#10;
Checks, Saves and Init are preceded by a period for consistent placement at the beginning of the list.`;



    // ============================================
    //      BEACON SHEET TEST (specifically for "dnd2024byroll20")
    // ============================================
    const beaconSheet = (() => {
        const sheetCache = {};

        const getCharacter = (query) => {
            const chars = findObjs({
                type: 'character'
            });
            return chars.find(c => c.id === query) ||
                chars.find(c => c.id === (getObj('graphic', query)?.get('represents'))) ||
                chars.find(c => c.get('name') === query);
        };

        const detectBeacon = (characterId) => {
            const char = getObj("character", characterId);
            if (!char) return false;
            const sheetName = (char.get("charactersheetname") || "").toLowerCase();
            return sheetName.includes("dnd2024byroll20");
        };

        const buildCache = () => {
            const chars = findObjs({
                type: "character"
            });
            for (let c of chars) {
                sheetCache[c.id] = detectBeacon(c.id);
            }
        };

        // Automatically update cache if sheet changes
        on("change:character:charactersheetname", (char) => {
            sheetCache[char.id] = detectBeacon(char.id);
        });

        const beaconTest = (query) => {
            if (!query) return false;
            const char = getCharacter(query);
            if (!char) return false;

            if (sheetCache[char.id] !== undefined) return sheetCache[char.id];

            // Fallback: detect and cache
            const isBeacon = detectBeacon(char.id);
            sheetCache[char.id] = isBeacon;
            return isBeacon;
        };

        on('ready', () => buildCache());

        return beaconTest;
    })();



// =======================
// Abbreviate Names
// =======================
function abbreviateName(name) {
    if (!name) return "";

    // Weapon and attack type abbreviations
    name = name.replace(/ \(One[-\s]?Handed\)/i, "-1H");        // "Sword (One-Handed)" or "Sword (One Handed)" → "Sword-1H"
    name = name.replace(/ \(Two[-\s]?Handed\)/i, "-2H");        // "Greatsword (Two-Handed)" or "Greatsword (Two Handed)" → "Greatsword-2H"
    name = name.replace(/ \(Melee; One[-\s]?Handed\)/i, "-1Hm");// e.g., "Dagger (Melee; One-Handed)" → "Dagger-1Hm"
    name = name.replace(/ \(Melee; Two[-\s]?Handed\)/i, "-2Hm");// e.g., "Polearm (Melee; Two-Handed)" → "Polearm-2Hm"
    name = name.replace(/Thrown/i, "Thrn");                     // e.g., "Thrown Weapon" → "Thrn Weapon"
    name = name.replace(/Finesse/i, "Fnss");                    // e.g., "Finesse Attack" → "Fnss Attack"
    name = name.replace(/Dexterous/i, "Dex");                   // e.g., "Dexterous Strike" → "Dex Strike"
    name = name.replace(/Open Hand Technique/i, "Open Hand");   // e.g., "Open Hand Technique" → "Open Hand"
    name = name.replace(/ \(Psionics\)/i, "—Psi");              // e.g., "Mind Blast (Psionics)" → "Mind Blast—Psi"
    name = name.replace(/ \(Melee\)/i, "-m");                   // e.g., "Punch (Melee)" → "Punch-m"
    name = name.replace(/ \(Ranged\)/i, "-r");                  // e.g., "Bow (Ranged)" → "Bow-r"
    name = name.replace(/\bForm Only\b/i, "Form");              // e.g., "Bear Form Only" → "Bear Form"

    // HP status phrases
    name = name.replace(/swarm has more than half hp/i, "HP>Half"); // e.g., "swarm has more than half HP" → "HP>Half"
    name = name.replace(/swarm has half hp or less/i, "HP<=Half");  // e.g., "swarm has half HP or less" → "HP<=Half"

    // Special recharge handling (merged into one statement)
    name = name.replace(/\s?\(Recharges?(.*?)\)|\bRecharges?\s(\d+-\d+)/i,
        (match, parenRecharge, plainRecharge) => {
            if (parenRecharge !== undefined) {
                const text = parenRecharge.trim();
                if (!text) return "—R"; // fallback for empty parentheses
                if (/Short or Long Rest/i.test(text)) return "—R Short/Long";
                if (/Short Rest/i.test(text)) return "—R Short";
                if (/Long Rest/i.test(text)) return "—R Long";
                return "—R " + text; // any other special recharge (e.g., "at Dawn", "in Moonlight")
            }
            if (plainRecharge) return "R" + plainRecharge; // e.g., "Recharge 5-6" → "R5-6"
            return match;
        });

    // Other action abbreviations
    name = name.replace(/\s?\((\d+)\/Day\)/i, "$1/d");       // e.g., "(3/Day)" → "3/d"
    name = name.replace(/\s\(Costs\s(.*)\sActions\)/i, "—$1a"); // e.g., "(Costs 2 Actions)" → "—2a"
    name = name.replace(/\sVariant\)/i, "—");                // e.g., "Ability (Variant)" → "Ability—"

    // General cleanup
    name = name.replace(/\s?\(/g, "—"); // any "(" or " (" → "—"
    name = name.replace(/\)/g, "");     // any ")" → ""
    name = name.replace(/\.+$/, "");    // removes one or more periods at the end

    // Catch for ill-formed names
    name = name.replace(/.*template:error.*/i, "Token Action " + (Math.floor(Math.random() * 100) + 1));

    return name;
}





    // =======================
    // Parse !tab command input
    // =======================
    function parsetabCommand(msgContent) {
        const parts = msgContent.trim().split(/\s+/).slice(1);
        const categories = new Set();
        let useNames = false;
        let userSpecified = parts.length > 0; // Detect if user actually typed categories

        parts.forEach(word => {
            const lc = word.toLowerCase();
            if (lc === "name" || lc === "names") {
                useNames = true;
                return;
            }
            const cat = keywordAliases[lc];
            if (cat) categories.add(cat);
        });

        // If no explicit categories were typed, use default set
        if (categories.size === 0) {
            return {
                categories: [...Object.keys(categoryMeta), "saves", "checks", "init", "spells"],
                useNames,
                userSpecified: false // plain !tab
            };
        }

        return {
            categories: Array.from(categories),
            useNames,
            userSpecified: true
        };
    }

    // =======================
    // Get Spells (ids)
    // =======================
    async function getSpells(characterId) {
        const result = {};
        const cantripIds = await getComputed(characterId, "reporder_spell-cantrip") || [];
        if (cantripIds.length) result[0] = cantripIds;
        for (let lvl = 1; lvl <= 9; lvl++) {
            const ids = await getComputed(characterId, `reporder_spell-${lvl}`) || [];
            if (ids.length) result[lvl] = ids;
        }
        return result;
    }

    // =======================
    // Build spells macro with names
    // =======================
    async function buildSpellsMacro(spells, characterName, characterId, useNames) {
        const sections = [];
        const idRef = useNames ? characterName : characterId;

        for (const [lvl, ids] of Object.entries(spells)) {
            let header;
            if (lvl === "0") {
                header = "**Cantrips**";
            } else {
                const total = `[[@{${idRef}|lvl${lvl}_slots_total}]]`;
                const expended = `@{${idRef}|lvl${lvl}_slots_expended}`;
                const remaining = `[[${total} - ${expended}]]`;
                header = `**Level ${lvl}** - ${remaining} / ${total}`;
            }

            const buttons = [];
            for (let id of ids) {
                const prefix = (lvl === "0") ? "repeating_spell-cantrip" : `repeating_spell-${lvl}`;
                let spellName = "";
                try {
                    spellName = await getSheetItem(characterId, `repeating_spell_${id}_spellname`);
                } catch (e) {
                    spellName = `Spell-${id}`;
                }
                const label = spellName || `Spell-${id}`;
                buttons.push(`[ⓘ](~${idRef}|${prefix}_${id}_output) [${label}](~${idRef}|${prefix}_${id}_spell)`);
            }

            sections.push(`${header}\n${buttons.join("\n")}`);
        }

        const title = `${characterName} Spells`;
        const template = `&{template:default} {{name=${title}}}[[]{{=${sections.join("\n\n")}}}`;
        return `/w "@{selected|character_name}" ${template}`;
    }

    // =======================
    // Get Items for Category (with names)
    // =======================
    async function getItemsForCategory(characterId, category, meta) {
        if (!meta) return [];

        const ids = await getComputed(characterId, `reporder_${meta.section}`);
        if (!ids || !ids.length) return [];

        const results = [];
        const sizeWords = ["tiny", "small", "medium", "large", "huge", "gargantuan"];

        for (let id of ids) {
            try {
                let nameAttr = `${meta.macroPrefix}_${id}_name`;

                // --- Roll20 sheet quirk: repeating_attack rows use _atkname instead of _name ---
                if (meta.macroPrefix === "repeating_attack") {
                    nameAttr = `${meta.macroPrefix}_${id}_atkname`;
                    //nameAttr = `repeating_attack_${id}_atkname`; //trying different prefixes
                log("Raw nameAttr = " + nameAttr);
                }

                // --- Roll20 sheet quirk: repeating_trait rows use repeating_traits instead of _name ---
                if (meta.macroPrefix === "repeating_trait") {
                    nameAttr = `repeating_traits_${id}_name`;
                    //nameAttr = `repeating_attack_${id}_atkname`; //trying different prefixes
                log("Raw nameAttr = " + nameAttr);
                }

                let name = await getSheetItem(characterId, nameAttr);
                if (name) {
                    name = meta.namePrefix + name;

                    // --- Skip if the name is *exactly* a size word (case-insensitive) ---
                    if (sizeWords.includes(name.trim().toLowerCase())) {
                        //log(`Token Action Builder: Skipping size trait "${name}" for ${characterId}`);
                        continue;
                    }

                    results.push({
                        id,
                        name
                    });
                }
            log("Raw name = " + name);

            } catch {
                // skip if no name
            }
        }
        return results;
    }


    // =======================
    // Generate Macro
    // =======================
    function generateMacro(characterId, characterName, category, item, meta, useNames) {
        try {
            const idRef = useNames ? characterName : characterId;
            const macroString = `%{${idRef}|${meta.macroPrefix}_${item.id}_${meta.macroType}}`;
            return {
                name: item.name,
                macro: macroString
            };
        } catch (e) {
            return null;
        }
    }

    // =======================
    // Create Token Action
    // =======================
    async function createTokenAction(characterId, actionName, macroString) {
        if (!macroString) return;
        let ability = findObjs({
            _type: "ability",
            characterid: characterId,
            name: actionName
        })[0];
        if (ability) {
            ability.set({
                action: macroString,
                istokenaction: true
            });
        } else {
            ability = createObj("ability", {
                characterid: characterId,
                name: actionName,
                action: macroString,
                istokenaction: true
            });
        }
    }

    // =======================
    // Process Token
    // =======================
    async function processToken(token, categories = [], useNames = false, userSpecified = false) {
        const tokenObj = getObj("graphic", token._id);
        if (!tokenObj) return;
        const characterId = tokenObj.get("represents");
        if (!characterId) return;
        const charObj = getObj("character", characterId);
        const characterName = charObj ? charObj.get("name") : "Character";

        let npcAttrRaw = "";
        try {
            npcAttrRaw = await getSheetItem(characterId, "npc");
        } catch {}
        const normalized = String(npcAttrRaw ?? "").toLowerCase().trim();
        const isPc = (normalized === "on" || normalized === "1" || normalized === "true");
        const type = isPc ? "pc" : "npc";

        for (let category of categories) {

            // --- Skip PC traits if not explicitly requested ---
            if (type === "pc" && category === "trait" && !userSpecified) {
                continue;
            }

            if (category === "spells") {
                const spells = await getSpells(characterId);
                if (Object.keys(spells).length > 0) {
                    const macro = await buildSpellsMacro(spells, characterName, characterId, useNames);
                    await createTokenAction(characterId, "Spells", macro);
                }
                continue;
            }

            if (category === "checks" || category === "saves" || category === "init") {
                await createBasicAbilities(characterId, category);
                continue;
            }

            const metaForType = categoryMeta[category]?.[type];
            if (!metaForType) continue;

            const items = await getItemsForCategory(characterId, category, metaForType);
            for (let item of items) {
                const itemName = abbreviateName(item.name);
                const macro = generateMacro(characterId, characterName, category, {
                    ...item,
                    name: itemName
                }, metaForType, useNames);
                if (macro) {
                    await createTokenAction(characterId, macro.name, macro.macro);
                }
            }
        }
    }


    // =======================
    // COMMON MACROS FOR CHECKS, SKILLS AND INITIATIVE
    // =======================

async function createBasicAbilities(characterId, which) {

    // Added save-mod attributes here
    const abilityAttrs = [
        "strength_bonus", "dexterity_bonus", "constitution_bonus",
        "intelligence_bonus", "wisdom_bonus", "charisma_bonus",

        "strength_save_mod", "dexterity_save_mod", "constitution_save_mod",
        "intelligence_save_mod", "wisdom_save_mod", "charisma_save_mod"
    ];

    const skillAttrs = [
        "acrobatics_bonus", "animal_handling_bonus", "arcana_bonus", "athletics_bonus",
        "deception_bonus", "history_bonus", "insight_bonus", "intimidation_bonus",
        "investigation_bonus", "medicine_bonus", "nature_bonus", "perception_bonus",
        "performance_bonus", "persuasion_bonus", "religion_bonus",
        "sleight_of_hand_bonus", "stealth_bonus", "survival_bonus"
    ];

    const allAttrs = [...abilityAttrs, ...skillAttrs];

    // Fetch all values in parallel
    const values = await Promise.all(
        allAttrs.map(attr =>
            getSheetItem(characterId, attr).catch(() => 0)
        )
    );

    // Build bonuses map
    const bonuses = {};
    allAttrs.forEach((attr, i) => {
        const val = parseInt(values[i]) || 0;
        bonuses[attr] = val;
    });

    if (which === "init") {
        createTokenAction(characterId, ".Init", "%{selected|initiative}");
        return;
    }

    function formatOption(label, attr, bonus) {
        const sign = bonus >= 0 ? "+" : "";
        return `| ${label} ${sign}${bonus}, %{selected&#124;${attr}&#125;`;
    }

    //
    // SAVING THROWS (patched)
    //
    if (which === "saves") {
        const saveOptionsRaw = [
            ["Strength",     "npc_strength_save",     bonuses.strength_save_mod],
            ["Dexterity",    "npc_dexterity_save",    bonuses.dexterity_save_mod],
            ["Constitution", "npc_constitution_save", bonuses.constitution_save_mod],
            ["Intelligence", "npc_intelligence_save", bonuses.intelligence_save_mod],
            ["Wisdom",       "npc_wisdom_save",       bonuses.wisdom_save_mod],
            ["Charisma",     "npc_charisma_save",     bonuses.charisma_save_mod]
        ];

        const saveOptions = saveOptionsRaw.map(([label, attr, bonus]) =>
            formatOption(label, attr, bonus)
        );

        if (saveOptions.length) {
            saveOptions[saveOptions.length - 1] =
                saveOptions[saveOptions.length - 1].replace(/&#125;$/, "&#125;}");
        }

        const saveAction = `?{Saving Throw?\n${saveOptions.join("\n")}`;
        createTokenAction(characterId, ".Save", saveAction);
        return;
    }

    //
    // ABILITY CHECKS (unchanged)
    //
    if (which === "checks") {
        const checkOptions = [];

        for (let [label, attr] of [
                ["Strength", "strength"],
                ["Dexterity", "dexterity"],
                ["Constitution", "constitution"],
                ["Intelligence", "intelligence"],
                ["Wisdom", "wisdom"],
                ["Charisma", "charisma"]
            ]) {
            checkOptions.push(formatOption(label, attr, bonuses[`${attr}_bonus`] || 0));
        }

        for (let skill of skillAttrs) {
            const bonus = bonuses[skill] || 0;
            const cleanName = skill.replace("_bonus", "").replace(/_/g, " ");
            const baseName = skill.replace("_bonus", "");
            const labelName = cleanName.replace(/\b\w/g, c => c.toUpperCase());
            checkOptions.push(formatOption(labelName, baseName, bonus));
        }

        if (checkOptions.length) {
            checkOptions[checkOptions.length - 1] =
                checkOptions[checkOptions.length - 1].replace(/&#125;$/, "&#125;}");
        }

        const checkAction = `?{Check?\n${checkOptions.join("\n")}`;
        createTokenAction(characterId, ".Check", checkAction);
        return;
    }
}


    // =======================
    // Delete Token Actions
    // =======================
    async function deleteTokenActions(selectedTokens, protectPeriodEnding = true) {
        if (!selectedTokens || selectedTokens.length === 0) return;
        for (let token of selectedTokens) {
            const tokenObj = getObj("graphic", token._id);
            if (!tokenObj) continue;
            const characterId = tokenObj.get("represents");
            if (!characterId) continue;
            const abilities = findObjs({
                _type: "ability",
                characterid: characterId
            });
            for (let ab of abilities) {
                const name = ab.get("name");
                if (protectPeriodEnding && name.endsWith(".")) continue;
                ab.remove();
            }
        }
    }

    // =======================
    // Chat Command Handler
    // =======================
    on("chat:message", async function(msg) {
        if (msg.type !== "api") return;
        if (!(msg.content === "!tab" || msg.content.startsWith("!tab "))) return;
        if (!ensureExperimentalMode(msg)) return;

        const cmd = msg.content.trim();

        // ---- Help message ----
        if (cmd === "!tab help") {
            sendMsg(msg, "Token Action Maker 24 Help", tab_HELP);
            return;
        }

        // ---- Validate token selection ----
        if (!msg.selected || msg.selected.length === 0) {
            sendMsg(msg, "Error", "No tokens selected!");
            return;
        }

        // ---- Filter selected tokens to Beacon-only ----
        const beaconTokens = [];
        for (let token of msg.selected) {
            const tokenObj = getObj("graphic", token._id);
            if (!tokenObj) continue;
            const characterId = tokenObj.get("represents");
            if (!characterId) continue;

            if (beaconSheet(characterId)) {
                beaconTokens.push(token);
            }
        }

        if (!beaconTokens.length) {
            sendMsg(msg, "Sheet Mismatch", "None of the selected tokens are from a Beacon sheet. Aborting.");
            return;
        }


        // ---- Delete token actions (protected by period) ----
        if (cmd === "!tab delete") {
            const deletedTokens = beaconTokens.map(t => getObj("graphic", t._id)?.get("name") || "Unknown");
            await deleteTokenActions(beaconTokens, true);
            sendMsg(msg, "Token Actions Deleted", `Token actions deleted (except protected macros whose name ends in a period) for <br>${deletedTokens.join(" <br> ")}.`);
            return;
        }




        // ---- Ask for confirmation before deleting all token actions ----
        if (cmd === "!tab deleteall") {
            const buttonMessage = `Are you sure you wish to delete ALL token actions on the selected characters? This cannot be undone.<br>[Delete ALL](!tab deleteallconfirmed) | [Cancel](!tab cancel)`;
            sendMsg(msg, "Confirmation Required", buttonMessage);
            return;
        }

        // ---- Delete all token actions after confirmation ----
        if (cmd === "!tab deleteallconfirmed") {
            const deletedTokens = beaconTokens.map(t => getObj("graphic", t._id)?.get("name") || "Unknown");
            await deleteTokenActions(beaconTokens, false);
            sendMsg(msg, "All Token Actions Deleted", `All token actions deleted for:<br>${deletedTokens.join("<br>")}.`);
            return;
        }

        // ---- Cancel deletion ----
        if (cmd === "!tab cancel") {
            sendMsg(msg, "Deletion Canceled", "No token actions were deleted.");
            return;
        }


        // ---- Validate keywords before proceeding ----
        const args = cmd.split(/\s+/).slice(1); // everything after "!tab"
        const validKeywords = Object.keys(keywordAliases);

        const invalid = args.filter(arg => !validKeywords.includes(arg.toLowerCase()));

        if (invalid.length > 0) {
            sendMsg(
                msg,
                "Invalid Command",
                `One or more keywords used in the last command were invalid: ${invalid.map(x => `<code>${x}</code>`).join(", ")} <br>Type <code>!tab help</code> for a list of valid keywords.`
            );
            return;
        }




        // ---- Standard !tab command to create token actions ----
        const parsed = parsetabCommand(msg.content);
        let categories = parsed.categories || [];
        const useNames = !!parsed.useNames;
        const userSpecified = !!parsed.userSpecified;

        // ---- Inform the user if multiple tokens or full suite of actions are requested ----
        const selectedCount = beaconTokens.length;
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

        // ---- Process each token individually, collecting full accounting ----
        const tokenPromises = beaconTokens.map(async (token) => {
            const tokenName = getObj("graphic", token._id)?.get("name") || "Unknown";
            try {
                await processToken(token, categories, useNames, userSpecified, msg);
                return {
                    name: tokenName,
                    ok: true
                };
            } catch (err) {
                log(`Token Action Builder: ERROR processing token "${tokenName}": ${err}`);
                return {
                    name: tokenName,
                    ok: false,
                    error: String(err)
                };
            }
        });

        const settled = await Promise.allSettled(tokenPromises);

        // Build readable lists
        const succeeded = [];
        const failed = [];
        for (let s of settled) {
            if (s.status === "fulfilled") {
                const r = s.value;
                if (r.ok) {
                    succeeded.push(r.name);
                } else {
                    failed.push(`${r.name} — Error: ${r.error}`);
                }
            } else {
                const reason = s.reason ? String(s.reason) : "Unknown reason";
                failed.push(`Unknown token — Error: ${reason}`);
            }
        }

        const parts = [];
        if (succeeded.length) parts.push(`Succeeded:<br>${succeeded.join("<br>")}`);
        if (failed.length) parts.push(`Failed:<br>${failed.join("<br>")}`);
        const finalMsg = parts.length ? parts.join("<br><br>") : `No tokens processed.`;

        sendMsg(msg, "Token Actions Created", finalMsg);
    });

    return {
        parsetabCommand,
        processToken
    };
})();
{
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.tab24.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.tab24.offset);
    }
}
