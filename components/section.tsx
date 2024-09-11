import type { NextPage } from "next";
import { memo, useState } from "react";
import {
  TextField,
  InputAdornment,
  Icon,
  IconButton,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ExcelDataProvider } from '@/contexts/AppContext';
import { useExcelData } from '@/contexts/AppContext';
import { DemoPage } from '@/components/payments/page';
import UploadButton from '../components/upload';
import { useEffect } from 'react';
import MoniButton from "../components/moni";


const Section = ({ data, workflowurl }: { data: any, workflowurl: any }) => {

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-[557px] box-border flex flex-col items-start justify-start py-8 pr-0 pl-[31px] gap-[24px] min-w-[480px] max-w-full text-left text-lg text-colors-text-text-primary-900 font-text-sm-semibold border-r-[1px] border-solid border-colors-border-border-secondary mq675:min-w-full mq450:pt-5 mq450:pb-5 mq450:box-border mq800:pt-[21px] mq800:pb-[21px] mq800:box-border">
        <div className="w-[489px] flex flex-col items-start justify-start py-0 pr-5 pl-0 box-border gap-[20px] max-w-full">
          <div className="self-stretch flex flex-row items-start justify-start gap-[16px] mq450:flex-wrap">
            <div className="flex-1 flex flex-col items-start justify-center py-2 px-0 box-border gap-[4px] min-w-[147px]">
              <div className="self-stretch relative leading-[28px] font-semibold flex justify-between items-center">
                <div>文档内容</div>
                <MoniButton />
              </div>
              <div className="self-stretch h-5 relative text-sm leading-[20px] text-component-colors-components-buttons-tertiary-button-tertiary-fg hidden overflow-hidden text-ellipsis whitespace-nowrap">
                Manage your team members and their account permissions here.
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-[670px] relative shadow-[0px_1px_2px_rgba(16,_24,_40,_0.05)] rounded-radius-xl bg-colors-background-bg-primary box-border overflow-auto shrink-0 max-w-full text-sm border-[1px] border-solid border-colors-border-border-secondary mq450:h-auto mq450:min-h-[670]">
          {workflowurl ? (
            <img src={workflowurl} alt="description" style={{ maxWidth: '100%', height: 'auto' }} />
          ) : (
            data && <DemoPage />
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
};


export default Section;


