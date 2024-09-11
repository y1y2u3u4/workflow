"use client"

import type {
    ColumnDef
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
// import { set } from 'idb-keyval';
// import { get } from 'idb-keyval';
// import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
import { table } from "console";
import { useExcelData } from '@/contexts/AppContext';


const createColumnsFromData = () => {
    const { excelData, shuruData_new } = useExcelData();
    if (!excelData || excelData.length === 0) {
        return [];
    }
    // 假设 excelData 的第一行包含列名
    const columnNames = (shuruData_new || []).length > 0 ? Object.keys(shuruData_new[0])  : excelData[0];
    console.log(`columnNames`, columnNames);

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
                    <div className="text-left font-medium" onClick={handleClick} style={{ width: '100px', height: '100px' }}>
                        {showFullCellValue ? cellValue : shortCellValue}
                    </div>
                );
            },
        }))
    ];

    return columns;
};


export const columns = () => {
    const columns = createColumnsFromData();
    console.log(`columns`, columns);
    return columns
};


// export type Payment = {
//     id: string
//     id_p:string
//     clientId: string
//     currency_code: string
//     orPrice: number
//     discountedPrice: number
//     status: "pending" | "processing" | "success" | "failed"
//     productName: string
//     images: string[]
//     discount: number
//     realPrice: number
//     min_price: number
//     productditill: string
//     createdtime: string
//     updatedtime: string
// }



// function downloadFile(selectedData) {
//     // 获取选中行的数据

//     // 创建一个新的工作簿
//     const wb = XLSX.utils.book_new();

//     // 将数据转换为工作表
//     const ws = XLSX.utils.json_to_sheet(selectedData);

//     // 将工作表添加到工作簿
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

//     // 将工作簿写入文件
//     const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

//     // 创建一个 Blob 对象
//     const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

//     // 使用 file-saver 库保存文件
//     saveAs(blob, 'file.xlsx');
// }

// // 将字符串转换为 ArrayBuffer
// function s2ab(s) {
//     const buf = new ArrayBuffer(s.length);
//     const view = new Uint8Array(buf);
//     for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
//     return buf;
// }
// const ActionsCell = ({ row,table }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [url, setUrl] = useState('');
//     function getSelectedData() {
//         // 获取表格的所有行
//         // 这个方法取决于你正在使用的表格库
//         console.log(`table`, table);
//         const selectedRows = table.getSelectedRowModel();
//         console.log('Selected rows:', selectedRows);

//         // 创建一个空数组来存储选中行的数据
//         const selectedData = [];

//         // 遍历所有的行
//         for (const row of selectedRows.rows) {
//             // 如果这一行是被选中的
//             console.log(`row`, row);
//             selectedData.push(row.original);
//         }
//         console.log(`selectedData`, selectedData);
//         return selectedData;
//     }
//     const handleSave = () => {
//         navigator.clipboard.writeText(url);
//         console.log(`url`, url);
//         const id = row.getValue("id")
//         console.log(`id`, id);
//         set('id:url', url).catch(err => console.error('IndexedDB error:', err));
//     };
//     useEffect(() => {
//         console.log("isOpen:", isOpen);
//     }, [isOpen]); // 当 isOpen 状态发生变化时执行

//     return (
//         <DropdownMenu>

//             <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="h-8 w-8 p-0">
//                     <span className="sr-only">Open menu</span>
//                     <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//                 {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
//                 <Dialog>
//                     <DialogTrigger asChild>
//                         <Button variant="outline">绑定竞品</Button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-[425px]">
//                         <DialogHeader>
//                             <DialogTitle>输入竞品URL</DialogTitle>
//                             {/* <DialogDescription>
//                                 输入需要追踪和绑定的竞品 URL
//                             </DialogDescription> */}
//                         </DialogHeader>
//                         <div className="grid gap-4 py-4">
//                             <div className="grid grid-cols-4 items-center gap-4">
//                                 <Label htmlFor="url" className="text-right">
//                                     URL
//                                 </Label>
//                                 <Input id="url" value={url} onChange={e => setUrl(e.target.value)} className="col-span-3" />
//                             </div>
//                         </div>
                        
//                         <DialogFooter>
//                             {/* <DialogClose asChild>
//                                 <Button type="button" variant="secondary">
//                                     Close
//                                 </Button>
//                             </DialogClose> */}
//                             <DialogClose asChild>
//                                 <Button type="submit" onClick={handleSave}>保存</Button>
//                             </DialogClose>
//                         </DialogFooter>
//                     </DialogContent>
//                 </Dialog>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={() => downloadFile(getSelectedData())}>下载文件</DropdownMenuItem>
//                 <DropdownMenuItem>开启跟价</DropdownMenuItem>
//                 <DropdownMenuItem>优化文案</DropdownMenuItem>
//                 <DropdownMenuItem>优化图片</DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// };


// type CustomColumnDef = ColumnDef<Payment> & { isVisible?: boolean };





