"use client"

import type {
    ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import * as XLSX from 'xlsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudTasksClient } from '@google-cloud/tasks';

interface RowData {
    name: string;
    [key: string]: any;
}

interface ProcessedRowData extends RowData {
    status: string;
    taskName?: string;
}

interface SortedData {
    [key: string]: any;
}
// import { set } from 'idb-keyval';
// import { get } from 'idb-keyval';
// import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
import { table } from "console";
import { useExcelData } from '@/contexts/AppContext';


const createColumnsFromData = (columnNames: any[]) => {
    if (!columnNames || columnNames.length === 0) {
        return [];
    }
    const columns = [
        {
            id: "select",
            header: ({ table }: { table: any }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: { row: any }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        ...columnNames.map((columnName: any) => ({
            accessorKey: columnName,
            header: columnName,
            cell: ({ row }: { row: any }) => {
                const cellValue = row.getValue(columnName) as string;
                const shortCellValue = typeof cellValue === "string" && cellValue.length > 20 ? cellValue.substring(0, 20) + '...' : cellValue;
                const [showFullCellValue, setShowFullCellValue] = useState(false);

                const handleClick = () => {
                    setShowFullCellValue(!showFullCellValue);
                };

                return (
                    <div className="text-center font-medium" onClick={handleClick} style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showFullCellValue ? cellValue : shortCellValue}
                    </div>
                );
            },
        })),
        {
            id: "actions",
            cell: ({ row, table }: { row: any, table: any }) => <ActionsCell row={row} table={table} />,
        },
    ];
    return columns;


};


export const columns = (columnNames: any[]) => {
    const columns = createColumnsFromData(columnNames);
    console.log(`columns`, columns);
    return columns
};




const ActionsCell = ({ row, table }: { row: any, table: any }) => {
    const [result, setResult] = useState({
        WorkflowName: '',
        WorkflowCount: 0,
        SuccessfulCount: 0,
        WorkflowStep: 0,
        excelData: [],
        falseTrueRows: [],
        jsonObject: {}
    });
    const [isOpen, setIsOpen] = useState(false);
    const [workflowName, setWorkflowName] = useState('');
    const [runresult, setRunresult] = useState('');
    const [runoutput, setRunoutput] = useState('');
    const [selectedValue_1, setSelectedValue_1] = useState('');
    const [selectedValue_2, setSelectedValue_2] = useState('');
    const [num, setNum] = useState(1);
    


    function getSelectedData() {
        // 获取表格的所有行
        // 这个方法取决于你正在使用的表格库
        console.log(`table`, table);
        const selectedRows = table.getSelectedRowModel();
        console.log('Selected rows:', selectedRows);

        // 创建一个空数组来存储选中行的数据
        const selectedData = [];

        // 遍历所有的行
        for (const row of selectedRows.rows) {
            // 如果这一行是被选中的
            console.log(`row`, row);
            console.log('row.original', row.original)
            selectedData.push(row.original);
        }
        console.log(`selectedData`, selectedData);
        return selectedData;
    }


    const handleValueChange_1 = (value: React.SetStateAction<string>) => {
        console.log("选中的值:", value);
        setSelectedValue_1(value);
    };
    const handleValueChange_2 = (value: React.SetStateAction<string>) => {
        console.log("选中的值:", value);
        setSelectedValue_2(value);
    };

    const processRow = async (sortedData:any,row: any,adsPowerUserId:any,url:any) => {
        try {
            console.log('Processing row:', row);
            console.log('Processing row_name:', row.name);


            const { runoutput, runresult } = await fetchWsEndpoint(sortedData,row,adsPowerUserId,url);
            console.log('runoutput:', runoutput);
            console.log('runresult:', runresult);
            return { ...row, output: runoutput, status: runresult };
        } catch (error) {
            console.error('Error processing row:', error);
            return { ...row, status: 'Error' };
        }
    };

    //调用 api 接口处理
    // const processRow = async (sortedData: any, row: any) => {
    //     try {
    //         console.log('Processing row:', row);
    //         console.log('Processing row_name:', row.name);

    //         const allData = await getAllData(row.name);
    //         console.log('All Data:', allData);
    //         return {
    //             ...row,
    //             gaodeName: allData.gaode.name,
    //             gaodeAddress: allData.gaode.address,
    //             gaodePhone: allData.gaode.phone,
    //             tengxunName: allData.tengxun.name,
    //             tengxunAddress: allData.tengxun.address,
    //             tengxunPhone: allData.tengxun.phone,
    //             baiduName: allData.baidu.name,
    //             baiduAddress: allData.baidu.address,
    //             baiduPhone: allData.baidu.phone
    //         };
    //     } catch (error) {
    //         console.error('Error processing row:', error);
    //         return { ...row, status: 'Error' };
    //     }
    // };

    async function processRows(sortedData: any, dataObjects: string | any[], start: number, step: number) {
        const processedData = [];
        //构建 5 个adsPowerUserId并且在使用的时候依次使用
        // const adsPowerUserIds = ['kn8o287', 'knibk1e', 'knibk1h', 'knibk1k', 'knibk1k'];
        //runway 专用
        // const adsPowerUserIds = ['kp26yuj'];
        const adsPowerUserIds = ['kn8o287'];
        const urls = [
            // 'https://test1-container-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-001-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-002-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-003-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-004-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-005-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-006-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-007-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-008-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-009-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-010-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-011-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-012-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-013-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-014-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-015-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-016-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-017-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-018-omqcnm4zaq-uc.a.run.app/scrape/',
            'https://test1-container-019-omqcnm4zaq-uc.a.run.app/scrape/',
        ];

        // for (let i = start; i < dataObjects.length; i += step) {
        for (let i = start; i < dataObjects.length; i += step) {
            const row = dataObjects[i];
            const adsPowerUserId = adsPowerUserIds[i % adsPowerUserIds.length];
            const url = urls[i % urls.length];
            try {
                console.log('adsPowerUserId:', adsPowerUserId);
                await new Promise(resolve => setTimeout(resolve, 5000));
                const processedRow = await processRow(sortedData, row, adsPowerUserId,url);
                console.log('processedRow:', processedRow);
                processedData.push(processedRow);
            } catch (error) {
                console.error('Error processing row:', error);
                processedData.push({ ...row, status: 'Error' });
            }
            
        }

        // try 
        //     const processedRow = await processRow(sortedData, dataObjects);
        //     console.log('processedRow:', processedRow);
        //     processedData.push(processedRow);
        // } catch (error) {
        //     console.error('Error processing row:', error);
        //     processedData.push({ ...row, status: 'Error' });
        // }
        return processedData;
        
    }

    const processDataObjects = async (num:any,sortedData: any, dataObjects: any) => {
        console.log('dataObjects:', dataObjects);
        console.log('sortedData:', sortedData);
        const promises = [];
        for (let i = 0; i < num; i++) {
            promises.push(processRows(sortedData, dataObjects, i, num));
        }
        const processedData=await Promise.all(promises);
        console.log('processedData:', processedData);
        return processedData;
    };





    const fetchWsEndpoint = async (sortedData:any,row: any,adsPowerUserId:any,url:any) => {
        let runoutput;
        let runresult;
        const task_name = `${row.task_name}`
        try {
            // http://localhost:8082/scrape
            // https://test1-container-omqcnm4zaq-uc.a.run.app/scrape
            // https://test1-container-1-omqcnm4zaq-uc.a.run.app/scrape
            // /api/CreateTask_1
            // /api/CreateTask_4
            // /api/CreateTask_5
            // /api/CreateTask_6
            // /api/CreateTask_scheduler
            const leixing=selectedValue_2
            const res = await fetch('http://localhost:8082/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sortedData, row, task_name, leixing, adsPowerUserId,url })
            });
            // const res = await fetch('http://localhost:8082/scrape', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ sortedData, row, task_name, leixing, adsPowerUserId })
            // });

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
                        }
                        else if (parsedData.runresult) {
                            runresult = parsedData.runresult
                            console.log('runresult', parsedData.runresult);
                            setRunresult(parsedData.runresult)
                        }
                        else if (parsedData.runoutput) {
                            console.log('runoutput', parsedData.runoutput);
                            runoutput = parsedData.runoutput
                            setRunoutput(parsedData.runoutput)
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                });
            }

        } catch (e) {
            console.error('Error fetching wsEndpoint:', e);
        }
        return { runoutput, runresult };
    };

    const Renewaldata = async (workflowName: any, excelData_new: any) => {
        try {
            const res = await fetch('/api/renewworkflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ workflowName, excelData_new })
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Data:', data);
                // 如果服务器返回的消息表示成功，那么导航到新的页面
                if (data.message === "Workflow created successfully") {
                }
            } else {
                console.error('Server error:', await res.text());
            }

        } catch (e) {
            console.error('Error fetching:', e);
        }
    };




    const fetchData = async (cellValue: any) => {
        try {
            const res = await fetch('/api/readworkflow_detail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cellValue })
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Data:', data);
                setResult(data.result);
                return data.result
            } else {
                console.error('Server error:', await res.text());
            }
        } catch (e) {
            console.error('Error fetching:', e);
        }
    };


    const getData_gaode = async (keywords: string) => {
        try {
            const url = `https://restapi.amap.com/v5/place/text?keywords=${encodeURIComponent(keywords)}&region=北京市&key=e5fa6ceff746bd2728fd7ab09823141c&show_fields=business`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Data:', data);

                // 提取 pois 中的第一个对象的名称和电话字段
                if (data.pois && data.pois.length > 0) {
                    const firstPoi = data.pois[0];
                    const result = {
                        name: firstPoi.name,
                        address: firstPoi.address,
                        phone: firstPoi.business.tel
                    };
                    console.log('Extracted Data:', result);
                    return result;
                } else {
                    console.error('No POIs found.');
                }
            } else {
                console.error('Server error:', await res.text());
            }
        } catch (e) {
            console.error('Error fetching:', e);
        }
    };

    const getData_tengxun = async (keywords: string) => {
        try {
            const res = await fetch('/api/getData_tengxun', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keywords })
            });
            if (res.ok) {
                const data = await res.json();
                console.log('data.result:', data);
                return data;
            } else {
                console.error('Server error:', await res.text());
            }
        } catch (e) {
            console.error('Error fetching:', e);
        }
    };


    const getData_baidu = async (keywords: string) => {
        try {
            const res = await fetch('/api/getData_baidu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keywords })
            });
            if (res.ok) {
                const data = await res.json();
                console.log('data.result:', data);
                return data;
            } else {
                console.error('Server error:', await res.text());
            }
        } catch (e) {
            console.error('Error fetching:', e);
        }
    };


    const getAllData = async (keywords: string) => {
        const [gaodeData, tengxunData, baiduData] = await Promise.all([
            getData_gaode(keywords),
            getData_tengxun(keywords),
            getData_baidu(keywords)
        ]);


        
        return {
            gaode: gaodeData || { name: null, address: null, phone: null },
            tengxun: tengxunData || { name: null, address: null, phone: null },
            baidu: baiduData || { name: null, address: null, phone: null }
        };
    };

    const handleRun = async () => {
        const selectdata=getSelectedData()
        const cellValue = row.getValue("WorkflowName") as string;
        console.log('cellValue:', cellValue);
        console.log('num:', num);
        // setWorkflowName(cellValue)
        if (cellValue) {
            const result=await fetchData(cellValue)
            const processedData = await processDataObjects(num,result.jsonObject, result.excelData);
            console.log('Processed Data_f:', processedData);
            // await Renewaldata(cellValue, processedData);
        }
       
    };


    useEffect(() => {
        console.log("isOpen:", isOpen);
    }, [isOpen]); // 当 isOpen 状态发生变化时执行



    return (
        <DropdownMenu>

            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">开始执行</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>进行配置</DialogTitle>
                            <DialogDescription>
                                输入对应的配置内容，包括并发的数量、是否开启表头、是否针对未成功任务重跑
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="num" className="text-right">
                                并发数量
                            </Label>
                            <Input id="num" value={num} onChange={e => setNum(Number(e.target.value))} className="col-span-3" />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="framework">是否开启表头</Label>
                            <Select onValueChange={handleValueChange_1}>
                                <SelectTrigger id="framework">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="true">是</SelectItem>
                                    <SelectItem value="false">否</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="framework">任务类型</Label>
                            <Select onValueChange={handleValueChange_2}>
                                <SelectTrigger id="framework">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="RPA">RPA</SelectItem>
                                    <SelectItem value="爬虫">爬虫</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">

                            </div>
                        </div> */}
                        <DialogFooter className="flex justify-between">
                            
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    取消
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button type="submit" onClick={handleRun}>执行</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem onClick={() => downloadFile(getSelectedData())}>下载文件</DropdownMenuItem> */}
                {/* <DropdownMenuItem>开启跟价</DropdownMenuItem>
                <DropdownMenuItem>优化文案</DropdownMenuItem>
                <DropdownMenuItem>优化图片</DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export default function MyPage() {
    return <div>Hello, world!</div>;
}


