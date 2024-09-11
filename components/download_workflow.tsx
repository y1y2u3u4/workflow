import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
function DownloadButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { workflowData_final } = useExcelData();
    const data = (workflowData_final || []).length > 0 ? workflowData_final : workflowData_final;

    function downloadFile(selectedData: unknown[]) {
        // 将数据转换为 JSON 格式
        const jsonData = JSON.stringify(selectedData, null, 2);

        // 创建一个 Blob 对象
        const blob = new Blob([jsonData], { type: 'application/json' });

        // 弹出一个对话框，让用户输入文件名
        const filename = window.prompt('请输入文件名', 'file');

        // 如果用户输入了文件名，那么在文件名后面添加 .json 后缀，否则使用默认的文件名
        saveAs(blob, (filename ? filename + '.json' : 'file.json'));
    }

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault()
        downloadFile(data);
    };
    useEffect(() => {
        console.log('workflowData_final', workflowData_final);
    }, [workflowData_final]); // 依赖项数组中包含 excelData


    return (
        <div>
            <button className="cursor-pointer py-2 px-[13px] bg-component-colors-components-buttons-primary-button-primary-bg shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md overflow-hidden flex flex-row items-center justify-center gap-[4px] border-[1px] border-solid border-component-colors-components-buttons-primary-button-primary-bg"
                onClick={handleClick}>
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                    alt=""
                    src="/download04.svg"
                />
            </button>
        </div>
    );
}

export default DownloadButton;


