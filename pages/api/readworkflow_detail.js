import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { downloadAndUploadvideo, getSignedUrl } from "@/lib/s3";
const { writeFileSync } = require('fs');
const { Workbook } = require('exceljs');
import xlsx from 'xlsx';

export default async function handler(req, res) {
    const { cellValue } = req.body;
    console.log('cellValue:', cellValue);
    const folderPath = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(path.join(folderPath, cellValue));
    console.log('files:', files);
    let result = {
        WorkflowName: cellValue,
        WorkflowCount: 0,
        SuccessfulCount: 0,
        WorkflowStep: 0,
        excelData: {},
        falseTrueRows: {},
        jsonObject: {}
    };
    files.forEach(file => {
        const filePath = path.join(folderPath, cellValue, file);
        if (file === 'data.xlsx') {
            const workbook = xlsx.readFile(filePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            result.excelData = xlsx.utils.sheet_to_json(worksheet);
            const statsTrueRows = result.excelData.filter(row => row.status === "成功执行");
            result.falseTrueRows = result.excelData.filter(row => row.status !== "成功执行");
            result.WorkflowCount = result.excelData.length;
            result.SuccessfulCount = statsTrueRows.length;
        } else if (file === 'data.json') {
            const jsonData = fs.readFileSync(filePath, 'utf-8');
            result.jsonObject = JSON.parse(jsonData);
            result.WorkflowStep = Object.keys(result.jsonObject).length;
        }
    });

    res.json({ result:result,message: 'Workflowdetail readdetail successfully' });
}



