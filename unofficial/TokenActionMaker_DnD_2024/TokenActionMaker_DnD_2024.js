var API_Meta = API_Meta || {};
API_Meta.TAM24 = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.TAM24.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}
/**
 * TAM2024 - Token Action Manager for D&D 5e (Beacon)
 * Author: Keith Curtis with GPT5
 * Date: 2025-09-06
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
            log("TAM2024: Not running — requires EXPERIMENTAL sandbox.");
            return false;
        }
        return true;
    }
    
    function sendMsg(msg, title, message) {
        if (!msg || !msg.playerid) return;
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
    // Abbreviate Names
    // =======================
function abbreviateName(name) {
    if (!name) return "";

    name = name.replace(" (One-Handed)", "-1H");
    name = name.replace(" (Two-Handed)", "-2H");
    name = name.replace(" (Melee; One-Handed)", "-1Hm");
    name = name.replace(" (Melee; Two-Handed)", "-2Hm");
    name = name.replace(" (Psionics)", "(Psi)");
    name = name.replace(" (Melee)", "-m");
    name = name.replace(" (Ranged)", "-r");
    name = name.replace("swarm has more than half HP", "HP>Half");
    name = name.replace("swarm has half HP or less", "HP<=Half");
    name = name.replace(/\s\(Recharge(.*)Short or Long Rest\)/, "-(R Short/Long)");
    name = name.replace(/\s\(Recharge(.*)Short Rest\)/, "-(R Short)");
    name = name.replace(/\s\(Recharge(?=.*Long Rest)(?:(?!Short).)*\)/, "-(R Long)");
    name = name.replace(/\sVariant\)/, ")");
    name = name.replace(/\s\(Recharge\s(.*)\)/, "-(R$1)");
    name = name.replace(/\s\(Costs\s(.*)\sActions\)/, "-($1a)");
    return name;
}



    // =======================
    // Parse !tam command input
    // =======================
    function parseTamCommand(msgContent) {
        const parts = msgContent.trim().split(/\s+/).slice(1);
        const categories = new Set();
        let useNames = false;

        if (parts.length === 0) {
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

        if (categories.size === 0) {
            return { 
                categories: [...Object.keys(categoryMeta), "saves", "checks", "init", "spells"],
                useNames
            };
        }

        return { categories: Array.from(categories), useNames };
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
    for (let id of ids) {
        try {
            let nameAttr = `${meta.macroPrefix}_${id}_name`;

            // --- Roll20 sheet quirk: repeating_attack rows use _atkname instead of _name ---
            if (meta.macroPrefix === "repeating_attack") {
                nameAttr = `${meta.macroPrefix}_${id}_atkname`;
            }

            const name = await getSheetItem(characterId, nameAttr);
            if (name) results.push({ id, name });
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
            return { name: item.name, macro: macroString };
        } catch (e) {
            return null;
        }
    }

    // =======================
    // Create Token Action
    // =======================
    async function createTokenAction(characterId, actionName, macroString) {
        if (!macroString) return;
        let ability = findObjs({ _type: "ability", characterid: characterId, name: actionName })[0];
        if (ability) {
            ability.set({ action: macroString, istokenaction: true });
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
    async function processToken(token, categories = [], useNames = false) {
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

            const meta = categoryMeta[category] ? categoryMeta[category][type] : null;
            if (!meta) continue;
            const items = await getItemsForCategory(characterId, category, meta);
for (let item of items) {
    const itemName = abbreviateName(item.name); // apply abbreviation
    const macro = generateMacro(characterId, characterName, category, { ...item, name: itemName }, meta, useNames);
    if (macro) {
        await createTokenAction(characterId, macro.name, macro.macro);
    }
}
        }
    }

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
            createTokenAction(characterId, ".Init", "%{selected|initiative}");
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
            createTokenAction(characterId, ".Save", saveAction);
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
            const abilities = findObjs({ _type: "ability", characterid: characterId });
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
    if (!msg.content.startsWith("!tam")) return;
    if (!ensureExperimentalMode(msg)) return;

    const cmd = msg.content.trim();

    // ---- Help message ----
    if (cmd === "!tam help") {
        sendMsg(msg, "Token Action Maker 24 Help", TAM_HELP);
        return;
    }

    // ---- Validate token selection ----
    if (!msg.selected || msg.selected.length === 0) {
        sendMsg(msg, "Error", "No tokens selected!");
        return;
    }

    // ---- Delete token actions (protected by period) ----
    if (cmd === "!tamdelete") {
        const deletedTokens = [];
        for (let token of msg.selected) {
            const name = getObj("graphic", token._id)?.get("name") || "Unknown";
            deletedTokens.push(name);
        }
        await deleteTokenActions(msg.selected, true);
        sendMsg(msg, "Token Action Manager", `Token actions deleted (except protected macros whose name ends in a period) for ${deletedTokens.join(" <br> ")}.`);
        return;
    }

    // ---- Ask for confirmation before deleting all token actions ----
    if (cmd === "!tamdeleteall") {
        const buttonMessage = `Are you sure you wish to delete ALL token actions on the selected characters? This cannot be undone.<BR>[Delete ALL](!tamdeleteallconfirmed) | [Cancel](!tamcancel)`;
        sendMsg(msg, "Confirmation Required", buttonMessage);
        return;
    }

    // ---- Delete all token actions after confirmation ----
    if (cmd === "!tamdeleteallconfirmed") {
        const deletedTokens = [];
        for (let token of msg.selected) {
            const name = getObj("graphic", token._id)?.get("name") || "Unknown";
            deletedTokens.push(name);
        }
        await deleteTokenActions(msg.selected, false);
        sendMsg(msg, "All Token Actions Deleted", `All token actions deleted for: ${deletedTokens.join("<br>")}.`);
        return;
    }

    // ---- Cancel deletion ----
    if (cmd === "!tamcancel") {
        sendMsg(msg, "Deletion Canceled", "No token actions were deleted.");
        return;
    }

    // ---- Standard !tam command to create token actions ----
    const parsed = parseTamCommand(msg.content);
    let categories = parsed.categories || [];
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

    // ---- Process each token individually ----
    const processedTokens = [];
    for (let token of msg.selected) {
        const name = getObj("graphic", token._id)?.get("name") || "Unknown";
        processedTokens.push(name);
        await processToken(token, categories, useNames);
    }

    sendMsg(msg, "Token Actions Created", `Finished creating token actions for: ${processedTokens.join("&#10;")}.`);
});

    return { parseTamCommand, processToken };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.TAM24.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TAM24.offset); } }
