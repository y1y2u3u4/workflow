import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
import { useRequest } from "ahooks";
import { toast } from "sonner";
import { fetchEnhanced } from '@/utils/request';
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
interface AIButtonProps {
    prompt: string;
    shuruneirong: string;
    onData: (data: any) => void;  // 新增的 prop
}

const AIButton: React.FC<AIButtonProps> = ({ prompt, shuruneirong, onData }) => {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState(prompt);
    const [user_input, setUserinput] = useState(shuruneirong);
    const router = useRouter();
    const inputRef = useRef<HTMLTextAreaElement | null>(null);


    useEffect(() => {
        setDescription(prompt);
        setUserinput(shuruneirong);
    }, [prompt, shuruneirong]);
    
    const { runAsync: generate, data: ids } = useRequest(async () => {
        if (!description || !user_input) {
            toast.error("Please input both description and user input");
            return;
        }
        const model = Cookies.get('model')
        const API_KEY = Cookies.get('apiKey');
        console.log("description_0", description);
        console.log("user_input_0", user_input);
        const response = await fetch("/api/music/generate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description, user_input, model, API_KEY }),
        });

        
        if (!response.ok) {
            toast.error("Request failed");
            return;
        }

        const data = await response.json();

        if (data) {
            console.log("data", data);
            return data;
        }

        throw new Error("Gen music failed");
    }, {
        manual: true,
        onSuccess: () => {
            toast.success("New operation succeeded");
            setLoading(false);
        },
        onError: () => {
            toast.error("Gen music failed");
            setLoading(false);
        }
    });

    const handleClick = async (event: React.MouseEvent) => {
        event.preventDefault();
        const model = Cookies.get('model')
        const API_KEY = Cookies.get('apiKey');
        // console.log("model", model);
        // console.log("API_KEY", API_KEY);

        if (!model || !API_KEY) {
            alert('Please select a model and input your OpenAI API Key.');
            return null;
        }
        console.log("handleClick 被调用");
        console.log("description", description);
        console.log("user_input", user_input);

        setLoading(true);
        const data = await generate();

        if (data) {
            console.log("data", data);
            onData(data);  // 调用 onData 函数
        }
    };

    return (
        <div>

            <button
                className="cursor-pointer shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md bg-colors-background-bg-primary overflow-hidden flex flex-row items-center justify-center py-2 px-[66px] gap-[4px] text-component-colors-components-buttons-secondary-button-secondary-fg border-[1px] border-solid border-component-colors-components-buttons-secondary-button-secondary-border"
                onClick={handleClick}
                disabled={loading}
            >
                <img
                    className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                    alt=""
                    src="/magicwand02.svg"
                />
                <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                    <div className="relative leading-[20px] font-semibold inline-block min-w-[14px]">
                        {loading ? "Loading" : "AI"}
                    </div>
                </div>
            </button>
        </div>
    );
}

export default AIButton;
