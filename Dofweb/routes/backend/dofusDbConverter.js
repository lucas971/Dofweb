var msgpack = require("@msgpack/msgpack")
var fs = require('fs').promises

function SaveStuff(e) {
    var t = {};
    t[0] = {};
    for (var a = 0; a < e.BaseCaracs.length; a += 1)
        0 != e.BaseCaracs[a] && (t[0][a] = e.BaseCaracs[a]);

    t[0][0] = '' + (parseInt(t[0][0]) + 100)
    t[0][23] = '1000'

    t[1] = e.AdditionalPoints,
        t[2] = e.Level,
        t[3] = 0,
        t[3] |= e.Poney << 5,
        t[3] |= e.PuissanceCarac << 4,
        t[3] |= e.AllowDamage << 3,
        t[3] |= e.ExoPA << 2,
        t[3] |= e.ExoPM << 1,
        t[3] |= e.ExoPO << 0,
        t[4] = {};
    for (var a = 0; a < e.NumPicks.length; a += 1)
        1 != e.NumPicks[a] && (t[4][a] = e.NumPicks[a]);
    t[5] = [];
    for (var a = 0; a < e.ItemIds.length; a += 1)
        for (var n = 0; n < e.ItemIds[a].length; n += 1)
            t[5].push(e.ItemIds[a][n]);
    return msgpack.encode(t)
}

async function TreatJson() {
    try {
        // Read the file asynchronously
        const data = await fs.readFile('./optimizer/src/discord.json', 'utf8');

        console.log(data)
        // Parse JSON data
        const jdata = JSON.parse(data);

        // Process the data
        const byteArray = SaveStuff(jdata);
        let c = "";
        for (let o = 0; o < byteArray.length; o++) {
            c += String.fromCharCode(byteArray[o]);
        }

        // Create and return the final URL
        return {link:"https://www.dofusbook.net/fr/equipement/dofus-stuffer/objets?stuff=" + btoa(c), value:jdata.Result}
    } catch (err) {
        // Handle errors (e.g., file not found, JSON parsing errors)
        console.error("Error reading or processing JSON file:", err);
        return{error:err};
    }
}

module.exports = {
    TreatJson
}