// export const columns: ColumnDef<Payment>[] = [
    
    // {
    //     id: "select",
    //     // header: ({ table }) => (
    //     //     <Checkbox
    //     //         checked={
    //     //             table.getIsAllPageRowsSelected() ||
    //     //             (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
    //     //         }
    //     //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //     //         aria-label="Select all"
    //     //     />
    //     // ),
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllRowsSelected() ||
    //                 (table.getIsSomeRowsSelected() ? "indeterminate" : false)
    //             }
    //             onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
//     {
//         accessorKey: "status",
//         header: "Status",
//     },
//     {
//         accessorKey: "clientId",
//         header: "店铺ID",
//     },
//     {
//         accessorKey: "currency_code",
//         header: "国家",
//     },
//     {
//         accessorKey: "createdtime",
//         header: "创建时间",
//         cell: ({ row }) => {
//             const createdtime = row.getValue("createdtime") as string;
//             const createdtime_new = new Date(createdtime).toLocaleDateString();

//             return (
//                 <div className="text-left font-medium">
//                     {createdtime_new}
//                 </div>
//             );
//         },
//     },
//     {
//         accessorKey: "updatedtime",
//         header: "更新时间",
//         cell: ({ row }) => {
//             const createdtime = row.getValue("updatedtime") as string;
//             const createdtime_new = new Date(createdtime).toLocaleDateString();

//             return (
//                 <div className="text-left font-medium">
//                     {createdtime_new}
//                 </div>
//             );
//         },
//     },
//     {
//         accessorKey: "id",
//         header: ({ column }) => {
//             return (
//                 <Button
//                     variant="ghost"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     货架号
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                 </Button>
//             )
//         },
//         cell: ({ row }) => {
//             const productName = row.getValue("id") as string;
//             const shortProductName = typeof productName === "string" && productName.length > 10 ? productName.substring(0, 10) + '...' : productName;
//             const [showFullProductName, setShowFullProductName] = useState(false);

//             const handleClick = () => {
//                 setShowFullProductName(!showFullProductName);
//             };

//             return (
//                 <div className="text-left font-medium" onClick={handleClick}>
//                     {showFullProductName ? productName : shortProductName}
//                 </div>
//             );
//         },
//     },
//     {
//         accessorKey: "productName",
//         header: ({ column }) => {
//             return (
//                 <Button
//                     variant="ghost"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     名称
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                 </Button>
//             )
//         },
//         cell: ({ row }) => {
//             const productName = row.getValue("productName") as string;
//             const shortProductName = typeof productName === "string" && productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
//             const [showFullProductName, setShowFullProductName] = useState(false);

//             const handleClick = () => {
//                 setShowFullProductName(!showFullProductName);
//             };

//             return (
//                 <div className="text-left font-medium" onClick={handleClick}>
//                     {showFullProductName ? productName : shortProductName}
//                 </div>
//             );
//         },
//     },

//     {
//         accessorKey: "productditill",
//         header: "商品文案/图片",
//     },
//     {
//         accessorKey: "orPrice",
//         header: () => <div className="text-right">原价价格</div>,
//         cell: ({ row }) => {
//             const amount = parseFloat(row.getValue("orPrice"));
//             const currencyCode = row.getValue("currency_code");
//             // console.log(`currencyCode`, currencyCode);
//             const formatted = new Intl.NumberFormat("en-US", {
//                 style: "currency",
//                 currency: currencyCode as string,
//                 currencyDisplay: "narrowSymbol", // 设置为 narrowSymbol
//             }).format(amount);

//             return <div className="text-right font-medium">{formatted}</div>
//         },
//     },
//     {
//         accessorKey: "discountedPrice",
//         header: () => <div className="text-right">折扣价格</div>,
//         cell: ({ row }) => {
//             const amount = parseFloat(row.getValue("discountedPrice"));
//             const currencyCode = row.getValue("currency_code");

//             const formatted = new Intl.NumberFormat("en-US", {
//                 style: "currency",
//                 currency: currencyCode as string,
//                 currencyDisplay: "narrowSymbol", // 设置为 narrowSymbol
//             }).format(amount);

//             return <div className="text-right font-medium">{formatted}</div>
//         },
//     },
//     {
//         accessorKey: "min_price",
//         header: () => <div className="text-right">最低价格</div>,
//         cell: ({ row }) => {
//             const amount = parseFloat(row.getValue("min_price"));
//             const currencyCode = row.getValue("currency_code");

//             const formatted = new Intl.NumberFormat("en-US", {
//                 style: "currency",
//                 currency: currencyCode as string,
//                 currencyDisplay: "narrowSymbol", // 设置为 narrowSymbol
//             }).format(amount);


//             return <div className="text-right font-medium">{formatted}</div>
//         },
//     },
//     {
//         accessorKey: "realPrice",
//         header: () => <div className="text-right">跟价后价格</div>,
//         cell: ({ row }) => {
//             const amount = parseFloat(row.getValue("discountedPrice"))
//             const formatted = new Intl.NumberFormat("en-US", {
//                 style: "currency",
//                 currency: "USD",
//             }).format(amount)

//             return <div className="text-right font-medium">{formatted}</div>
//         },
//     },
//     {
//         id: "actions",
//         cell: ({ row ,table}) => <ActionsCell row={row} table={table} />,
//     },
// ]

