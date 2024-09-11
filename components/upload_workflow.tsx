import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
function UploadButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { workflowData_final, setWorkflowData_final } = useExcelData();
    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        console.log("handleClick 被调用");
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    useEffect(() => {
        console.log('excelData', workflowData_final);
    }, [workflowData_final]); // 依赖项数组中包含 excelData
    const [isExcelDataLoaded, setIsExcelDataLoaded] = useState(false);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("handleFileChange 被调用");
        const file = event.target.files?.[0];
        console.log('file', file);
        event.target.value = '';

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    const jsonData = JSON.parse(e.target.result as string);
                    console.log('jsonData', jsonData);
                    // 将 JSON 数据保存在状态中
                    setWorkflowData_final(jsonData);
                    console.log('完成存储');
                }
            };
            reader.readAsText(file);

        } else {
            alert('请上传 JSON 文件');
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
            />
            <button
                className="cursor-pointer py-2 px-[13px] bg-colors-background-bg-primary shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md overflow-hidden flex flex-row items-center justify-center gap-[4px] border-[1px] border-solid border-component-colors-components-buttons-secondary-button-secondary-border"
                onClick={handleClick}
            >
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                    alt=""
                    src="/uploadcloud01.svg"
                />
            </button>
        </div>
    );
}

export default UploadButton;

function parseFile(file: File | undefined) {
    throw new Error('Function not implemented.');
}
