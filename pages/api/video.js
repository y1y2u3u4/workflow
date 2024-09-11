// api/video.js
import fs from 'fs';
import path from 'path';

export default (req, res) => {
    const videoFilePath = path.resolve(__dirname, 'screencast.mov');
    const videoFileStream = fs.createReadStream(videoFilePath);
    videoFileStream.on('data', (chunk) => {
        console.log(chunk);
    });
    res.setHeader('Content-Type', 'video/mov');
    res.setHeader('Content-Length', fs.statSync(videoFilePath).size);
    videoFileStream.pipe(res);
};
