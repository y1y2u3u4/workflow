import type { NextPage } from "next";
import { memo, useEffect } from "react";
import React, { useRef, useState } from 'react';
import { TextField, InputAdornment, Icon, IconButton } from "@mui/material";
import Typography from '@mui/material/Typography';
import {ActionList} from "@/components/action";
import RunButton from "@/components/runworkflow";
import CreatButton from "@/components/creatworkflow";
import UploadButton from "@/components/upload_workflow";
import DownloadButton from "@/components/download_workflow";
import { useExcelData } from '@/contexts/AppContext';
// 清洗和排序数据
function cleanAndSortData(data: { inputs: any[]; clicks: any[]; keydowns: any[]; navigations: any[]; scrolls: any[]; }) {
    const cleanedInputs = [];
    let inputElements: { [key: string]: any } = {};

    data.inputs.forEach((input: { element: { tagName: string, id: string, className: string, name: string, value: string, placeholder: string, label: string,leixing:string } }) => {
        const { tagName, id, className, name, placeholder, label,leixing } = input.element;
        const key = `${tagName}_${id}_${className}_${name}_${placeholder}_${label}_${leixing}`; // 组合信息作为键
        inputElements[key] = input; // 记录最后一次输入
    });

    for (const key in inputElements) {
        cleanedInputs.push(inputElements[key]);
    }
    //去重 scroll
    const cleanedScrolls = [];
    let scrollEvents: { [key: string]: any } = {};

    data.scrolls.forEach((scroll: { action: string, direction: string, distance: number }) => {
        const { action, direction, distance } = scroll;
        const key = `${action}_${direction}`; // 组合信息作为键
        scrollEvents[key] = scroll; // 记录最后一次滚动事件
    });

    for (const key in scrollEvents) {
        cleanedScrolls.push(scrollEvents[key]);
    }
    //去重navigation
    const cleanedNavigations = [];
    let navigationEvents: { [key: string]: any } = {};

    data.navigations.forEach((navigation: { action: string, url: string, time: string }) => {
        const { action, url, time } = navigation;
        const timestamp = Date.parse(time); // 将 ISO 8601 格式的字符串转换为时间戳
        const key = `${action}_${url}`; // 组合信息作为键

        // 如果这个导航事件已经存在，并且时间戳之差小于1秒（1000毫秒），则忽略这个导航事件
        if (navigationEvents[key] && timestamp - Date.parse(navigationEvents[key].time) < 1000) {
            return;
        }

        navigationEvents[key] = navigation; // 记录导航事件
    });

    for (const key in navigationEvents) {
        cleanedNavigations.push(navigationEvents[key]);
    }
    // 去重 click 事件
    const cleanedClicks = [];
    let clickEvents: { [key: string]: any } = {};

    data.clicks.forEach((click: { element: { tagName: string, id: string, className: string, name: string, value: string, innerText:string } }) => {
        const { tagName, id, className, name, value, innerText } = click.element;
        const key = `${tagName}_${id}_${className}_${name}_${innerText}`; // 组合信息作为键
        clickEvents[key] = click; // 记录最后一次输入
    });

    for (const key in clickEvents) {
        cleanedClicks.push(clickEvents[key]);
    }

    const functionalKeys = ['Enter', 'Backspace', 'Delete'];  // 你关心的功能键

    const combinedData = [
        ...cleanedClicks.map((event: any) => ({ ...event, type: 'click' })),
        ...cleanedInputs.map(event => ({ ...event, type: 'input' })),
        ...data.keydowns
            .filter((event: any) => functionalKeys.includes(event.key))  // 只保留功能键的 keydown 事件
            .map((event: any) => ({ ...event, type: 'keydown' })),
        ...cleanedNavigations.map((event: any) => ({ ...event, type: 'navigation' })),
        ...cleanedScrolls.map((event: any) => ({ ...event, type: 'scroll' }))
    ];

    combinedData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return combinedData;
}
// 转化为 action 的内容
function transformToActions(sortedData: any[], columnNames: string[]) {
    return sortedData.map((event: {
        type: any; element: {
            className: string; id: string; name: string; tagName: string; value: string;
        };
        value: string; key: string; url: string; distance: string; direction: string
    }) => {
        let actionType;
        let url = '';
        let element = '';
        switch (event.type) {
            case 'click':
                actionType = 'Clicked on';
                url = event.value;
                element = event.element.className;
                break;
            case 'input':
                actionType = 'Typed';
                url = event.value;
                element = event.element.className;
                break;
            case 'keydown':
                actionType = 'Press';
                url = event.key;
                element = '';
                break;
            case 'navigation':
                actionType = 'Navigated to';
                url = event.url;
                element = '';
                break;
            case 'scroll':
                actionType = 'Scroll to';
                url = `direction: ${event.direction}   distance: ${event.distance}`;
                element = '';
                break;
            default:
                actionType = 'Unknown';
                break;
        }

        return {
            action: actionType,
            url: url,
            element: element,
            columnNames: columnNames, // 使用传入的 columnNames
            previousShuchuneirong: "Previous" // 可以根据需要调整
        };
    });
}



export type WorkflowType = {
    className?: string;
    workflowData?: {
        inputs: any[];
        clicks: any[];
        keydowns: any[];
        navigations: any[];
        scrolls: any[];
    }
};
interface ActionItemProps {
    action: string; // 假设 action 是一个字符串
    url: string;
    element: string;
    previousShuchuneirong?: string;
    columnNames: string[];
    onActionChange: (url: string, element: string) => void; // 新增
}


