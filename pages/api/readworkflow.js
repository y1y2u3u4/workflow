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

    const folderPath = path.join(process.cwd(), 'data');

    const folders = fs.readdirSync(folderPath).filter(file => {
        return fs.statSync(path.join(folderPath, file)).isDirectory();
    });

    const result = folders.map(folder => {
        const files = fs.readdirSync(path.join(folderPath, folder));
        let excelRows = 0;
        let statsTrueRowCount = 0;
        let jsonRows = 0;


        files.forEach(file => {
            const filePath = path.join(folderPath, folder, file);
            let fileName = 'data.xlsx';
            if (fs.existsSync(path.join(folderPath, folder, 'data_renew.xlsx'))) {
                fileName = 'data_renew.xlsx';
            }
            if (file === fileName) {
                const workbook = xlsx.readFile(filePath);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const excelData = xlsx.utils.sheet_to_json(worksheet);
                const statsTrueRows = excelData.filter(row => row.stats === true);
                excelRows = excelData.length;
                statsTrueRowCount = statsTrueRows.length;
            } else if (file === 'data.json') {
                const jsonData = fs.readFileSync(filePath, 'utf-8');
                const jsonObject = JSON.parse(jsonData);
                jsonRows = Object.keys(jsonObject).length;
            }
        });

        return {
            WorkflowName:folder,
            WorkflowCount: excelRows,
            SuccessfulCount: statsTrueRowCount,
            WorkflowStep: jsonRows

        };
    });

    res.json({ result:result,message: 'Workflow read successfully' });
}



