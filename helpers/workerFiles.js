const folderValidations = require("./folderValidations");
const mixerUploader = require("./mixerUploader");
const objectUploader = require("./objectUploader");
const serverInfo = require("./serverInfo");
const videoConverter = require("./videoConverter");
const fs = require('fs');
const execSync = require('child_process').execSync;

const sleep = ms => {return new Promise(resolve => setTimeout(resolve, ms))};

let workerFiles = {
    start: async () => {
        await objectUploader.login();
        folderValidations.init();
        await folderValidations.moveDownloadedObjects();
        let isLogged = objectUploader.isLogged();
        await objectUploader.getFolders();
        //await module.exports.syncFoldersCloudMixer();
        if(isLogged){
            await module.exports.syncFoldersCloud();
            //await module.exports.uploadEncoded();
            await module.exports.processEncode();
            await module.exports.uploadEncoded();
        }
        return;
    },
    uploadEncoded: async () => {
        let subs = await folderValidations.getSubFolders(folderValidations.folders.encoded);
        for (const folder of subs) {
            let nFolder = folder;
            if(serverInfo.isWindows && (folder.startsWith('/') || folder.startsWith('\\'))){
                nFolder.replace('/').replace('\\');
            }
            let files = await folderValidations.getFiles(nFolder);
            let odFolder = await objectUploader.getFolder(nFolder.replace(folderValidations.folders.encoded, ""));
            
            console.log(odFolder)
            console.log("scanning folder: " + nFolder);
            for (const file of files) {
                let res = await objectUploader.upload(file, odFolder.uid);
                console.log(res)
                if(res){
                    console.log('file uploaded: ' + file);
                    //fs.unlinkSync(file);
                }
                console.log("folder: " + nFolder + " found with id: " + odFolder.uid);
                console.log("file: " + file + " has been uploaded");
                await mixerUploader.upload(file, null);
            }
        }
    },
    syncFoldersCloud: async () => {
        let locals = await folderValidations.getSubFolders(folderValidations.folders.encoded);
        await objectUploader.getFolders();
        let cloud = objectUploader.folderData.animesubFolders;
        for (const folder of locals) {
            let onlyName = folder.replace(folderValidations.folders.encoded, "");
            if(!await objectUploader.folderExists(onlyName)){
                await objectUploader.createFolder(onlyName);
            }
        }
    },
    syncFoldersCloudMixer: async () => {
        //let locals = await mixerUploader.getFolders();
        let locals = await folderValidations.getSubFolders(folderValidations.folders.encoded);
        //await objectUploader.getFolders();
        await mixerUploader.getFolders(0);
        await sleep(150);
        let cloud = objectUploader.folderData.animesubFolders;
        for (const folder of locals) {
            console.log('scanning: ' + folder)
            let onlyName = folder.replace(folderValidations.folders.encoded, "");
            if(!await mixerUploader.folderExists(onlyName)){
                await mixerUploader.createFolder(onlyName);
                await sleep(150);
            }
        }
    },
    processEncode: async () => {
        let subs = await folderValidations.getSubFolders(folderValidations.folders.toEncode);
        for (const folder of subs) {
            if(folder.indexOf('lost+found') == -1 && folder.indexOf('fonts') == -1){
                let files = await folderValidations.getFiles(folder);
                console.log("startin Encoder on folder: " + folder);
                for (const file of files) {
                    const isLinux = serverInfo.isLinux;
                    let segments = file.split('/');
                    if(!isLinux){
                        segments = file.split('\\');
                    }
                    let fn = segments[segments.length -1];
                    let f = segments[segments.length - 2];
                    if(!await folderValidations.exists(file.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded)) && (file.endsWith('mp4') || file.endsWith('mkv') || file.endsWith('avi') )){
                        console.log("encoding file: " + file);
                        //await objectUploader.upload(file, folder.replace(folderValidations.folders.toEncode, ""));
                        
                        if(isLinux){
                            await videoConverter.convertLinuxCPU(file);
                        }
                        else{
                            await videoConverter.convertWindowsGPU(file);
                        }
                        
                        //await objectUploader.upload(file.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded), folder.replace(folderValidations.folders.toEncode, ""));
                        //await mixerUploader.upload(file.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded), null);
                        //fs.unlinkSync(file);
                        
                    }
                    //await objectUploader.upload(file.replace('folderValidations.folders.encoded', ''), folder.replace(folderValidations.folders.encoded, ""));
                }
            }
        }
    },
    installFonts: async () => {
        let command1 = 'cp /mnt/pve/DownloadsStorage/ToEncode/fonts* /usr/share/fonts/';
        let command2 = 'fc-cache -f -v';
        await module.exports.execCommand(command1);
        await module.exports.execCommand(command2);
    },
    execCommand: async (command) => {
        execSync(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            fs.unlink(video);
            return;
        });
    },
}

module.exports = workerFiles;