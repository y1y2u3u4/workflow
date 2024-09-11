import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { downloadAndUploadvideo, getSignedUrl } from "@/lib/s3";
const { writeFileSync } = require('fs');
const { Workbook } = require('exceljs');

export default async function handler(req, res) {
    
    const { workflowName, excelData, sortedData} = req.body;
    console.log('excelData:', excelData); 

    // 创建文件夹
    console.log('workflowName:', workflowName);

    const folderPath = path.join(process.cwd(), 'data', workflowName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const dataToWrite = sortedData;

    // 将 dataToWrite 保存为 JSON 文件
    writeFileSync(path.join(folderPath, 'data.json'), JSON.stringify(dataToWrite));
    // 创建一个新的 Excel 工作簿
    const workbook = new Workbook();

    // 添加一个新的工作表
    const worksheet = workbook.addWorksheet('My Sheet');

    // 将 excelData_final 写入工作表
    worksheet.addRows(excelData);
    // 将工作簿保存为 Excel 文件
    await workbook.xlsx.writeFile(path.join(folderPath, 'data.xlsx'));

    res.json({ message: 'Workflow created successfully' });
}



