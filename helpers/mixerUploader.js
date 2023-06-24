const http = require("http");
const request = require('request');
const axios = require('axios');
const fs  = require("fs");
const FormData = require('form-data');

const sleep = ms => {return new Promise(resolve => setTimeout(resolve, ms))};

let uploader = {
    loginData: {
        username: 'jak555@omegafiles.net',
        apiKey: 'je0VYhlpqgFijq1HWftI'
    },
    folderData: {
        animeFolder: '0',
        animesubFolders: [],
    },
    //304664
    folders: [],
    upload: async (file, folder) => {
        try{
            
            //let content = {files: fs.readFileSync(file)};
            let fold = null;
            if(folder){
                fold = await module.exports.getFolder(folder);
            }

            let parts = file.split('/');
            let fileName = parts[parts.length - 1]
            let fileStream = fs.createReadStream(file);
            let content = {files: fs.createReadStream(file)};
            let formData = new FormData();
            formData.append('file', fileStream, fileName);
            formData.append('email', module.exports.loginData.username);
            formData.append('key', module.exports.loginData.apiKey);
            
            console.log('file ready')

            if(fold){
                formData.append('folder', fold.id);
            }
            else{
                formData.append('folder', module.exports.folderData.animeFolder);
            }
            
            let options = {
                url: 'https://ul.mixdrop.co/api',
            };
            let test = await axios.post(options.url, formData);
            let res = test.data;
            console.log('upload done')
            console.log(res)
            /*
            if(res && res.user && res.user.token){
                module.exports.loginData.token = res.user.token;
            }
            */
            return true;
        }
        catch(err){
            console.log(err);
            return false;
        }
    },
    
    createFolder: async (name) => {
        try{
            let exists = await module.exports.folderExists(name);
            if(!exists && name.trim()){
                let options = {
                    url: `https://api.mixdrop.co/foldercreate?email=${module.exports.loginData.username}&key=${module.exports.loginData.apiKey}&title=${name}&parent=${module.exports.folderData.animeFolder}`,
                };
                console.log(options.url);
                let test = await axios.get(options.url);
                let res = test.data;
                if(res && res.folder){
                    console.log('Mixdrop Folder Created: ' + name);
                    await sleep(150);
                    await module.exports.getFolders(0);
                }
            }
            module.exports.folders.push(name);
            await sleep(150);
            await module.exports.getFolders(0);
        }
        catch(err){
            console.log(err);

        }
    },
    getFolders: async (pageNumber) => {
        try{
            let options = {
                url: `https://api.mixdrop.co/folderlist?email=${module.exports.loginData.username}&key=${module.exports.loginData.apiKey}&id=${module.exports.folderData.animeFolder}&page=${pageNumber}`,
            };
            console.log(options.url);
            let test = await axios.get(options.url);
            //await sleep(100);
            let res = test.data;

            //await sleep(150);
            //pageNumber = pageNumber + 1;
            //await module.exports.getFolders(pageNumber+ 1);

            if(res && res.success){
                console.log(res);
                console.log(res.result);
                console.log(res.result.folders);
                if(res.result && res.result.folders && res.result.folders.length > 0){
                    await sleep(150);
                    await module.exports.getFolders(pageNumber + 1);
                    for (const folder of res.result.folders) {
                        let exists = await module.exports.folderExists();
                        if(!exists){
                            module.exports.folders.push(folder);
                        }
                    }
                }
                else{
                    return;
                }
                //module.exports.folderData.animesubFolders = res.folders;
                //console.log(res.folders);
            }
            else{
                return;
            }
        }
        catch(err){
            console.log(err);
        }
    },
    folderExists: async (folderName) => {
        for (const folder of module.exports.folders) {
            if(folder.title == folderName){
                console.log(folderName + ' Exists')
                return true;
            }
        }
        console.log(folderName + ' Does not exist')
        return false;
    },
    getFolder: async (name) => {
        await module.exports.getFolders(0);
        console.log('checking folder: ' + name)
        console.log(module.exports.folders)
        for (const folder of module.exports.folders) {
            if(name == folder.title){
                return folder;
            }
        }
        return null;
    }
}

module.exports = uploader;