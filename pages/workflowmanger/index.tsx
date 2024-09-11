// import type { Payment } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import React, { useEffect, useState, useRef } from 'react';
import { useExcelData } from '@/contexts/AppContext';
import path from 'path';

export  function DemoPage() {
    const { setExcelData, setWorkflowData } = useExcelData(); 
    const [result, setResult] = useState([]);
    const [jsonData_off, setJsonData_off] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/readworkflow', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ })
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Data:', data);
                    setResult(data.result);
                    // setExcelData(data.excelData);
                    // setJsonData_off(data.jsonData);
                    // setWorkflowData(data.jsonData);
                } else {
                    console.error('Server error:', await res.text());
                }
            } catch (e) {
                console.error('Error fetching:', e);
            }
        };

        fetchData(); // 调用 fetchData 函数
    }, []);

     
    const data = (result || []).length > 0 ? result : result;
    // 选择 data 中的第2 行到第 10 行
    const selectedData = (result || []).length > 0 ? (data || []).slice(1) : [];
    // 选择 columns 中的前12 个
    
    const columnNames = (result || []).length > 0 ? Object.keys(result[0]) : result[0];
    console.log('selectedData', selectedData);

    
    const formattedData = (result || []).length > 0 ? result :
        selectedData.map((item: any[], index: number) => {
            const newItem: { [key: string]: any } = {};

            columnNames.forEach((column: string, columnIndex: number) => {
                if (item[columnIndex] !== null && item[columnIndex] !== undefined) {
                    newItem[column] = item[columnIndex];
                }
            });

            return newItem;
        });
    console.log('columnNames', columnNames);
    console.log('formattedData', formattedData);
    const selectedColumns = columns(columnNames)
    console.log('selectedColumns', selectedColumns);
    return (<div className="container mx-auto py-10">
        <DataTable columns={selectedColumns} data={formattedData} />
    </div>)
}

export default DemoPage;



// export function Page(selectedOptions, currentPage, getData, isFirstOpen) {
//     const [selectedOptions_z, setSelectedOptions_z] = useState([]);
//     const [selectedOptions_d, setSelectedOptions_d] = useState([]);
//     const [data, setData] = useState([])
//     const prevSelectedOptionsRef = useRef();


//     useEffect(() => {
//         prevSelectedOptionsRef.current = selectedOptions;
//     }, [selectedOptions]);
//     const prevSelectedOptions = prevSelectedOptionsRef.current;
//     useEffect(() => {
//         const incrementalOptions = findIncrementalOptions(selectedOptions, prevSelectedOptions);
//         setSelectedOptions_z(incrementalOptions);
//         console.log('incrementalOptions', incrementalOptions);
//         const decrementalOptions = findDecrementalOptions(selectedOptions, prevSelectedOptions);
//         setSelectedOptions_d(decrementalOptions);
//         console.log('decrementalOptions', decrementalOptions);
//     }, [selectedOptions, prevSelectedOptions]);
//     console.log('prevSelectedOptions', prevSelectedOptions);
//     console.log('selectedOptions', selectedOptions);

//     useEffect(() => {
//         async function fetchData() {
//             if (selectedOptions_z.length > 0) {
//                 const promises = selectedOptions_z.map(async option => {
//                     const { label: clientId, value: apiKey } = option;
//                     try {
//                         const result = await getData(clientId);
//                         setData(prevData => [...prevData, ...result]);
//                     } catch (err) {
//                         console.error('API error:', err);
//                     }
//                 });
//                 try {
//                     await Promise.all(promises);
//                 } catch (error) {
//                     console.error('Error fetching data:', error);
//                 }
//             } else if (selectedOptions_d.length > 0) {
//                 // 减量查询，缺乏clientId字段导致无法正常减员
//                 setData(prevData => prevData.filter(item => !selectedOptions_d.some(option => option.label === item.clientId)));
//             } else if (isFirstOpen) {
//                 // 全量查询
//                 setData([])
//                 const promises = selectedOptions.map(async option => {
//                     const { label: clientId, value: apiKey } = option;
//                     try {
//                         const result = await getData(clientId);
//                         if (currentPage ==='demo'){
//                         let skuinfochengxianName = `sku_info_chengxian_${clientId}`;
//                         await set(skuinfochengxianName, result).catch(err => console.error('IndexedDB error:', err));
//                             console.log('设置 check', skuinfochengxianName);
//                         }
//                         setData(prevData => [...prevData, ...result]);
//                     } catch (err) {
//                         console.error('API error:', err);
//                     }
//                 });
//                 try {
//                     await Promise.all(promises);
//                 } catch (error) {
//                     console.error('Error fetching data:', error);
//                 }
//             }
//             else {
//                 return
//             }
//         }
//         fetchData();
//     }, [selectedOptions, selectedOptions_z, selectedOptions_d]);

//     if (data === null) {
//         return <div>Loading...</div>;
//     }
//     // console.log('order_list_check');
//     console.log('data_wai', data);
//     console.log('columns', columns);
//     return data
// }


// async function getData(clientId): Promise<Payment[]> {

//     try {
//         let skuListName = `sku_info_${clientId}`;  // 使用模板字符串插入 clientId 的值
//         const data = await get(skuListName)
//         console.log('data_nei', data);
//         const formattedData = data.map(item => ({
//             id: item.offer_id,
//             id_p: item.id,
//             clientId: clientId,
//             currency_code: item.currency_code,
//             orPrice: item.old_price,
//             discountedPrice: item.price,
//             status: "pending",
//             productName: item.name,
//             images: item.images,
//             discount: 100,
//             realPrice: item.price,
//             min_price: item.min_price,
//             productditill: "m@example.com",
//             createdtime: item.created_at,
//             updatedtime: item.updated_at,

//         }));

//         return formattedData; // 返回从 API 获取的数据
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return [
//             // ...
//         ]; // 或者其他默认值
//     }
// }



// export function DemoPage({ selectedOptions ,currentPage}) {
//     const [isFirstOpen, setIsFirstOpen] = useState(true);
//     console.log('isFirstOpen', isFirstOpen);
//     useEffect(() => {
//         // 这里的逻辑只会在组件首次渲染到 DOM 后执行一次
//         setIsFirstOpen(false);
//     }, []);  // 空依赖
//     const data = Page(selectedOptions, currentPage,getData,isFirstOpen)
    
//     return (<div className="container mx-auto py-10">
//         <DataTable columns={columns} data={data as any[]} />
//     </div>)
// }

