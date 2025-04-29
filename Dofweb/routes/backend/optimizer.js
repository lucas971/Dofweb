/*
var child_process = require("child_process");
var util = require("util");

const execPromise = util.promisify(child_process.exec);


async function RunOptimisationAsync() {
    try {
        const { stdout, stderr } = await execPromise("./dofopti.out inputfiles/discord.in discord.json", {
            cwd: './optimizer/src/'
        });
        if (stderr) {
            console.log(stderr)// Handle errors from stderr
        }
        return {}
    } catch (error) {
        console.log(error)
        return {error:error}
    }
}
*/

const { spawn } = require('child_process');

async function RunOptimisationAsync() {
    return new Promise((resolve, reject) => {
        const child = spawn('./dofopti.out', ['inputfiles/discord.in', 'discord.json'], {
            cwd: './optimizer/src/',
        });

        // Listen to stdout
        child.stdout.on('data', (data) => {
            console.log(`[stdout]: ${data.toString()}`);
        });

        // Listen to stderr
        child.stderr.on('data', (data) => {
            console.error(`[stderr]: ${data.toString()}`);
        });

        // Handle process close
        child.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            if (code === 0) {
                resolve({});
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        // Handle errors (like executable not found)
        child.on('error', (err) => {
            console.error(`Failed to start subprocess: ${err}`);
            reject(err);
        });
    });
}
module.exports = {
    RunOptimisationAsync
}