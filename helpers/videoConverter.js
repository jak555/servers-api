const execSync = require('child_process').execSync;
const folderValidations = require('./folderValidations');
const fs = require('fs');
//const exec = require('child_process')
let videoConverter = {
    convertLinuxCPU: async (video) => {
        let nd = await module.exports.getVideoInfo(video);

        let infoVideo = await module.exports.parseResultVI(nd.toString());
        let audios = await module.exports.getObjectType(infoVideo, "audio");
        let subtitles = await module.exports.getObjectType(infoVideo, "subtitle");
        let videoData = await module.exports.getObjectType(infoVideo, "video");
        let fonts = await module.exports.getObjectType(infoVideo, "attachment");
        let audioCodec = 'aac';
        let videoCodec = 'libx264';
        //let desiredSizes = ['800M', '500M', '250M', '180M', '80M'];
        //let desiredSize = await module.exports.getSize(video);
        let formats = '';

        //console.log(fonts);
        

        /*
        if(videoData[0] && videoData[0].codec_name == 'h264'){
            videoCodec = 'copy';
            formats = '';
        }
        */
       
       console.log('printing')
       console.log(video);
       let destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded).replace(".mkv", ".mp4").replace(".avi", ".mp4").replace(".ogm", ".mp4");
        if(video.indexOf('/Movies/') == -1){
            let segments = video.split('/');
            let fileName = segments[segments.length - 1];
            let folderName = segments[segments.length - 2];
            destiny = folderValidations.folders.encoded + folderName + '/' +  fileName.replace(".mkv", ".mp4").replace(".avi", ".mp4").replace(".ogm", ".mp4");
        }
        
        
        let urlParts = destiny.split('/');
        let videoName = urlParts[urlParts.length -1];
        let videoDest = destiny.replace(videoName, '');
        await folderValidations.createFolderN(videoDest);
        let command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -c:a aac -crf 25 "${destiny}" -hide_banner -loglevel error`
        

        if(audios.length > 1 || subtitles.length > 1){
            for(let i = 0; i < audios.length; i++){
                let audio = audios[i];
                let lang = audio.tags.language;
                console.log("Audio name:" + lang);
                if(audio.codec_name == "aac"){
                    audioCodec = "copy"
                }
                else{
                    audioCodec = "aac"
                }
                if(audio && (lang == "jp" || lang == "jap" || lang == "jpn" || lang == "ja" || lang == "japanese" || lang == "japones" || lang == "japonés" || lang == "und" || lang == "undefined" || lang == undefined)){
                    console.log("enters here")
                    for(let j = 0; j < subtitles.length; j++){
                        let subtitle = subtitles[j];
                        let subLang = subtitle.tags.language;
                        destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                        destiny += `[${lang} - ${subLang}]`;
                        destiny += ".mp4";
                        if(!fs.existsSync(destiny)){
                            if(fonts){
                                console.log('there are fonts')
                                await module.exports.extractFonts(fonts, folderValidations.folders.toEncode, video);
                            }
                            if(videoCodec != 'copy'){
                                formats = '-map 0:v:0';
                            }
                            command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} -c:s:0 mov_text -vf "subtitles='${video}':stream_index=${j}[v]" "${destiny}" -hide_banner -loglevel error`;
                            if(!subtitle.codec_name.includes("hdmv_pgs_subtitle") && !subtitle.codec_name.includes("pgs")){
                                //command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" -vf "format=nv12,hwupload" -map 0:v:0 -c:v hevc_vaapi -crf 25 -map 0:a:${i} -c:a ac3 -map 0:s:${j} -c:s:0 copy "${destiny}"`;
                                await module.exports.encodeVideo(command, video);
                            }
                            
                        }
                    }
                }
                else {
                    destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                    destiny += `[${lang}]`;
                    destiny += ".mp4";
                    if(!fs.existsSync(destiny)){
                        if(fonts){
                            console.log('there are fonts')
                            await module.exports.extractFonts(fonts, folderValidations.folders.toEncode, video);
                        }
                        if(videoCodec != 'copy'){
                            formats = '-map 0:v:0';
                        }
                        command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} "${destiny}" -hide_banner -loglevel error`;
                        await module.exports.encodeVideo(command, video);
                    }
                }
            }
        }
        else{
            console.log(await module.exports.hasSubtitles(video).toString())
            if(video.includes(".mkv") && await module.exports.hasSubtitles(video) == 0){
                if(videoCodec != 'copy'){
                    formats = '-map 0:v:0';
                }
                command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -crf 22 -map 0:a:0 -c:a ${audioCodec} -c:s:0 mov_text -vf "subtitles='${video}':stream_index=0[v]" "${destiny}" -hide_banner -loglevel error`;
                //console.log(command)
            }
            if(!fs.existsSync(destiny)){
                if(fonts){
                    console.log('there are fonts')
                    await module.exports.extractFonts(fonts, folderValidations.folders.toEncode, video);
                }
                await module.exports.encodeVideo(command, video);
            }
        }
        
        return;
    },
    convertWindowsCPU: async () => {},
    convertLinuxGPU: async (video) => {
        let nd = await module.exports.getVideoInfo(video);
        let infoVideo = await module.exports.parseResultVI(nd.toString());

        let audios = await module.exports.getObjectType(infoVideo, "audio");
        let subtitles = await module.exports.getObjectType(infoVideo, "subtitle");
        let videoData = await module.exports.getObjectType(infoVideo, "video");
        let audioCodec = 'aac';
        let videoCodec = 'h264_vaapi';
        //let desiredSizes = ['800M', '500M', '250M', '180M', '80M'];
        let desiredSize = await module.exports.getSize(video);
        let formats = '-vf "format=nv12,hwupload"';

        /*
        if(videoData[0] && videoData[0].codec_name == 'h264'){
            videoCodec = 'copy';
            formats = '';
        }
        */

        let destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded).replace(".mkv", ".mp4").replace(".avi", ".mp4").replace(".ogm", ".mp4");
        
        let command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -c:a aac -crf 25 "${destiny}" -hide_banner -loglevel error`
        

        if(audios.length > 1 || subtitles.length > 1){
            for(let i = 0; i < audios.length; i++){
                let audio = audios[i];
                let lang = audio.tags.language;
                if(audio.codec_name == "aac"){
                    audioCodec = "copy"
                }
                else{
                    audioCodec = "aac"
                }
                if(audio && (lang == "jp" || lang == "jap" || lang == "jpn" || lang == "ja" || lang == "japanese" || lang == "japones" || lang == "japonés")){
                    for(let j = 0; j < subtitles.length; j++){
                        let subtitle = subtitles[j];
                        let subLang = subtitle.tags.language;
                        destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                        destiny += `[${lang} - ${subLang}]`;
                        destiny += ".mp4";
                        if(!fs.existsSync(destiny)){
                            if(videoCodec != 'copy'){
                                formats = '-vf "format=nv12,hwupload" -map 0:v:0';
                            }
                            command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} -map 0:s:${j} -c:s:0 mov_text "${destiny}" -hide_banner -loglevel error`;
                            if(!subtitle.codec_name.includes("hdmv_pgs_subtitle") && !subtitle.codec_name.includes("pgs")){
                                //command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" -vf "format=nv12,hwupload" -map 0:v:0 -c:v hevc_vaapi -crf 25 -map 0:a:${i} -c:a ac3 -map 0:s:${j} -c:s:0 copy "${destiny}"`;
                                await module.exports.encodeVideo(command, video);
                            }
                            
                        }
                    }
                }
                else {
                    //for(let j = 0; j < subtitles.length; j++){
                        //let subtitle = subtitles[j];
                        //let subLang = subtitle.tags.language;
                        destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                        destiny += `[${lang}]`;
                        destiny += ".mp4";
                        if(!fs.existsSync(destiny)){
                            if(videoCodec != 'copy'){
                                formats = '-vf "format=nv12,hwupload" -map 0:v:0';
                            }
                            command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} "${destiny}" -hide_banner -loglevel error`;
                            await module.exports.encodeVideo(command, video);
                        }
                        
                    //}
                }
            }
        }
        else{
            
            console.log(await module.exports.hasSubtitles(video).toString())
            if(video.includes(".mkv") && await module.exports.hasSubtitles(video) == 0){
                if(videoCodec != 'copy'){
                    formats = '-vf "format=nv12,hwupload" -map 0:v:0';
                }
                command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:0 -c:a ${audioCodec} -map 0:s:0 -c:s:0 mov_text "${destiny}" -hide_banner -loglevel error`;
                //console.log(command)
            }
            if(!fs.existsSync(destiny)){
                await module.exports.encodeVideo(command, video);
            }
        }
        
        return;
    },
    convertWindowsGPU: async () => {},
    encodeVideo: async (command, video) => {
        console.log(command);
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
    getVideoInfo: async (video) => {
        //let command = `ffprobe -v error -print_format json -show_entries stream=index,codec_name,codec_type,width,height,index:stream_tags=language,name  "${video}"`
        let command = `ffprobe -v error -print_format json -show_entries stream "${video}"`
        
        return execSync(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                return null;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return null;
            }
            //console.log(`stdout: ${stdout}`);
            return stdout;
        });
    },
    hasSubtitles: async (video) => {
        let command = `ffmpeg -i "${video}" -c copy -map 0:s:0 -frames:s 1 -f null - -v 0 -hide_banner; echo $?`;
        return execSync(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                return 1;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return 1;
            }
            //console.log(`stdout: ${stdout.toString()}`);
            return 0;
        });
    },
    getObjectType: async (obj, type) => {
        let streams = obj.streams;
        let res = streams.filter(x => x.codec_type == type);
        //console.log(res);
        return res;
    },
    getVideoSize: async () => {},
    getVideoDuration: async () => {},
    convert: async () => {},
    parseResultVI: async (toParse) => {
        let no = JSON.parse(toParse);
        //console.log(no);
        return no;
    },
    cFile: async (video) => {
        let destiny = video.replace(folderValidations.folders.toEncode, folderValidations.folders.encoded);
        fs.copyFileSync(video, destiny);
    },
    extractFonts: async (fonts, folder, file) => {
        //console.log('extracting fonts')
        //console.log(fonts.length)
        let i = 0;
        if(fonts.length > 0){
        for (const font of fonts) {
            //console.log(font.tags.filename)
            console.log((i + 1) + ' of ' + fonts.length)
            //const font = fonts[i];
            //console.log('Checking font: ' + font);
            if(font.tags.mimetype == 'font/ttf' || font.tags.mimetype == 'font/otf'){
                //console.log(font)
                let ff = `${folder}fonts/${font.tags.filename}`;
                console.log('Font detected: '+ ff);
                
                //console.log('extracting font:' + ff)
                let ex = await folderValidations.exists(ff);
                if(!ex){
                    //console.log('font:' + ff +' does not exist')

                    //let command = `ffmpeg -dump_attachment:t:${i} "${ff}" -i "${file}" `;
                    await module.exports.retrieveFont(file, i, ff);
                }
                
            }
            i++;
        }
        await module.exports.installFonts();
        }
        /*
        for (let i = 0; i < fonts.length; i++) {
            //console.log('checkpoint 1')
            console.log(i + ' of ' + fonts.length)
            const font = fonts[i];
            console.log('Checking font: ' + font);
            if(font.tags.mimetype == 'font/ttf' || font.tags.mimetype == 'font/otf'){
                //console.log(font)
                let ff = `${folder}fonts/${font.tags.filename}`;
                console.log('Font detected: '+ ff);
                
                console.log('extracting font:' + ff)
                //let ex = await folderValidations.exists(ff);
                //if(!ex){
                    //console.log('font:' + ff +' does not exist')

                    //let command = `ffmpeg -dump_attachment:t:${i} "${ff}" -i "${file}" `;
                    let command = `mkvextract attachments "${file}" ${i + 1}:"${ff}"`;
                    console.log(command)
                    return execSync(command, (error, stdout, stderr) => {
                        
                        if (error) {
                            console.log(command)
                            console.error(`error: ${error.message}`);
                            return 1;
                        }
                        if (stderr) {
                            console.log(command)
                            console.error(`stderr: ${stderr}`);
                            return 1;
                        }
                        
                        console.log(`stdout: ${stdout.toString()}`);
                        console.log(`file: ${ff} has been extracted`);
                        return 0;
                    });
                //}
                
            }
        }
        */
        /*
        for (const font of fonts) {
            if(font.codec_name == 'ttf' || font.codec_name == 'otf'){

            }
        }
        */
    },
    retrieveFont: async (file, i, ff) => {
        let command = `mkvextract attachments "${file}" ${i + 1}:"${ff}"`;
        console.log(command)
        return execSync(command, (error, stdout, stderr) => {
            
            if (error) {
                console.log(command)
                console.error(`error: ${error.message}`);
                return 1;
            }
            if (stderr) {
                console.log(command)
                console.error(`stderr: ${stderr}`);
                return 1;
            }
            
            console.log(`stdout: ${stdout.toString()}`);
            console.log(`file: ${ff} has been extracted`);
            return 0;
        });
    },
    installFonts: async () => {
        let command1 = 'cp /mnt/pve/DownloadsStorage/ToEncode/fonts/* /usr/share/fonts/';
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
    }

}

module.exports = videoConverter
