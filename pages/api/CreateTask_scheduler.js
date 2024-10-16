//创建定时任务

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { downloadAndUploadvideo, getSignedUrl } from "@/lib/s3";
const { CloudTasksClient } = require('@google-cloud/tasks');
const { CloudSchedulerClient } = require('@google-cloud/scheduler');

const client = new CloudTasksClient();
const scheduler = new CloudSchedulerClient();

export default async function handler(req, res) {
    const project = 'civil-zodiac-422613-b7';
    const location = 'us-central1';
    const timeZone = 'Asia/Shanghai';
    const url = 'https://test1-container-omqcnm4zaq-uc.a.run.app/scrape';
    
    const payload = JSON.stringify({
        sortedData: req.body.sortedData,
        row: req.body.row,
        task_name: req.body.row.task_name,
        leixing: req.body.leixing,
        adsPowerUserId: req.body.adsPowerUserId
    });

    try {
        // 创建或更新早上7点的定时任务
        await createOrUpdateScheduledJob(project, location, 'morning_task', '0 7 * * *', timeZone, url, payload);
        
        // 创建或更新晚上5点的定时任务
        await createOrUpdateScheduledJob(project, location, 'evening_task', '0 17 * * *', timeZone, url, payload);

        res.status(200).json({ message: '定时任务已创建或更新' });
    } catch (error) {
        console.error('创建或更新定时任务时出错:', error);
        res.status(500).json({ error: '创建或更新定时任务失败', details: error.message });
    }
}

async function createOrUpdateScheduledJob(project, location, name, schedule, timeZone, url, payload) {
    const jobName = scheduler.jobPath(project, location, name);

    const job = {
        httpTarget: {
            uri: url,
            httpMethod: 'POST',
            body: Buffer.from(payload).toString('base64'),
            headers: {
                'Content-Type': 'application/json',
            },
        },
        schedule: schedule,
        timeZone: timeZone,
        name: jobName,
    };

    try {
        // 尝试获取现有任务
        await scheduler.getJob({name: jobName});
        
        // 如果任务存在，则更新
        const updateRequest = {
            job: job,
        };
        const [response] = await scheduler.updateJob(updateRequest);
        console.log(`更新定时任务: ${response.name}`);
    } catch (error) {
        // 如果任务不存在，则创建新任务
        if (error.code === 5) { // 5 表示 NOT_FOUND
            const createRequest = {
                parent: scheduler.locationPath(project, location),
                job: job,
            };
            const [response] = await scheduler.createJob(createRequest);
            console.log(`创建定时任务: ${response.name}`);
        } else {
            // 如果是其他错误，则抛出
            throw error;
        }
    }
}





