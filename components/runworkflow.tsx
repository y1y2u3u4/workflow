import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import Cookies from 'js-cookie';
function RunButton({ sortedData }: { sortedData: any }) {
    console.log('sortedData', sortedData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { excelData, setWorkflowData_final, setWorkflowurl } = useExcelData();
    const [wsEndpoint, setWsEndpoint] = useState(null);
    const [monitorResults, setMonitorResults] = useState("");
    const [videoUrl, setVideoUrl] = useState('');
    const [excelData_new, setExcelData_new] = useState<{ [key: string]: any; }[]>([]);
    const cookie=Cookies.get('cookies_moni') 
    // const parsedCookie = JSON.parse(cookie as string);
    const parsedCookie = "JSON.parse(cookie as string)";
    // console.log('parsedCookie', JSON.stringify(parsedCookie, null, 2));

    useEffect(() => {
        if (excelData && excelData.length > 0) {
            const excelData_new = convertExcelDataToObjects(excelData);
            setExcelData_new(excelData_new);
        }
        // if (sortedData && sortedData.length > 0) {
        //     setWorkflowData_final(sortedData);
        // }
    }, [excelData, sortedData]);

    const convertExcelDataToObjects = (data: any[]) => {
        const headers = data[0];
        return data.slice(1).map(row => {
            let obj: { [key: string]: any } = {};
            row.forEach((cell: any, index: string | number) => {
                obj[headers[index]] = cell;
            });
            return obj;
        });
    };

    const processRow = async (row: any) => {
        try {
            console.log('Processing row:', row);
            const searchResults = await fetchWsEndpoint(row, parsedCookie);
            console.log('searchResults:', searchResults);
            return { ...row, status: searchResults };
        } catch (error) {
            console.error('Error processing row:', error);
            return { ...row, status: 'Error' };
        }
    };


    
    const processDataObjects = async (dataObjects: any) => {
        const processedData = [];
        for (const row of dataObjects) {
            try {
                const processedRow = await processRow(row);
                processedData.push(processedRow);
            } catch (error) {
                console.error('Error processing row:', error);
                processedData.push({ ...row, status: 'Error' });
            }
        }
        return processedData;
    };


    const fetchWsEndpoint = async (row: any, cookie:any) => {
        let searchResults = false; // 添加这一行
        console.log('cookie_check:', cookie);
        try {
            const res = await fetch('/api/browser_run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sortedData, row, cookie })
            });
            const reader = res.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';

            while (true) {
                const { done, value } = await reader?.read() ?? { done: true, value: undefined };
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                console.log('Response text:', text);
                result += text;

                // 用正则表达式确保每个 JSON 对象都是正确的
                const jsonStrings = result.split('\n').filter(str => str.trim());
                console.log('jsonStrings:', jsonStrings);
                jsonStrings.forEach(jsonStr => {
                    try {
                        const parsedData = JSON.parse(jsonStr);
                        if (parsedData.wsEndpoint) {
                            // setWsEndpoint(parsedData.wsEndpoint);
                        } else if (parsedData.monitorResults) {
                            console.log('monitorResults_run', parsedData.monitorResults);
                            searchResults = true; // 添加这一行
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                });
            }

        } catch (e) {
            console.error('Error fetching wsEndpoint:', e);
        }
        return searchResults;
    };

    const handleClick = async (event: React.MouseEvent) => {
        event.preventDefault();
        console.log("handleClick 被调用");
        
        // await fetchWsEndpoint();
        // console.log('完成存储');
        if (!excelData_new || excelData_new.length === 0) {
            const excelData_final = [['header1', 'header2'], ['value1', 'value2']];
            console.log('excelData_final:', excelData_final);
            const processedData = await processDataObjects(excelData_final);
            console.log('Processed Data_f:', processedData);
        } else{
            const excelData_final = excelData_new;
            console.log('excelData_final:', excelData_final);
            const processedData = await processDataObjects(excelData_final);
            console.log('Processed Data_f:', processedData);
        }
    };

    
    return (
        <div>
            <button
                className="cursor-pointer shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md bg-colors-background-bg-primary overflow-hidden flex flex-row items-center justify-center py-2 px-[66px] gap-[4px] text-component-colors-components-buttons-secondary-button-secondary-fg border-[1px] border-solid border-component-colors-components-buttons-secondary-button-secondary-border"
                onClick={handleClick}
            >
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                    alt=""
                    src="/magicwand02.svg"
                />
                <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                    <b className="relative leading-[20px] font-semibold inline-block min-w-[14px]">
                        Run workflow
                    </b>
                </div>
            </button>
        </div>
    );
}

export default RunButton;

