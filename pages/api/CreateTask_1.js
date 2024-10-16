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
Please judge whether headings 1 and 2 are similar products, both of which are in Russian; If it is the same style reply "Y", if it is not the same style reply "N";
How to determine whether Title 1 and Title 2 are the same? Please refer to the following examples:
1. If the two headings belong to the umbrella, but are different colors, then the two headings belong to the same paragraph;
2. If one of the two titles is umbrella, the other is rain shoes, then the two titles are not the same;
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
    const sku = req.body.row.sku.toString();
    const userinput = req.body.row.中文标题;
    const taskname = 'ozon_match_1016';
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



