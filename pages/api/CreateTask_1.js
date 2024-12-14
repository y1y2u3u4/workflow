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
As a senior operator with 5 years of ozon operation experience, you are not only proficient in Russian, but also proficient in OZON's search traffic logic, and familiar with the language habits of local Russian people.Please generate titles and search keywords that meet OZON's requirements based on the information you give

Product title requirements：
1.Title structure: 2-3 core keywords containing product characteristics + applicable scenarios
2. It is forbidden to repeat Russian words;
3. Number of characters: no more than 100 characters；
4. Exclude words such as [Yuexinghui], (unprocessed intellectual property rights), [Ande Online], (authorization), (Southeast Asia Monopoly), (Mexico Monopoly), etc.；

Search keyword requirements：
1. Provide keyword phrases that highly match product information, in line with the search habits and language habits of Russian consumers；
2. Search keywords must be Russian phrases；
3. Search keywords are limited to 150 characters；

All feedback content must be in Russian!！！
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
    const sku = req.body.row[0].sku单品分组.toString();
    const userinput = req.body.row[0].标题和五点参考文案;
    const taskname = 'ozon_fanyi_002';
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



