import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { downloadAndUploadvideo, getSignedUrl } from "@/lib/s3";
const { CloudTasksClient } = require('@google-cloud/tasks');

const client = new CloudTasksClient();

export default async function handler(req, res) {
    // TODO(developer): Uncomment these lines and replace with your values.
    const prompt = `
As a senior operator with 5 years of experience in Amazon operations, you are not only proficient in Amazon's search traffic logic, but also proficient in English and familiar with the language habits of American locals, so you can promote sales by optimizing product titles and five points.

Please output a new product title based on the following product information, and a set of five points.

Title requirements:
1. Title structure: core keywords + long tail keywords + product characteristics or application scenarios;
You can refer to popular title formats, such as: "massage ball,  360 Degrees Rotation Mountable Massage Ball,Wall Mountable Suction Cup Muscle Massage Ball,Wall Massage Roller with  Manual Suction Cup for Relieve Muscle and Joint Pain Relax Full Body”
2. Number of characters: 150-180 characters;
3. Do not use special characters, such as: /,,, and. , -, &,
4. Avoid repeating brand names.

Five points, the five selling points of the product, reply to the request:
Idea reference: who will buy or use this product, in what scenario; Put yourself in the customer's shoes and highlight how the product solves their problem or meets their needs.
Requirements:
1. Must write 5 core features of the product, the more can attract customers to place orders the more forward the selling point;
2. Number of characters per point: about 300 characters;
3. Each point prefix must contain a condensed subheading, enclosed in brackets;
4. All product information must be referred to, and each point must contain 1-2 core keywords;
5. Prohibit brand words;

All answers in English.
  `;

//     const prompt = `
// Please translate the following product information
// 1. language of translation: Russian;
// 6. exclusion of the words [Yuexinghui], (Unprocessed Intellectual Property), [Ande Online], (Authorization), (Southeast Asian Monopoly), (Mexican Monopoly);

// The use of brand words is prohibited;
// Output content must be in Russian.
//   `;
    const sortedData = req.body.sortedData;
    const row = req.body.row;
    const sku = req.body.row.sku单品分组.toString();
    const userinput = req.body.row.标题和五点参考文案;
    const taskname = 'ama_keyword_1101';
    console.log('userinput:', userinput);
    console.log('sku:', sku);
    console.log('prompt:', prompt);
    const project = 'civil-zodiac-422613-b7';
    const queue = 'smartworkflow';
    const location = 'us-central1';
    const url = 'https://aivideo-container-omqcnm4zaq-uc.a.run.app/generate/';
    const payload = JSON.stringify({ prompt, userinput, sku, taskname });
    // const inSeconds = 180;

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    const task = {
        httpRequest: {
            headers: {
                'Content-Type': 'application/json', // Set content type to ensure compatibility your application's request parsing
            },
            httpMethod: 'POST',
            url,
        },
    };

    if (payload) {
        task.httpRequest.body = Buffer.from(payload).toString('base64');
    }

    // if (inSeconds) {
    //     // The time when the task is scheduled to be attempted.
    //     task.scheduleTime = {
    //         seconds: parseInt(inSeconds) + Date.now() / 1000,
    //     };
    // }

    // Send create task request.
    console.log('Sending task:');
    console.log(task);
    const request = { parent: parent, task: task };
    const [response] = await client.createTask(request);
    console.log(`Created task ${response.name}`);
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ message: 'Task created' }));
}



