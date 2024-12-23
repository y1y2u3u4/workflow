
//亚马逊刊登任务

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
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
    const task_name = req.body.task_name;
    const adsPowerUserId = req.body.adsPowerUserId;

    const leixing = req.body.leixing;
    const project = 'civil-zodiac-422613-b7';
    const location = 'us-central1';


    // const queue = 'smartworkflow-5';
    // const url = req.body.url;
    // const payload = JSON.stringify({ sortedData, row, task_name, leixing, adsPowerUserId });
    // const inSeconds = 180;
    //爬虫任务 url 及队列
    const queue = 'smartworkflow-1';
    // const queue = 'smartworkflow-5';
    const url = 'https://test1-container-1-omqcnm4zaq-uc.a.run.app/scrape/';
    // const url = 'https://fdc8e6f3a8b4.ngrok.app/scrape/';
    const adsPowerId = '34.56.235.19';
    const payload = JSON.stringify({ sortedData, row, task_name, leixing, adsPowerUserId, adsPowerId });
    const inSeconds = 180;

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



