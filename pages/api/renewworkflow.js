import fs from 'fs';
import path from 'path';
const { Workbook } = require('exceljs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// 增加请求体的大小限制为 10mb
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


export default async function handler(req, res) {
    
    const { workflowName, excelData_new} = req.body;

    // 创建文件夹
    console.log('workflowName:', workflowName);
    console.log('excelData_new:', excelData_new);

    const folderPath = path.join(process.cwd(), 'data', workflowName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    // 创建一个新的 Excel 工作簿
    const workbook = new Workbook();

    // 添加一个新的工作表
    const worksheet = workbook.addWorksheet('My Sheet');
    let allHeaders = new Set();

    function collectHeaders(data, prefix = '') {
        Object.keys(data).forEach(key => {
            const fullKey = prefix ? `${prefix}_${key}` : key;
            if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                collectHeaders(data[key], fullKey);
            } else {
                allHeaders.add(fullKey);
            }
        });
    }

    // 遍历每个对象，收集所有可能的列名称
    excelData_new.forEach(dataArray => {
        dataArray.forEach(data => {
            collectHeaders(data);
            if (data.output) {
                collectHeaders(data.output, 'output');
                if (data.output.items) {
                    data.output.items.forEach((item, index) => {
                        collectHeaders(item, `output_items_${index + 1}`);
                    });
                }
                Object.keys(data.output).forEach(key => {
                    if (key.match(/^\d+$/)) {
                        collectHeaders(data.output[key], `output_shop_${key}`);
                    }
                });
            }
        });
    });

    // 将所有列名称转换为数组
    allHeaders = Array.from(allHeaders);

    // 添加标题行
    worksheet.addRow(allHeaders);

    // 遍历每个对象，并构建数据行
    excelData_new.forEach(dataArray => {
        dataArray.forEach(data => {
            const rowData = {};

            function populateRowData(data, prefix = '') {
                Object.keys(data).forEach(key => {
                    const fullKey = prefix ? `${prefix}_${key}` : key;
                    if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                        populateRowData(data[key], fullKey);
                    } else {
                        rowData[fullKey] = data[key];
                    }
                });
            }

            populateRowData(data);
            if (data.output) {
                populateRowData(data.output, 'output');
                if (data.output.items) {
                    data.output.items.forEach((item, index) => {
                        populateRowData(item, `output_items_${index + 1}`);
                    });
                }
                Object.keys(data.output).forEach(key => {
                    if (key.match(/^\d+$/)) {
                        populateRowData(data.output[key], `output_shop_${key}`);
                    }
                });
            }

            // 添加数据行
            const row = allHeaders.map(header => rowData[header] || '');
            worksheet.addRow(row);
        });
    });


    // 将 excelData_final 写入工作表
    // worksheet.addRows(excelData_new);
    // 将工作簿保存为 Excel 文件
    await workbook.xlsx.writeFile(path.join(folderPath, 'data_renew.xlsx'));

    res.json({ message: 'Workflow created successfully' });
}



