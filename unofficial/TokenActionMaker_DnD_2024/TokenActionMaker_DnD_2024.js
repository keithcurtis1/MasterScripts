/**
 * TAM2024 - Token Action Manager for D&D 5e (Beacon)
 * Author: keithcurtis with GPT5
 * Date: 2025-09-02
 */

const TAM2024 = (() => {
    "use strict";

    // =======================
    // Category & Macro Metadata
    // =======================
    const categoryMeta = {
        action:      { section: "npcactions",      macroPrefix: "repeating_npcaction",      macroType: "action",    label: "NPCAction" },
        bonus:       { section: "npcbonusactions", macroPrefix: "repeating_npcbonusaction", macroType: "action",    label: "NPCBonus" },
        reaction:    { section: "npcreactions",    macroPrefix: "repeating_npcreaction",    macroType: "action",    label: "NPCReaction" },
        legendary:   { section: "npcactions-l",    macroPrefix: "repeating_npcaction-l",    macroType: "action",    label: "NPCLegendary" },
        mythic:      { section: "npcactions-m",    macroPrefix: "repeating_npcaction-m",    macroType: "action",    label: "NPCMythic" }
    };

    // =======================
    // Keyword Aliases
    // =======================
    const keywordAliases = {
        action: "action",
        actions: "action",
        bonus: "bonus",
        bonusaction: "bonus",
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
        initiative: "init"
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

    
    
    

    // =======================
    // Parse !ta Command Input
    // =======================
    function parseTamCommand(msgContent) {
        const parts = msgContent.trim().split(/\s+/).slice(1);
        if (parts.length === 0) {
            // default: everything
            return [...Object.keys(categoryMeta), "saves", "checks", "init"];
        }
        const categories = new Set();
        parts.forEach(word => {
            const cat = keywordAliases[word.toLowerCase()];
            if (cat) categories.add(cat);
        });
        log(`TAM2024: Parsed categories: ${Array.from(categories).join(", ")}`);
        return Array.from(categories);
    }

    // =======================
    // processToken
    // =======================
async function processToken(token, categories) {
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

    log(`TAM2024: Processing token "${tokenObj.get("name")}" representing character ${characterId}`);

    const catPromises = categories.map(async (category) => {
        // === Special-case: Checks, Saves, Initiative ===
        if (category === "checks" || category === "saves" || category === "init") {
            await createBasicAbilities(characterId, category);
            return;
        }

        // === Normal category flow ===
        if (!categoryMeta[category]) {
            log(`TAM2024: Unknown category "${category}", skipping.`);
            return;
        }

        log(`TAM2024: Fetching items for category "${category}"`);
        let items;
        try {
            items = await getItemsForCategory(characterId, category);
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

            const macro = generateMacro(characterId, category, item);
            if (!macro) {
                log(`TAM2024: Failed to generate macro for item ID "${item.id}" in category "${category}"`);
                continue;
            }

            log(`TAM2024: Creating token action "${macro.name}" with macro: ${macro.macro}`);
            try {
                createTokenAction(characterId, macro.name, macro.macro);
            } catch (err) {
                log(`TAM2024: ERROR creating token action "${macro.name}" for category "${category}": ${err}`);
            }
        }
    })
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
    for (let attr of [...abilityAttrs, ...skillAttrs]) {
        try {
            bonuses[attr] = parseInt(await getSheetItem(characterId, attr)) || 0;
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
        saveOptions[saveOptions.length - 1] = saveOptions[saveOptions.length - 1].replace(/&#125;$/, "&#125;}");
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

        checkOptions[checkOptions.length - 1] = checkOptions[checkOptions.length - 1].replace(/&#125;$/, "&#125;}");
        const checkAction = `?{Check?\n${checkOptions.join("\n")}`;
        createTokenAction(characterId, "Check", checkAction);
        return;
    }
}

    // =======================
    // getItemsForCategory
    // =======================
    async function getItemsForCategory(characterId, category) {
        const meta = categoryMeta[category];
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
    // generateMacro
    // =======================
    function generateMacro(characterId, category, item) {
        const meta = categoryMeta[category];
        if (!meta) return null;
        return {
            name: item.name,
            macro: `%{${characterId}|${meta.macroPrefix}:${item.id}:${meta.macroType}}`
        };
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
async function processSelectedTokens(selectedTokens, categories) {
    if (!selectedTokens || selectedTokens.length === 0) return;
    const tokenPromises = selectedTokens.map(async token => {
        try {
            await processToken(token, categories);
        } catch (err) {
            log(`TAM2024: ERROR processing token: ${err}`);
        }
    })
    await Promise.all(tokenPromises);
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
    const categories = parseTamCommand(msg.content);

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

    await processSelectedTokens(msg.selected, categories);
    sendMsg(msg, "Token Actions Created", `Finished creating token actions for ${msg.selected.length} token(s).`);
});

    return { parseTamCommand, processToken, processSelectedTokens };
})();
