var child_process = require("child_process");
var util = require("util");

const execPromise = util.promisify(child_process.exec);


async function RunOptimisationAsync() {
    try {
        const { stdout, stderr } = await execPromise("./dofopti.out inputfiles/discord.in discord.json", {
            cwd: './optimizer/src/'
        });
        if (stderr) {
            return stderr // Handle errors from stderr
        }
        return stdout
    } catch (error) {
        return error
    }
}

module.exports = {
    RunOptimisationAsync
}