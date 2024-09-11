import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { downloadAndUploadvideo, getSignedUrl } from "@/lib/s3";
const { CloudTasksClient } = require('@google-cloud/tasks');
import { GoogleAuth } from 'google-auth-library';

// 在函数开始时添加以下代码
const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

// 使用这个 auth 实例创建 CloudTasksClient
const client = new CloudTasksClient({ auth });


export default async function handler(req, res) {
    // TODO(developer): Uncomment these lines and replace with your values.
    const sku = req.body.sku.toString();
    const userinput = req.body.user_input;
    const prompt = req.body.description;
    const taskname = req.body.taskname;
    console.log('userinput:', userinput);
    console.log('sku:', sku);
    console.log('prompt:', prompt);
    console.log('taskname:', taskname);
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
    const taskId = response.name.split('/').pop();
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ message: 'Task created', taskId: taskId }));
}



