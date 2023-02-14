const folderValidations = require("./folderValidations");
const objectUploader = require("./objectUploader");
const serverInfo = require("./serverInfo");
const videoConverter = require("./videoConverter");
const fs = require('fs')
let workerFiles = {
    start: async () => {
        await objectUploader.login();
        folderValidations.init();
        await folderValidations.moveDownloadedObjects();
        let isLogged = objectUploader.isLogged();
        await objectUploader.getFolders();
        if(isLogged){
            await module.exports.syncFoldersCloud();
            await module.exports.uploadEncoded();
            await module.exports.processEncode();
            await module.exports.uploadEncoded();
        }
        return;
    },
    uploadEncoded: async () => {
        let subs = await folderValidations.getSubFolders(folderValidations.folders.encoded);
        for (const folder of subs) {
            let files = await folderValidations.getFiles(folder);
            let odFolder = await objectUploader.getFolder(folder.replace(folderValidations.folders.encoded, ""));
            console.log(odFolder)
            console.log("scanning folder: " + folder);
            for (const file of files) {
                let res = await objectUploader.upload(file, odFolder.uid);
                console.log(res)
                if(res){
                    console.log('file uploaded: ' + file);
                    fs.unlinkSync(file);
                }
                console.log("folder: " + folder + " found with id: " + odFolder.uid);
                console.log("file: " + file + " has been uploaded");
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
    processEncode: async () => {
        let subs = await folderValidations.getSubFolders(folderValidations.folders.toEncode);
        for (const folder of subs) {
            let files = await folderValidations.getFiles(folder);
            console.log("startin Encoder on folder: " + folder);
            for (const file of files) {
                if(!await folderValidations.exists(file.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded))){
                    console.log("encoding file: " + file);
                    //await videoConverter.convertLinuxCPU(file);
                }
                //await objectUploader.upload(file, folder.replace(module.exports.folders.encoded, ""));
            }
        }
    },
}

module.exports = workerFiles;