interface ActionItemProps_new {
    action: string; // 假设 action 是一个字符串
    url: string;
    element: string;
    previousShuchuneirong?: string;
    columnNames: string[];
}

const Workflow_1: NextPage<WorkflowType> = memo(({ className = "", workflowData }) => {
    const { excelData, setWorkflowData_final } = useExcelData();
    const [sortedData, setSortedData] = useState({});
    const [sortedData_new, setSortedData_new] = useState({});
    // const [columnNames, setColumnNames] = useState([]);
    
    const [actionsData, setActionsData] = useState<ActionItemProps[]>([]);
    const [actionsData_new, setActionsData_new] = useState({});
    const [actions_num, setActions_num] = useState(0);
    const [updatedActions, setUpdatedActions] = useState<ActionItemProps[]>([]); // 新增

    // 定义一个处理 url 和 element 改变的函数
    const handleActionChange = (index: number, url: string, element: string) => { // 修改
        setUpdatedActions(prevActions => {
            const newActions = [...prevActions];
            newActions[index] = { ...newActions[index], url, element };
            return newActions;
        });
    };

    useEffect(() => {
        console.log('workflowData', workflowData);
        if (workflowData) {
            setWorkflowData_final(workflowData);
            const sortedData = cleanAndSortData(workflowData);
            setSortedData(sortedData)
            const columnNames = excelData ? excelData[0] : ["clo", "clo"];
            const actions = transformToActions(sortedData, columnNames);
            // console.log('actions', actions);
            setActionsData(actions.map((action, index) => {
                // console.log('action before', action);
                const newAction = {
                    ...action,
                    onActionChange: (url: string, element: string) => handleActionChange(index, url, element)
                };
                // console.log('action after', newAction);
                return newAction;
            }));
            const n = actions.length;
            setActions_num(n);

        }
    }, [workflowData, excelData]);

    useEffect(() => {
        console.log('actionsData_new:', actionsData_new);
        console.log('sortedData:', sortedData);
        const matchAndReplace = (arr1: any, arr2: any) => {
            return arr1.map((item: { type: string; }, index: string | number) => {
                if (item.type === 'navigation') {
                    return { ...item, url: arr2[index].url };
                } else if (item.type === 'input') {
                    return { ...item, value: arr2[index].url };
                } else {
                    return item;
                }
            });
        };
        if (Array.isArray(sortedData) && sortedData.length > 0 && Array.isArray(actionsData_new) && actionsData_new.length > 0) {
            const sortedData_new = matchAndReplace(sortedData, actionsData_new)
            console.log('sortedData_new:', sortedData_new); 
            setSortedData_new(sortedData_new);
        } else {
            console.error('sortedData or actionsData_new is not an array or is empty:', sortedData, actionsData_new);
        }
    }, [actionsData_new, sortedData]);


    return (
        <div
            className={`flex-1 flex flex-col items-center justify-start py-8 px-0 box-border min-w-[480px] max-w-full ml-[-2px] text-left text-sm text-component-colors-components-buttons-tertiary-button-tertiary-fg font-text-sm-semibold mq675:min-w-full mq800:pb-[21px] mq800:box-border ${className}`}
        >
            <div className="self-stretch flex flex-col items-start justify-start pt-0 px-container-padding-desktop pb-3.5 box-border gap-[9px] max-w-full">
                <div className="self-stretch flex flex-col items-start justify-start gap-[20px] max-w-full text-lg text-colors-text-text-primary-900">
                    <div className="self-stretch flex flex-row items-start justify-start gap-[16px] max-w-full">
                        <div className="flex-1 flex flex-col items-start justify-center gap-[4px] max-w-full">
                            <b className="self-stretch relative leading-[28px] font-semibold">
                                {" "}
                                workflow
                            </b>
                            <div className="self-stretch h-5 relative text-sm leading-[20px] text-component-colors-components-buttons-tertiary-button-tertiary-fg hidden overflow-hidden text-ellipsis whitespace-nowrap">
                                Manage your team members and their account permissions here.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="self-stretch flex flex-row items-start justify-start py-0 px-0 box-border gap-[16px] max-w-full mq675:flex-wrap">
                    
                    <Typography
                        className="[border:none] bg-[transparent] h-10 w-[355px] font-text-sm-semibold font-semibold text-sm text-colors-text-text-brand-secondary-700 max-w-full shrink-0"
                        style={{
                            height: "40px",
                            fontSize: "14px",
                            color: "#6941c6",
                            width: "355px",
                            marginTop: "0.5rem",
                        }}
                    >
                        {`Steps ${actions_num}`}
                    </Typography>
                    <UploadButton />
                    <DownloadButton />     
                </div>
                
                <ActionList
                    actions={actionsData}
                    onResultsChange={newResults => {
                        setActionsData_new([]); // 先清空回调的内容
                        if (newResults && newResults.length > 0) { // 如果有新的结果
                            setActionsData_new(newResults); // 更新为新的结果
                        }
                    }}
                />
                <div className="self-stretch overflow-hidden flex flex-col items-center justify-center py-0 px-5 gap-[9px]">
                    <div className="flex flex-row items-center justify-end gap-[23px]">
                        <div className="flex flex-row items-center justify-end gap-[12px]">
                            {/* <RunButton sortedData={sortedData_new} /> */}
                            <CreatButton sortedData={sortedData_new} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Workflow_1;
