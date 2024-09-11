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
import Workdashboad from "@/components/workdashboad";
import { Button } from "@/components/ui/button";
import { useRequest } from "ahooks";
import { toast } from "sonner";
import Cookies from 'js-cookie';

const Workflow: NextPage = memo(() => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [doneProgress, setDoneProgress] = useState(0);
  const [taskIds, setTaskIds] = useState<string[]>([]);

  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Step 1',
      selectedValue: '',
      prompt: '',
      shuruneirong: '',
      shuchuneirong: ''
    }
  ]);
  const [activeStep, setActiveStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [shuruneirong, setShuruneirong] = useState(''); // 初始值为 ''
  const [shuchuneirong, setShuchuneirong] = useState(''); // 初始值为 ''
  const { excelData, shuruData, setShuruData_new } = useExcelData();
  useEffect(() => {
    if (shuruData && shuruData.length > 0 && (selectedValue && shuruData[0][selectedValue] || selectedValue =='previous')) {
      // console.log('shuruData', shuruData);
      // console.log('shuruData_1', shuruData[0][selectedValue]);
      // console.log('activeStep', activeStep);
      console.log('steps', steps);
      setShuruneirong(shuruData[0][selectedValue])
      setShuchuneirong(shuchuneirong)
      const newSteps = [...steps];
      const stepIndex = newSteps.findIndex(s => s.id === activeStep);
      if (newSteps[stepIndex].selectedValue === 'previous' && stepIndex > 0) {
        newSteps[stepIndex].shuruneirong = newSteps[stepIndex - 1].shuchuneirong;
      } else {
        newSteps[stepIndex].shuruneirong = shuruData[0][newSteps[stepIndex].selectedValue];
      }
      setSteps(newSteps);
    }
  }, [shuruData, selectedValue, shuchuneirong, activeStep]);


  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    console.log('value', value);
    const newSteps = [...steps];
    const stepIndex = newSteps.findIndex(s => s.id === activeStep);
    if (stepIndex !== -1) {
      newSteps[stepIndex].selectedValue = value;
      setSteps(newSteps);
    }
  };




  const handleCreateStep = (event: React.MouseEvent) => {
    event.preventDefault();
    const newStepId = steps.length + 1;
    setSteps([...steps, {
      id: newStepId,
      title: `Step ${newStepId}`,
      selectedValue: '',
      prompt: '',
      shuruneirong: '',
      shuchuneirong: ''
    }]);
    setActiveStep(newStepId);
  };
  
  const handleStepClick = (id:any) => {
    setActiveStep(id);
  };


  const { runAsync: generate, data: ids } = useRequest(async (taskname) => {
    if (!excelData) {
      toast.error("Please input both description and user input");
      return;
    }
    let allData: { taskname: any; taskIds: string[]; }[] | PromiseLike<{ taskname: any; taskIds: string[]; }[] | undefined> | undefined = [];
    
    for (const step of steps) {
      // 创建一个数组，这个数组包含了所有的请求
      setSubmitProgress(0);
      let stepTaskIds = []; // 为每个步骤创建一个新的taskIds数组

      for (let i = 0; i < shuruData.length; i++) {
        const input = shuruData[i];
        const description = step.prompt;
        const sku = input.sku;
        const user_input = step.selectedValue === 'previous' ? input[`${step.id - 1}&churuneirong`] : input[step.selectedValue];

        try {
          const response = await fetch("/api/CreateTask_0", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description, user_input, sku, taskname }),
          });

          if (!response.ok) {
            throw new Error("请求失败");
          }

          const data = await response.json();
          if (data.taskId) {
            stepTaskIds.push(data.taskId); // 直接添加到stepTaskIds数组
          }
          setSubmitProgress(((i + 1) / shuruData.length) * 100);
        } catch (error) {
          toast.error(`提交任务 ${i + 1} 失败`);
          console.error(error);
        }
      }
      allData.push({ taskname: taskname, taskIds: stepTaskIds });

    }
    
    console.log(`allData`, allData);
    return allData;
  }, {
    manual: true,
    onSuccess: (allData) => {
      console.log(`allData`, allData);
      if (allData && allData.length > 0) {
        ask(allData[0]);
      } else {
        console.error('allData 为空或未定义');
      }
      toast.success("新操作成功完成");
      // setLoading(false);
    },
    onError: () => {
      toast.error("Gen music failed");
      // setLoading(false);
    }
  });


  const { runAsync: ask } = useRequest(async (allData) => {
    setDoneProgress(0);
    for (let i = 0; i < allData.taskIds.length; i++) {
      const taskId = allData.taskIds[i];
      let isCompleted = false;
      while (!isCompleted) {
        try {
          const response = await fetch("/api/AskTask", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId }),
          });

          if (!response.ok) {
            throw new Error("请求失败");
          }

          const data = await response.json();
          console.log('data_check_001', data);
          if (data.status === 'COMPLETED_OR_DELETED') {
            console.log('任务已完成或被删除');
            isCompleted = true;
            // 在这里处理任务完成的逻辑
          } else {
            console.log('任务状态:', data.status);
            // 等待一段时间后再次查询
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒后重试
          }

          setDoneProgress(((i + 1) / allData.taskIds.length) * 100);
        } catch (error) {
          toast.error(`获取任务 ${i + 1} 失败`);
          console.error(error);
          isCompleted = true; // 出错时也结束循环
        }
      }
    }
    return allData;
  }, {
    manual: true,
    onSuccess: (allData) => {
      getdata(allData.taskname);
      toast.success("所有任务已完成");
      setLoading(false);
    },
    onError: () => {
      toast.error("获取任务状态失败");
      setLoading(false);
    }
  });




  const { runAsync: getdata } = useRequest(async (taskname) => {
    const response = await fetch("/api/findtask", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskname }),
    });

    if (!response.ok) {
      throw new Error("请求失败");
    }

    const data = await response.json();
    console.log('data_check_002', data);
    if (data.TaskList) {
      const shuruData_new = shuruData.map((item: any) => {
        const matchingTask = data.TaskList.find((task: any) => String(task.sku) === String(item.sku));
        if (matchingTask) {
          return {
            ...item,
            // 添加 TaskList 中的其他字段
            ...matchingTask,
            // 根据需要添加更多字段
          };
        }
        return item;
      });
      setShuruData_new(shuruData_new);
      console.log(`shuruData_new`, shuruData_new);
    } else {

      // 等待一段时间后再次查询
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒后重试
    }
  }, {
    manual: true,
    onSuccess: () => {
      toast.success("所有任务已完成");
      setLoading(false);
    },
    onError: () => {
      toast.error("获取任务状态失败");
      setLoading(false);
    }
  });
  const onSubmit = async function () {
    const model = Cookies.get('model')
    const API_KEY = Cookies.get('apiKey');
    // console.log("model", model);
    // console.log("API_KEY", API_KEY);

    if (!model || !API_KEY) {
      alert('Please select a model and input your OpenAI API Key.');
      return null;
    }
    setLoading(true);
    const taskname = `${Math.random().toString(36).substring(7)}`;
    setTaskName(taskname);
    const data_1 = await generate(taskname);
    console.log('data_1', data_1);
    // if (data_1 && data_1.length > 0) {
    //   const data_2 = await ask(data_1[0]);
    //   console.log('data_2', data_2);
    //   if (data_2 && data_2.length > 0) {
    //     getdata(data_2.taskname);

    //   }
    // }

  };

  if (!excelData || excelData.length === 0) {
    return [];
  }
  // 假设 excelData 的第一行包含列名
  const columnNames = excelData[0];

  return (
    <div className="flex flex-col items-center justify-start py-8 px-0 box-border min-w-[480px] max-w-full ml-[-2px] text-left text-sm text-colors-text-text-quaternary-500 font-text-sm-semibold mq675:min-w-full mq450:pb-5 mq450:box-border mq800:pb-[21px] mq800:box-border">
      <div className="self-stretch flex flex-col items-start justify-start py-0 px-container-padding-desktop box-border gap-[9px] max-w-full">
        <div className="self-stretch flex flex-col items-start justify-start gap-[20px] max-w-full text-lg text-colors-text-text-primary-900">
          <div className="self-stretch flex flex-row items-center justify-between gap-[16px] max-w-full">
            <div className="flex flex-row items-center gap-[12px]">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`cursor-pointer px-4 py-2 rounded-md border ${activeStep === step.id ? 'border-component-colors-components-buttons-primary-button-primary-bg text-primary bg-gray-200' : 'border-gray-300 text-gray-500'}`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="relative leading-[20px] font-semibold inline-block min-w-[39px]">
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleCreateStep} className="cursor-pointer py-2 px-[13px] bg-white shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-md overflow-hidden flex flex-row items-center justify-center gap-[4px] border-[1px] border-solid border-gray-300">
              <img
                className="h-5 w-5 relative overflow-hidden shrink-0 min-h-[20px]"
                alt=""
                src="/pluscircle.svg"
              />
              <div className="flex flex-row items-center justify-center py-0 px-spacing-xxs">
                <div className="relative text-sm leading-[20px] font-semibold text-gray-700 text-left inline-block min-w-[81px]">
                  Create Step
                </div>
              </div>
            </button>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start py-0 px-0 box-border gap-[16px] max-w-full">
            {steps.map((step) =>
              activeStep === step.id ? (
                <Workdashboad
                  key={step.id}
                  columnNames={columnNames}
                  handleSelectChange={handleSelectChange}
                  prompt={step.prompt}
                  setPrompt={(newPrompt) => {
                    const newSteps = [...steps];
                    const stepIndex = newSteps.findIndex(s => s.id === step.id);
                    newSteps[stepIndex].prompt = newPrompt;
                    setSteps(newSteps);
                  }}
                  shuruneirong={step.shuruneirong}
                  setShuruneirong={(newShuruneirong) => {
                    const newSteps = [...steps];
                    const stepIndex = newSteps.findIndex(s => s.id === step.id);
                    newSteps[stepIndex].shuruneirong = newShuruneirong;
                    setSteps(newSteps);
                  }}
                  shuchuneirong={step.shuchuneirong}
                  setShuchuneirong={(newShuchuneirong) => {
                    const newSteps = [...steps];
                    const stepIndex = newSteps.findIndex(s => s.id === step.id);
                    newSteps[stepIndex].shuchuneirong = newShuchuneirong;
                    setSteps(newSteps);
                  }}
                  previousShuchuneirong={steps[step.id - 2]?.shuchuneirong || ''}
                />
              ) : null
            )}
          </div>
        </div>
      </div>
      <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${submitProgress}%` }}
        ></div>
      </div>
      <div className="mt-2">提交进度: {submitProgress.toFixed(2)}%</div>
      <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${doneProgress}%` }}
        ></div>
      </div>
      <div className="mt-2">完成进度: {doneProgress.toFixed(2)}%</div>

      <Button className="w-1/3 mt-4 font-bold" type="button" disabled={loading || isCompleted} onClick={onSubmit}>
        {(loading ? "Generating..." : "Generate")}
      </Button>
    </div>
  );
});

export default Workflow;
