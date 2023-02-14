let videoConverter = {
    convertLinuxCPU: async (video) => {
        let infoVideo = module.exports.parseResultVI(getVideoInfo(video).toString());
        let audios = module.exports.getObjectType(infoVideo, "audio");
        let subtitles = module.exports.getObjectType(infoVideo, "subtitle");
        let videoData = module.exports.getObjectType(infoVideo, "video");
        let audioCodec = 'aac';
        let videoCodec = 'libx264';
        //let desiredSizes = ['800M', '500M', '250M', '180M', '80M'];
        let desiredSize = module.exports.getSize(video);
        let formats = '';

        /*
        if(videoData[0] && videoData[0].codec_name == 'h264'){
            videoCodec = 'copy';
            formats = '';
        }
        */

        let destiny = video.replace(toEncodeFolder, encodedFolder).replace(".mkv", ".mp4").replace(".avi", ".mp4").replace(".ogm", ".mp4");
        
        let command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -c:a aac -crf 25 "${destiny}" -hide_banner -loglevel error`
        

        if(audios.length > 1 || subtitles.length > 1){
            for(let i = 0; i < audios.length; i++){
                let audio = audios[i];
                let lang = audio.tags.language;
                if(audio.codec_name == "aac"){
                    audioCodec = "copy"
                }
                if(audio && (lang == "jp" || lang == "jap" || lang == "jpn" || lang == "ja" || lang == "japanese" || lang == "japones" || lang == "japonés")){
                    for(let j = 0; j < subtitles.length; j++){
                        let subtitle = subtitles[j];
                        let subLang = subtitle.tags.language;
                        destiny = video.replace(toEncodeFolder, encodedFolder).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                        destiny += `[${lang} - ${subLang}]`;
                        destiny += ".mp4";
                        if(!fs.existsSync(destiny)){
                            if(videoCodec != 'copy'){
                                formats = '-map 0:v:0';
                            }
                            command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} -map 0:s:${j} -c:s:0 mov_text "${destiny}" -hide_banner -loglevel error`;
                            if(!subtitle.codec_name.includes("hdmv_pgs_subtitle") && !subtitle.codec_name.includes("pgs")){
                                //command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" -vf "format=nv12,hwupload" -map 0:v:0 -c:v hevc_vaapi -crf 25 -map 0:a:${i} -c:a ac3 -map 0:s:${j} -c:s:0 copy "${destiny}"`;
                                module.exports.encodeVideo(command);
                            }
                            
                        }
                    }
                }
                else {
                    destiny = video.replace(toEncodeFolder, encodedFolder).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                    destiny += `[${lang}]`;
                    destiny += ".mp4";
                    if(!fs.existsSync(destiny)){
                        if(videoCodec != 'copy'){
                            formats = '-map 0:v:0';
                        }
                        command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} "${destiny}" -hide_banner -loglevel error`;
                        module.exports.encodeVideo(command);
                    }
                }
            }
        }
        else{
            console.log(module.exports.hasSubtitles(video).toString())
            if(video.includes(".mkv") && module.exports.hasSubtitles(video) == 0){
                if(videoCodec != 'copy'){
                    formats = '-map 0:v:0';
                }
                command = `ffmpeg -i "${video}" ${formats} -c:v ${videoCodec} -crf 22 -map 0:a:0 -c:a ${audioCodec} -map 0:s:0 -c:s:0 mov_text "${destiny}" -hide_banner -loglevel error`;
                //console.log(command)
            }
            if(!fs.existsSync(destiny)){
                module.exports.encodeVideo(command);
            }
        }
        
        return;
    },
    convertWindowsCPU: async () => {},
    convertLinuxGPU: async (video) => {
        let infoVideo = module.exports.parseResultVI(getVideoInfo(video).toString());

        let audios = module.exports.getObjectType(infoVideo, "audio");
        let subtitles = module.exports.getObjectType(infoVideo, "subtitle");
        let videoData = module.exports.getObjectType(infoVideo, "video");
        let audioCodec = 'aac';
        let videoCodec = 'h264_vaapi';
        //let desiredSizes = ['800M', '500M', '250M', '180M', '80M'];
        let desiredSize = module.exports.getSize(video);
        let formats = '-vf "format=nv12,hwupload"';

        /*
        if(videoData[0] && videoData[0].codec_name == 'h264'){
            videoCodec = 'copy';
            formats = '';
        }
        */

        let destiny = video.replace(toEncodeFolder, encodedFolder).replace(".mkv", ".mp4").replace(".avi", ".mp4").replace(".ogm", ".mp4");
        
        let command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -c:a aac -crf 25 "${destiny}" -hide_banner -loglevel error`
        

        if(audios.length > 1 || subtitles.length > 1){
            for(let i = 0; i < audios.length; i++){
                let audio = audios[i];
                let lang = audio.tags.language;
                if(audio.codec_name == "aac"){
                    audioCodec = "copy"
                }
                if(audio && (lang == "jp" || lang == "jap" || lang == "jpn" || lang == "ja" || lang == "japanese" || lang == "japones" || lang == "japonés")){
                    for(let j = 0; j < subtitles.length; j++){
                        let subtitle = subtitles[j];
                        let subLang = subtitle.tags.language;
                        destiny = video.replace(toEncodeFolder, encodedFolder).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                        destiny += `[${lang} - ${subLang}]`;
                        destiny += ".mp4";
                        if(!fs.existsSync(destiny)){
                            if(videoCodec != 'copy'){
                                formats = '-vf "format=nv12,hwupload" -map 0:v:0';
                            }
                            command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} -map 0:s:${j} -c:s:0 mov_text "${destiny}" -hide_banner -loglevel error`;
                            if(!subtitle.codec_name.includes("hdmv_pgs_subtitle") && !subtitle.codec_name.includes("pgs")){
                                //command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" -vf "format=nv12,hwupload" -map 0:v:0 -c:v hevc_vaapi -crf 25 -map 0:a:${i} -c:a ac3 -map 0:s:${j} -c:s:0 copy "${destiny}"`;
                                module.exports.encodeVideo(command);
                            }
                            
                        }
                    }
                }
                else {
                    //for(let j = 0; j < subtitles.length; j++){
                        //let subtitle = subtitles[j];
                        //let subLang = subtitle.tags.language;
                        destiny = video.replace(toEncodeFolder, encodedFolder).replace(".mkv", "").replace(".avi", "").replace(".ogm", "");
                        destiny += `[${lang}]`;
                        destiny += ".mp4";
                        if(!fs.existsSync(destiny)){
                            if(videoCodec != 'copy'){
                                formats = '-vf "format=nv12,hwupload" -map 0:v:0';
                            }
                            command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:${i} -c:a ${audioCodec} "${destiny}" -hide_banner -loglevel error`;
                            module.exports.encodeVideo(command);
                        }
                        
                    //}
                }
            }
        }
        else{
            
            console.log(module.exports.hasSubtitles(video).toString())
            if(video.includes(".mkv") && module.exports.hasSubtitles(video) == 0){
                if(videoCodec != 'copy'){
                    formats = '-vf "format=nv12,hwupload" -map 0:v:0';
                }
                command = `ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel_output_format vaapi -i "${video}" ${formats} -c:v ${videoCodec} -crf 25 -map 0:a:0 -c:a ${audioCodec} -map 0:s:0 -c:s:0 mov_text "${destiny}" -hide_banner -loglevel error`;
                //console.log(command)
            }
            if(!fs.existsSync(destiny)){
                module.exports.encodeVideo(command);
            }
        }
        
        return;
    },
    convertWindowsGPU: async () => {},
    encodeVideo: async (command) => {
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
            return;
        });
    },
    getVideoInfo: async (video) => {
        let command = `ffprobe -v error -print_format json -show_entries stream=index,codec_name,codec_type,width,height,index:stream_tags=language  "${video}"`
        return execSync(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                return null;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return null;
            }
            console.log(`stdout: ${stdout}`);
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
            console.log(`stdout: ${stdout.toString()}`);
            return 0;
        });
    },
    getObjectType: async (obj, type) => {
        let streams = obj.streams;
        let res = streams.filter(x => x.codec_type == type);
        console.log(res);
        return res;
    },
    getVideoSize: async () => {},
    getVideoDuration: async () => {},
    convert: async () => {},
    parseResultVI: async (toParse) => {
        let no = JSON.parse(toParse);
        console.log(no);
        return no;
    },
    cFile: async (video) => {
        let destiny = video.replace(toEncodeFolder, encodedFolder);
        fs.copyFileSync(video, destiny);
    }

}

module.exports = videoConverter
