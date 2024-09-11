import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
function UploadButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { excelData, setExcelData } = useExcelData();
    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        console.log("handleClick 被调用");
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    useEffect(() => {
        console.log('excelData', excelData);
    }, [excelData]); // 依赖项数组中包含 excelData
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
                    const data = new Uint8Array(e.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // 获取第一个工作表
                    const worksheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[worksheetName];

                    // 将工作表转换为 JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    console.log('jsonData', jsonData);
                    // 将 JSON 数据保存在状态中
                    setExcelData(jsonData);
                    console.log('完成存储');
                }
            };
            reader.readAsArrayBuffer(file);

        } else {
            alert('请上传 Excel 文件');
        }
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx"
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
                <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                    <div className="relative text-sm leading-[20px] font-semibold font-text-sm-semibold text-component-colors-components-buttons-secondary-button-secondary-fg text-left inline-block min-w-[88px]">
                        Upload excel
                    </div>
                </div>
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 hidden min-h-[20px]"
                    alt=""
                    src="/placeholder2.svg"
                />
            </button>
        </div>
    );
}

export default UploadButton;

function parseFile(file: File | undefined) {
    throw new Error('Function not implemented.');
}
