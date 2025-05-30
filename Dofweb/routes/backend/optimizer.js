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
const {TreatJson, GetLink} = require("./dofusDbConverter");

async function RunOptimisationAsync(emitter, data) {
    return new Promise((resolve, reject) => {
        const child = spawn('./dofoptis.out', ['discord.json'], {
            cwd: './optimizer/src/',
        });

        child.stdin.write(data)
        child.stdin.end();
        
        let lastResult={link:"", value:0, items:[]}
        // Listen to stdout
        child.stdout.on('data', (data) => {
            const toRead = data.toString().split("\n");
            toRead.forEach((line, i) => {
                if (line.length === 0){
                    return;
                }
                else if (line.includes("JSON { ")){
                    console.log(line)
                    let data = line.replaceAll("JSON ", "")
                    lastResult = GetLink(data)
                    emitter.onIntermediate(lastResult)
                }
                else{
                    const match = line.match(/\b\d+(\.\d+)?%/);

                    if (match) {
                        emitter.onProgress(match[0])
                    }
                    console.log(`[stdout]: ${line}`);
                }
                console.log(`--------------------------`)
            });
        });

        // Listen to stderr
        child.stderr.on('data', (data) => {
            console.error(`[stderr]: ${data.toString()}`);
        });

        // Handle process close
        child.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
            if (code === 0) {
                emitter.onFinish(lastResult)
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