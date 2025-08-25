on("change:graphic", function(obj, prev) {
    let tokenID = obj.get("id");
    let page = getObj("page", Campaign().get("playerpageid"));
    if (typeof checkLightLevel !== "undefined" && page.get("dynamic_lighting_enabled")) {
        if (prev.left !== obj.get("left") || prev.top !== obj.get("top")) {
            function containsIllumination(illumination, obj) {
                return illumination.some(item => obj.name.includes(item));
            }
            function updateIllumination(obj, lightLevel, dimLight, darkness) {
                let newName;
                if (lightLevel <= darkness) {
                    newName = obj.name.slice(0, -3) + " 🌑";
                } else if (lightLevel > darkness && lightLevel <= dimLight) {
                    newName = obj.name.slice(0, -3) + " 🌗";
                } else {
                    newName = obj.name.slice(0, -3) + " 🌕";
                }
                return newName;
            }
            let dimLight = 50;
            let darkness = 20;
            let lightLevel = (checkLightLevel.isLitBy(obj.get("id")).total * 100).toFixed();
            let illumination = [" **", " 🌑", " 🌗", " 🌕"];
            if (containsIllumination(illumination, prev)) {
                let newName = updateIllumination(prev, lightLevel, dimLight, darkness);
                obj.set("name", newName);
            }
        }
    }
});