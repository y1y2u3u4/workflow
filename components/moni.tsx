import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie';
function MoniButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { excelData, setWorkflowData, setWorkflowurl } = useExcelData();
    const [wsEndpoint, setWsEndpoint] = useState(null);
    const [monitorResults, setMonitorResults] = useState("");
    const [videoUrl, setVideoUrl] = useState('');
    const [cookies, setCookies] = useState('');
    useEffect(() => {
        console.log('monitorResults', monitorResults);
        console.log('videoUrl', videoUrl);
    }, [monitorResults, videoUrl]);

    const fetchWsEndpoint = async () => {
        try {
            const res = await fetch('/api/browser'); // 替换为实际的API端点
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
                            setWsEndpoint(parsedData.wsEndpoint);
                        } else if (parsedData.monitorResults) {
                            setMonitorResults(parsedData.monitorResults);
                            setWorkflowData(parsedData.monitorResults);
                            console.log('monitorResults', parsedData.monitorResults);
                        }
                        else if (parsedData.cookies) {
                            setCookies(parsedData.cookies);
                            // console.log('cookies_moni', parsedData.cookies);
                            Cookies.set('cookies_moni', JSON.stringify(parsedData.cookies));
                        }
                        else if (parsedData.gifUrl) {
                            console.log('parsedData.gifUrl:', parsedData.gifUrl);
                            setVideoUrl(parsedData.gifUrl);
                            setWorkflowurl(parsedData.gifUrl)
                            console.log('gifUrl', parsedData.gifUrl);
                        }


                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                });
            }



        } catch (e) {
            console.error('Error fetching wsEndpoint:', e);
        }
    };

    const handleClick = async (event: React.MouseEvent) => {
        event.preventDefault();
        console.log("handleClick 被调用");
        await fetchWsEndpoint();
        console.log('完成存储');
    };
    return (
        <div>
            <button
                className="cursor-pointer py-2 px-[13px] bg-colors-background-bg-primary shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md overflow-hidden flex flex-row items-center justify-center gap-[4px] border-[1px] border-solid border-component-colors-components-buttons-secondary-button-secondary-border"
                onClick={handleClick}
            >
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                    alt=""
                    src="/video-recorder.svg"
                />
                <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                    <div className="relative text-sm leading-[10px] font-semibold font-text-sm-semibold text-component-colors-components-buttons-secondary-button-secondary-fg text-left inline-block min-w-[60px]">
                        开始录制
                    </div>
                </div>
            </button>
            {/* <div>
                <div>Puppeteer 浏览器窗口</div>
                <button onClick={handleClick}>开始监控</button>
                {monitorResults && (
                    <div>
                        <h3>监控结果</h3>
                        <pre>{JSON.stringify(monitorResults, null, 2)}</pre>
                    </div>
                )}
                {videoUrl && (
                    <div>
                        <h3>录制的视频</h3>
                        <video controls src={videoUrl}></video>
                    </div>
                )}
            </div> */}
        </div>
    );
}

export default MoniButton;

function parseFile(file: File | undefined) {
    throw new Error('Function not implemented.');
}
