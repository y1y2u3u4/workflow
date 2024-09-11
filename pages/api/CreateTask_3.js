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
    const sortedData = req.body.sortedData;
    const row = req.body.row;
    const clientId = req.body.row.clientId.toString();
    const apiKey = req.body.row.apiKey.toString();
    const offer_id = req.body.row.货号.toString();
    const url_video = req.body.row.视频链接.toString();
    const task_name = req.body.task_name;
    console.log('offer_id:', offer_id);
    console.log('url_video:', url_video);
    const project = 'civil-zodiac-422613-b7';
    const queue = 'smartworkflow';
    const location = 'us-central1';
    const urls = [
        'https://api-seller.ozon.ru/v1/product/attributes/update',
    ];
    const url = urls[Math.floor(Math.random() * urls.length)];
    // const url = 'https://aivideo-container-omqcnm4zaq-uc.a.run.app/process_picture/';

    const data = {
        items: [
            {
                attributes: [
                    {
                        complex_id: 100002,
                        id: 21845,
                        values: [
                            {
                                dictionary_value_id: 0,
                                value: url_video
                            }
                        ]
                    }
                ],
                offer_id: offer_id
            }
        ]
    };
    const payload = JSON.stringify(data);
    // const inSeconds = 180;

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    const task = {
        httpRequest: {
            headers: {
                'Client-Id': clientId,
                'Api-Key': apiKey,
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
    console.log(response);
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ message: 'Task created', response: response }));
}



