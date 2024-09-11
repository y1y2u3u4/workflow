import AWS from "aws-sdk";
import { Readable } from "stream";
import axios from "axios";
// import fs from "fs";

console.log("AWS_AK", process.env.AWS_AK);
console.log("AWS_SK", process.env.AWS_SK);
AWS.config.update({
    accessKeyId: process.env.AWS_AK,
    secretAccessKey: process.env.AWS_SK,
});

const s3 = new AWS.S3();

export async function getSignedUrl(bucket: string, key: string) {
    return new Promise<string>((resolve, reject) => {
        const params = {
            Bucket: bucket,
            Key: key,
            Expires: 60 * 60, // URL 的有效期（秒）
        };

        s3.getSignedUrl('getObject', params, function (err, url) {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}

export async function downloadAndUploadvideo(
    buffer: Buffer,
    s3Key: string
) {
    try {
        // const response = await axios({
        //   method: "GET",
        //   url: audioUrl,
        //   responseType: "stream",
        // });

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET || "trysai",
            Key: s3Key,
            Body: buffer,
            // ContentType: 'video/mp4',
            ContentType: 'image/gif', 
        };

        return s3.upload(uploadParams).promise();
    } catch (e) {
        console.log("upload failed:", e);
        throw e;
    }
}

export async function downloadAndUploadImage(
    imageUrl: string,
    bucketName: string,
    s3Key: string
) {
    try {
        const response = await axios({
            method: "GET",
            url: imageUrl,
            responseType: "stream",
        });

        const uploadParams = {
            Bucket: bucketName,
            Key: s3Key,
            Body: response.data as Readable,
        };

        return s3.upload(uploadParams).promise();
    } catch (e) {
        console.log("upload failed:", e);
        throw e;
    }
}

// export async function downloadImage(imageUrl: string, outputPath: string) {
//   try {
//     const response = await axios({
//       method: "GET",
//       url: imageUrl,
//       responseType: "stream",
//     });

//     return new Promise((resolve, reject) => {
//       const writer = fs.createWriteStream(outputPath);
//       response.data.pipe(writer);

//       let error: Error | null = null;
//       writer.on("error", (err) => {
//         error = err;
//         writer.close();
//         reject(err);
//       });

//       writer.on("close", () => {
//         if (!error) {
//           resolve(null);
//         }
//       });
//     });
//   } catch (e) {
//     console.log("upload failed:", e);
//     throw e;
//   }
// }
