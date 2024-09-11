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
As a senior operator with 5 years of Amazon operation experience, you are not only proficient in Amazon's search traffic logic, but also proficient in English and familiar with the language habits of American locals, so you can attract customers by optimizing product titles, search keywords and five points.

Please output a new product title based on the following product information, and a set of five points that meet Amazon's requirements, that is, five selling points of the product.
Title requirements:
1. Title structure: core keywords + long tail keywords + product characteristics or application scenarios;
2. Number of characters: 150-180;

Five requirements:
1. Must write 5 core product features;
2. Number of characters per point: about 300 characters;
3. Each point prefix must contain a condensed subheading, enclosed in brackets;
4. All product information must be referred to, and each point must contain 1-2 core keywords;

Brand words are prohibited;

All answers in English.
  `;
    const sortedData = req.body.sortedData;
    const row = req.body.row;
    const sku = req.body.row.sku.toString();
    const userinput = req.body.row.标题和五点;
    const task_name = req.body.task_name;
    console.log('userinput:', userinput);
    console.log('sku:', sku);
    console.log('prompt:', prompt);
    const project = 'civil-zodiac-422613-b7';
    const queue = 'smartworkflow';
    const location = 'us-central1';
    const url = 'https://aivideo-container-omqcnm4zaq-uc.a.run.app/generate/';
    const payload = JSON.stringify({ prompt, userinput, sku });
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



