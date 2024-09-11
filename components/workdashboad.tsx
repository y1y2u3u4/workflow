import type { NextPage } from "next";
import { memo } from "react";
import CodeSnippet from "./code-snippet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useExcelData } from '@/contexts/AppContext';
import React, { useState, useEffect } from 'react';
import AIButton from "@/components/aiagent";

interface workdashboadProps {
    key: number;
    columnNames: string[];
    handleSelectChange: (value: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    shuruneirong: string;
    setShuruneirong: (shuruneirong: string) => void;
    shuchuneirong: string;
    setShuchuneirong: (shuchuneirong: string) => void;
    previousShuchuneirong: string;
}

const Workdashboad: React.FC<workdashboadProps> = ({ key, columnNames, handleSelectChange, prompt, setPrompt, shuruneirong, setShuruneirong, shuchuneirong, setShuchuneirong, previousShuchuneirong }) => {
    return (
        <><div className="flex flex-row items-center justify-center py-0 px-spacing-xxs text-component-colors-components-buttons-secondary-button-secondary-fg">
            <div className="relative leading-[20px] font-semibold inline-block min-w-[42px]">
                提示词
            </div>
        </div><div className="w-[507px] overflow-x-auto flex flex-row items-start justify-start py-0 px-0 box-border gap-[30px] max-w-full">
                <CodeSnippet
                    propAlignSelf="unset"
                    propWidth="500px"
                    propPadding="24px 24px 32px"
                    propMaxHeight="667px"
                    name=""
                    onTextChange={(prompt) => {
                        // 这里处理新的文本内容
                        console.log(prompt);
                        setPrompt(prompt);
                    } } />
            </div><div className="self-stretch overflow-hidden flex flex-col items-center justify-center py-0 px-5 gap-[9px] text-component-colors-components-buttons-tertiary-button-tertiary-fg">
                <div className="flex flex-row items-center justify-end gap-[23px]">
                    <div className="flex flex-row items-center justify-end gap-[12px]">

                        <AIButton
                            prompt={prompt}
                            shuruneirong={shuruneirong}
                            onData={(data) => {
                                // 这里是你获取到 data 后的处理代码
                                console.log(data.data);
                                setShuchuneirong(data.data);
                            } } />
                    </div>
                </div>
            </div><div className="flex flex-row items-center justify-center py-0 px-spacing-xxs text-component-colors-components-buttons-secondary-button-secondary-fg">
                <div className="flex flex-col">
                    <div className="relative leading-[20px] font-semibold inline-block min-w-[56px]">
                        展示效果
                    </div>
                    
                    <Select onValueChange={handleSelectChange}>
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
                </div>
            </div><div className="w-[507px] overflow-x-auto flex flex-row items-start justify-start py-0 px-0 box-border gap-[30px] max-w-full">
                {shuruneirong && (
                    <CodeSnippet
                        propAlignSelf="unset"
                        propWidth="250px"
                        propPadding="24px 24px 32px"
                        propMaxHeight="667px"
                        name="输入内容"
                        text_moren={shuruneirong}
                        onTextChange={(shuruneirong_new) => {
                            // 这里处理新的文本内容
                            console.log(shuruneirong_new);
                            setShuruneirong(shuruneirong_new);
                        } } />
                )}
                {shuruneirong && (
                    <CodeSnippet
                        propAlignSelf="unset"
                        propWidth="250px"
                        propPadding="24px 24px 32px"
                        propMaxHeight="667px"
                        name="输出内容"
                        text_moren={shuchuneirong} />
                )}
            </div></>
  );
};

export default Workdashboad;