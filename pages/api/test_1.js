const ExcelJS = require('exceljs');

const excelData_new = [
    [
        {
            "名字": "巴斯顿少儿成长中心（五江店）",
            "位置": "雨花区五江生活广场3层",
            "是否是社区店": "是",
            "是否是连锁店": "是",
            "output": {
                "review_count": 120,
                "address": "雨花区五江生活广场3层",
                "phone": "123456789",
                "items": [
                    {
                        "title": "课程A",
                        "price": 100,
                        "delPrice": 90,
                        "soldCount": 50
                    },
                    {
                        "title": "课程B",
                        "price": 200,
                        "delPrice": 180,
                        "soldCount": 30
                    }
                ],
                "1": {
                    "address": "其他店铺地址1",
                    "phone": "987654321",
                    "hours": "9:00-18:00"
                },
                "2": {
                    "address": "其他店铺地址2",
                    "phone": "567891234",
                    "hours": "10:00-19:00"
                }
            },
            "status": "open"
        }
        
    ]
];

const allHeaders = new Set();

// 收集所有可能的列名称的递归函数
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
const allHeadersArray = Array.from(allHeaders);

// 创建一个新的工作簿和工作表
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');

// 添加标题行
worksheet.addRow(allHeadersArray);

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
        const row = allHeadersArray.map(header => rowData[header] || '');
        worksheet.addRow(row);
    });
});

// 写入 Excel 文件
workbook.xlsx.writeFile('output.xlsx')
    .then(() => {
        console.log('Excel 文件已成功创建！');
    })
    .catch(error => {
        console.error('创建 Excel 文件时出错：', error);
    });