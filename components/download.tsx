import React, { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
function DownloadButton() {
    const { excelData, shuruData_new } = useExcelData();

    const formatExcelData = () => {
        if (!excelData || excelData.length === 0) return [] as any[];
        const headers = excelData[0];
        return excelData.slice(1).map((row: any[]) => {
            const item: { [key: string]: any } = {};
            headers.forEach((header: string, idx: number) => {
                item[header] = row[idx];
            });
            return item;
        });
    };

    const data = (shuruData_new || []).length > 0
        ? shuruData_new
        : formatExcelData();

    function downloadFile(selectedData: unknown[]) {
        // 获取选中行的数据

        // 创建一个新的工作簿
        const wb = XLSX.utils.book_new();

        // 将数据转换为工作表
        const ws = XLSX.utils.json_to_sheet(selectedData);

        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // 将工作簿写入文件
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        // 创建一个 Blob 对象
        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

        // 使用 file-saver 库保存文件
        saveAs(blob, 'file.xlsx');
    }

    // 将字符串转换为 ArrayBuffer
    function s2ab(s: string) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault()
        downloadFile(data);
    };
    useEffect(() => {
        console.log('excelData', excelData);
    }, [excelData, shuruData_new]); // 依赖项数组中包含 excelData


    return (
        <div>
            <button className="cursor-pointer py-2 px-[13px] bg-component-colors-components-buttons-primary-button-primary-bg shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md overflow-hidden flex flex-row items-center justify-center gap-[4px] border-[1px] border-solid border-component-colors-components-buttons-primary-button-primary-bg"
                onClick={handleClick}>
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                    alt=""
                    src="/download04.svg"
                />
                <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                    <div className="relative text-sm leading-[20px] font-semibold font-text-sm-semibold text-colors-background-bg-primary text-left inline-block min-w-[107px]">
                        Download excel
                    </div>
                </div>
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 hidden min-h-[20px]"
                    alt=""
                    src="/placeholder3.svg"
                />
            </button>
        </div>
    );
}

export default DownloadButton;


