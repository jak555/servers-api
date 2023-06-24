const os = require('os');

let serverInfo = {
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
    getCores: os.cpus(),
    getCoresCount: os.cpus().length,

}

module.exports = serverInfo;