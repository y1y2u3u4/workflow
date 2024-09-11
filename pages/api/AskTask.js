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
    const taskId = req.body.taskId; // 从请求中获取任务名称
    console.log('taskId:', taskId);
    const project = 'civil-zodiac-422613-b7';
    const queue = 'smartworkflow';
    const location = 'us-central1';
   


    try {
        const fullTaskName = client.taskPath(project, location, queue, taskId);
        const [task] = await client.getTask({ name: fullTaskName });
        if (task && task.state) {
            console.log('task.state:', task.state);
            res.status(200).json({ status: task.state });
        } else {
            console.log('任务状态未定义或任务不存在');
            res.status(200).json({ status: 'UNKNOWN', message: '任务状态未知或任务不存在' });
        }
    } catch (error) {
        console.error('获取任务时出错:', error);
        if (error.code === 5 && error.details.includes('The task no longer exists')) {
            console.log('任务已完成或被删除');
            res.status(200).json({ status: 'COMPLETED_OR_DELETED', message: '任务可能已完成或被删除' });
        } else {
            console.error('未知错误:', error);
            res.status(500).json({ status: 'ERROR', error: '获取任务状态失败', details: error.message });
        }
    }
}