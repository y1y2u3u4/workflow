import React, { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
interface ActionListProps {
    actions: ActionItemProps[];
    onResultsChange: (results: { url: string, element: string }[]) => void; // 新增
}
// 根据 action 设置图标和颜色
const getIconAndColor = (action: any) => {
    switch (action) {
        case 'Navigated to':
            return { icon: "/navigation-pointer-02.svg", color: "text-darkorchid" };
        case 'Clicked on':
            return { icon: "/cursor-click-02.svg", color: "text-forestgreen" };
        case 'Typed':
            return { icon: "/keyboard-01.svg", color: "text-darkblue" };
        case 'Press':
            return { icon: "/keyboard-01.svg", color: "text-darkblue" };
        case 'Scroll to':
            return { icon: "/sliders-02.svg", color: "text-darkblue" };

        default:
            return { icon: "/keyboard-01.svg", color: "text-defaultcolor" };
    }
};

const ActionItem: React.FC<ActionItemProps> = ({ action, url, element, previousShuchuneirong, columnNames, onActionChange }) => {
    const { icon, color } = getIconAndColor(action);
    const [isEditingUrl, setIsEditingUrl] = useState(false);
    const [isEditingElement, setIsEditingElement] = useState(false);
    const [selectedUrlValue, setSelectedUrlValue] = useState<string | null>(null);
    const [selectedElementValue, setSelectedElementValue] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState(url);
    const [currentElement, setCurrentElement] = useState(element);

    const handleUrlSelectChange = (value: string) => {
        setSelectedUrlValue(value);
        if (value === 'previous') {
            setCurrentUrl(url);
        } else {
            setCurrentUrl(value);
        }
        setIsEditingUrl(false); // 选择后退出编辑模式

    };

    const handleElementSelectChange = (value: string) => {
        setSelectedElementValue(value);
        if (value === 'previous') {
            setCurrentElement(element);
        } else {
            setCurrentElement(value);
        }
        setIsEditingElement(false); // 选择后退出编辑模式
    };
    
    useEffect(() => {
        onActionChange(currentUrl, currentElement);
    }, [currentUrl, currentElement]);
    return (
 <div className="self-stretch flex flex-row items-center justify-center relative gap-[12px] max-w-full mq450:flex-wrap">
            <img
                className="h-8 w-8 relative overflow-hidden shrink-0"
                alt=""
                src={icon}
            />
            <div className="flex-1 flex flex-col items-start justify-start min-w-[291px] max-w-full">
                <div className="self-stretch flex flex-col items-start justify-start">
                    <div className="self-stretch flex flex-row items-center justify-start py-0 pr-[230px] pl-0 gap-[8px] mq675:flex-wrap mq450:pr-5 mq450:box-border">
                        <div className="relative leading-[20px] inline-block min-w-[86px] whitespace-nowrap">
                            <span className="font-medium whitespace-pre-wrap">{action}</span>
                            <span>{` `}</span>
                        </div>
                        {isEditingUrl ? (
                            <Select onValueChange={handleUrlSelectChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="输入字段" />
                                </SelectTrigger>
                                <SelectContent>
                                    {previousShuchuneirong && (
                                        <SelectItem key="previous" value='previous'>
                                            previous
                                        </SelectItem>
                                    )}
                                    {columnNames.map((columnName: string, index: number) => (
                                        <SelectItem key={index} value={columnName}>
                                            {columnName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <i
                                className={`relative text-mini leading-[25px] inline-block font-black ${color} min-w-[123px] cursor-pointer`}
                                onClick={() => setIsEditingUrl(true)}
                            >
                                {currentUrl}
                            </i>
                        )}
                        {currentElement && (
                            isEditingElement ? (
                                <Select onValueChange={handleElementSelectChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="输入字段" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {previousShuchuneirong && (
                                            <SelectItem key="previous" value='previous'>
                                                previous
                                            </SelectItem>
                                        )}
                                        {columnNames.map((columnName: string, index: number) => (
                                            <SelectItem key={index} value={columnName}>
                                                {columnName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <i
                                    className={`relative text-mini leading-[25px] inline-block font-black ${color} min-w-[123px] cursor-pointer`}
                                    onClick={() => setIsEditingElement(true)}
                                >
                                    {currentElement}
                                </i>
                            )
                        )}
                    </div>
                    <div className="w-[316px] relative leading-[20px] font-medium text-colors-text-text-brand-secondary-700 hidden" />
                </div>
            </div>
            <img
                className="h-2.5 w-2.5 absolute !m-[0] top-[0px] right-[0px] z-[1]"
                alt=""
                src="/_Dot.svg"
            />
        </div>
    );
};


export const ActionList: React.FC<ActionListProps> = ({ actions, onResultsChange }) => { // 修改
    const [actionResults, setActionResults] = useState(actions);
    useEffect(() => {
        // console.log('actionResults:', actionResults);
        onResultsChange(actionResults); // 新增
    }, [actionResults]);
    const handleActionChange = (index: number, url: string, element: string) => {
        setActionResults(prevResults => {
            const newResults = prevResults.map((action, i) => {
                if (i === index) {
                    return { ...action, url, element };
                } else {
                    return action;
                }
            });
            // console.log('newResults_NEI:', newResults);
            return newResults;
        });
    };
    useEffect(() => {
        setActionResults(actions);
    }, [actions]);
    
    return (
        <div className="w-[491px] flex flex-col items-start justify-start max-w-full text-component-colors-components-buttons-secondary-button-secondary-fg">
            <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[333px] box-border gap-[16px] min-h-[509px] max-w-full mq675:pb-[216px] mq675:box-border">
                {actions.map((actionItem, index) => (
                    <ActionItem key={index} {...actionItem} onActionChange={(url, element) => handleActionChange(index, url, element)} /> // 新增
                ))}
            </div>
        </div>
    );
};