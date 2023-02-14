const fs = require("fs");
const path = require("path");
const serverInfo = require("./serverInfo");
const objectUploader = require('./objectUploader');


let validations = {
    folders: { downloads: '', toEncode: '', encoded: '' },
    content: { toEncodeFolders: [], encodedFolders: [], downloadedFolders: [] },
    init: () => {
        const isLinux = serverInfo.isLinux;
        if(isLinux){
            console.log("Platform detected as linux");
            module.exports.folders.downloads = '/mnt/pve/DownloadsStorage/download/';
            module.exports.folders.toEncode = '/mnt/pve/DownloadsStorage/ToEncode/';
            module.exports.folders.encoded = '/mnt/pve/DownloadsStorage/Encoded/';
            objectUploader.login();
            objectUploader.getFolders();
            
        }
        //else{
            //
        //}
    },
    exists: async (route) => {
        return fs.existsSync(route);
    },
    getSubFolders: async (folder) => {
        return fs.readdirSync(folder).map(file => path.join(folder, file)).filter(path => fs.statSync(path).isDirectory());
    },
    getFiles: async (folder) => {
        return fs.readdirSync(folder).map(file => path.join(folder, file)).filter(path => fs.statSync(path).isFile());
    },
    isCompletedDownload: async (route) => {
        return !route.endsWith(".part");
    },
    moveDownloadedObjects: async () => {
        module.exports.content.downloadedFolders = await module.exports.getSubFolders(module.exports.folders.downloads);
        module.exports.content.toEncodeFolders = await module.exports.getSubFolders(module.exports.folders.toEncode);
        let mFolder = module.exports.folders.toEncode + "Movies/";

        let rootFiles = await module.exports.getFiles(module.exports.folders.downloads);

        let mFolderExists = await module.exports.exists(mFolder);
        
        if(!mFolderExists){
            await module.exports.createFolder("Movies", module.exports.folders.toEncode);
        }

        for (const file of rootFiles) {
            await module.exports.moveFileIfNotExists(file, module.exports.folders.downloads, mFolder);
            /*
            let destiny = mFolder + file.replace(module.exports.folders.downloads, "");
            let fileExists = await module.exports.exists(destiny);
            let isCompleted = await module.exports.isCompletedDownload(file);
            if(isCompleted){
                if(!fileExists){
                    //fs.copyFileSync(file, destiny);
                    console.log(destiny + " has been copied to toEncode folder")
                    //fs.unlinkSync(file);
                    console.log(destiny + " has been deleted")
                }
            }
            */
        }
        
        for (const folder of module.exports.content.downloadedFolders) {

            await module.exports.createFolderIfNotExists(folder, module.exports.folders.downloads, module.exports.folders.toEncode);

            /*
            let nf = folder.replace(module.exports.folders.downloads, module.exports.folders.toEncode);
            let folderExists = await module.exports.exists(nf);
            if(!folderExists){
                //await module.exports.createFolder(nf);
                console.log("folder: " + nf + " has been created")
            }
            */
            let files = await module.exports.getFiles(folder);
            for (const file of files) {
                await module.exports.moveFileIfNotExists(file, module.exports.folders.downloads, module.exports.folders.toEncode);
                /*
                let destiny = module.exports.folders.toEncode + file.replace(module.exports.folders.downloads, "");
                let fileExists = await module.exports.exists(destiny);
                let isCompleted = await module.exports.isCompletedDownload(file);
                if(isCompleted){
                    if(!fileExists){
                        //fs.copyFileSync(file, destiny);
                        console.log(destiny + " has been copied to toEncode folder")
                        //fs.unlinkSync(file);
                        console.log(destiny + " has been deleted")
                    }
                }
                */
            }   
        }
        
    },
    createFolderIfNotExists: async (folder, originalFolder, destinyFolder) => {
        let nf = folder.replace(originalFolder, destinyFolder);
        let fnam = folder.replace(originalFolder, "");
        let tmp = await module.exports.fixNames(nf) ? '' : tmp;
        console.log() 
        let folderExists = await module.exports.exists(nf);
        if(!folderExists){
            let nfNam = await module.exports.fixNames(fnam);
            //let ex = await objectUploader.folderExists(nfNam);
            //console.log(ex);
            console.log('folder: ' + nfNam);
            console.log('route: ' + destinyFolder);
            console.log('full route: ' + destinyFolder + nfNam)
            await module.exports.createFolder(nfNam, destinyFolder);
            
            console.log("folder: " + nfNam + " has been created")
        }
    },
    fixNames: async (route) => {
        const reSQ = /\[[^[]*\w[^]]*\]/g;
        const regPar = /\([^(]*\w[^)]*\)/g;
        let newName = route.replace(reSQ, "").replace(regPar, "");
        console.log("New modified Folder: "+ newName);
        return newName.trim();
    },
    moveFileIfNotExists: async (file, originalFolder, destinyFolder) => {
        //let fnam = folder.replace(originalFolder, "");
        let ff = file.replace(originalFolder, "");
        ff = ff.split("/")
        let destiny = file.replace(originalFolder, destinyFolder);
        if(ff.length > 1){
            let nf = ff[ff.length -1];
            ff = await module.exports.fixNames(ff[0]);
            console.log(ff)
            console.log(nf)
            destiny = destinyFolder.trim() + ff.trim() + "/" + nf.trim();
            console.log(nf);
        }
        console.log(destiny);
        let fileExists = await module.exports.exists(destiny);
        let isCompleted = await module.exports.isCompletedDownload(file);
        if(isCompleted){
            if(!fileExists){
                fs.copyFileSync(file, destiny);
                console.log(destiny + " has been copied to toEncode folder")
                fs.unlinkSync(file);
                console.log(destiny + " has been deleted")
            }
        }
    },
    equalizeSubFolders: async () => {
        let downloadedFolders = await module.exports.getSubFolders(module.exports.folders.downloads);
        let toEncodeFolders = await module.exports.getSubFolders(module.exports.folders.toEncode);
        let encodedFolders = await module.exports.getSubFolders(module.exports.folders.encoded);

        for(let i = 0; i < toEncodeFolders.length; i++){
            let folder = toEncodeFolders[i];
            toEncodeFolders = await module.exports.getSubFolders(module.exports.folders.toEncode);
            encodedFolders = await module.exports.getSubFolders(module.exports.folders.encoded);
            //console.log(folder)
            let exists = await module.exports.exists(folder, encodedFolders);
            if(!exists){
                console.log("Creating: "+ folder.replace(module.exports.folders.toEncode, ""))
                await module.exports.createFolder(folder.replace(module.exports.folders.toEncode, ""), module.exports.folders.encoded);
            }
            toEncodeFolders = await module.exports.getSubFolders(module.exports.folders.toEncode);
            encodedFolders = await module.exports.getSubFolders(module.exports.folders.encoded);
            await module.exports.scanFolderVideos(folder);
        }

    },
    createFolder: async (folderName, destino) => {
        //let ex = await objectUploader.folderExists(folderName);
        //console.log(ex);
        let ex = await module.exports.exists(destino + folderName);
        console.log(ex)
        if(!ex){
            fs.mkdirSync(destino + folderName);
        }
        return;
    }

}

module.exports = validations;