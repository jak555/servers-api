const http = require("http");
const request = require('request');
const axios = require('axios');
const fs  = require("fs");
const FormData = require('form-data');

let uploader = {
    loginData: {
        idu: '',
        username: 'jak555',
        password: 'Jak.5553086551',
        token: ''
    },
    folderData: {
        animeFolder: '1jju8nldcn59ze',
        animesubFolders: [],
    },
    upload: async (file, folder) => {
        try{
            
            //let content = {files: fs.readFileSync(file)};
            let parts = file.split('/');
            let fileName = parts[parts.length - 1]
            let content = {files: fs.createReadStream(file)};
            let formData = new FormData();
            formData.append('files', content.files, fileName);
            console.log('file ready')
            let options = {
                url: 'http://localhost:3000/omegafilesAPI/files/UploadFile/'+ module.exports.loginData.idu + '/'+ folder,
            };
            let test = await axios.post(options.url, formData, );
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
    login: async () => {
        try{
            let content = {username: module.exports.loginData.username, password: module.exports.loginData.password};
            let options = {
                url: 'http://localhost:3000/omegafilesAPI/users/loginUser',
            };
            let test = await axios.post(options.url, content);
            let res = test.data;
            if(res && res.user && res.user.token){
                module.exports.loginData.token = res.user.token;
                axios.defaults.headers.common['x-access-token'] = res.user.token;
                module.exports.loginData.idu = res.user.idu;
            }
        }
        catch(err){
            console.log(err);
        }
    },
    isLogged: () => {
        if(module.exports.loginData.token){
            //console.log('logged')
            return true;
        }
        return false;
    },
    createFolder: async (name) => {
        try{
            let exists = await module.exports.folderExists(name);
            if(!exists && name.trim()){
                let content = {folder: name, parent: module.exports.folderData.animeFolder, user: module.exports.loginData.idu};
                let options = {
                    url: 'http://localhost:3000/omegafilesAPI/files/addFolder',
                };
                let test = await axios.post(options.url, content);
                let res = test.data;
                if(res && res.folder){
                    console.log('OmegaFiles Folder Created: ' + name);
                    await module.exports.getFolders();
                }
            }
        }
        catch(err){
            console.log(err);

        }
    },
    folderExists: async (name) => {
        try{
            await module.exports.getFolders();
            for (const folder of module.exports.folderData.animesubFolders) {
                if(folder.nombre == name){
                    console.log("Folder: " + name + " already exists")
                    return true;
                }
            }
            console.log("Folder: " + name + " does not exist")
            return false;
        }
        catch(err){
            console.log(err);
        }
    },
    getFolders: async () => {
        try{
            let options = {
                url: 'http://localhost:3000/omegafilesAPI/files/getFolders/' + module.exports.folderData.animeFolder + '/' + module.exports.loginData.idu,
            };
            let test = await axios.get(options.url);
            let res = test.data;
            if(res && res.folders){
                module.exports.folderData.animesubFolders = res.folders;
                //console.log(res.folders);
            }
        }
        catch(err){
            console.log(err);
        }
    },
    getFolder: async (name) => {
        await module.exports.getFolders();
        console.log('checking folder: ' + name)
        console.log(module.exports.folderData.animesubFolders)
        for (const folder of module.exports.folderData.animesubFolders) {
            if(name == folder.nombre){
                return folder;
            }
        }
        return null;
    }
}

module.exports = uploader;