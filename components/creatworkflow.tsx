import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { useExcelData } from '../contexts/AppContext';
import Cookies from 'js-cookie';
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useNavigate } from 'react-router-dom';

// 在你的组件中


function CreatButton({ sortedData }: { sortedData: any }) {
    console.log('sortedData', sortedData);
    const { excelData, workflowData, workflowData_final } = useExcelData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [excelData_new, setExcelData_new] = useState<{ [key: string]: any; }[]>([]);
    const cookie=Cookies.get('cookies_moni') 
    // const parsedCookie = JSON.parse(cookie as string);
    const parsedCookie = "JSON.parse(cookie as string)";
    const [workflowName, setWorkflowName] = useState('My Workflow');
    

    // console.log('parsedCookie', JSON.stringify(parsedCookie, null, 2));

    useEffect(() => {
        if (excelData && excelData.length > 0) {
            const excelData_new = convertExcelDataToObjects(excelData);
            setExcelData_new(excelData_new);
        }
    }, [excelData, sortedData, workflowName]);


    const handleInputChange = (event: { target: { value: any; }; }) => {
        setWorkflowName(event.target.value);
    };

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
 

    const handleClick = async (event: React.MouseEvent) => {
        event.preventDefault();
        console.log("handleClick 被调用");
        console.log('workflowName:', workflowName);
        setIsDialogOpen(false); 
        if (excelData_new && excelData_new.length > 0) {
            try {
                const res = await fetch('/api/creatworkflow', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ workflowName, excelData, sortedData })
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Data:', data);
                    // 如果服务器返回的消息表示成功，那么导航到新的页面
                    if (data.message === "Workflow created successfully") {
                        window.location.href = '/workflowmanger';
                    }
                } else {
                    console.error('Server error:', await res.text());
                }

            } catch (e) {
                console.error('Error fetching:', e);
            }
        }
    };

    
    return (
        <div>
            <Dialog open={isDialogOpen}  onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <button
                        className="cursor-pointer shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-md bg-colors-background-bg-primary overflow-hidden flex flex-row items-center justify-center py-2 px-[66px] gap-[4px] text-component-colors-components-buttons-secondary-button-secondary-fg border-[1px] border-solid border-component-colors-components-buttons-secondary-button-secondary-border"
                    >
                        <img
                            className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                            alt=""
                            src="/magicwand02.svg"
                        />
                        <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                            <b className="relative leading-[20px] font-semibold inline-block min-w-[14px]">
                                Create workflow
                            </b>
                        </div>
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        {/* <DialogTitle>Edit profile</DialogTitle> */}
                        {/* <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription> */}
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Workflow Name
                            </Label>
                            <Input
                                id="workflowname"
                                defaultValue="My Workflow"
                                className="col-span-3"
                                onChange={handleInputChange}  // 当用户输入时，handleInputChange 函数会被调用
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        <DialogClose asChild>
                            <Button type="submit" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleClick}>Save Workflow</Button>
                    </DialogFooter>
                </DialogContent> 
            </Dialog>
        </div>
        
    );
}

export default CreatButton;

