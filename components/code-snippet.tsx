import type { NextPage } from "next";
import { memo, useMemo, type CSSProperties } from "react";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import React, { useState, useEffect } from 'react';


export type CodeSnippetType = {
  /** Style props */
  propAlignSelf?: CSSProperties["alignSelf"];
  propHeight?: CSSProperties["height"];
  propWidth?: CSSProperties["width"];
  propMinWidth?: CSSProperties["minWidth"];
  propMaxWidth?: CSSProperties["maxWidth"];
  propHeight1?: CSSProperties["height"];
  propPadding?: CSSProperties["padding"];
  propMaxHeight?: CSSProperties["maxHeight"];
  name?:string;
  text_moren?:string;
  onTextChange?: (text: string) => void;
};

const CodeSnippet: NextPage<CodeSnippetType> = memo(
  ({
    propAlignSelf,
    propHeight,
    propWidth,
    propMinWidth,
    propMaxWidth,
    propHeight1,
    propPadding,
    propMaxHeight,
    name,
    text_moren = '',
    onTextChange
  }) => {
    const codeSnippetStyle: CSSProperties = useMemo(() => {
      return {
        alignSelf: propAlignSelf,
        height: propHeight,
        width: propWidth,
        minWidth: propMinWidth,
        maxWidth: propMaxWidth,
        padding: propPadding,
        maxHeight: propMaxHeight,
        name: name,
        text_moren: text_moren,
      };
    }, [propAlignSelf, propHeight, propWidth, propMinWidth, propMaxWidth, propPadding, propMaxHeight, name, text_moren]);

    const [text, setText] = useState(text_moren);
    const [height, setHeight] = useState('126px'); // 初始高度为126px
    useEffect(() => {
      if (text) {
        const textStr = String(text);
        setHeight(`${Math.min(Math.max(textStr.length * 0.05, textStr.split('\n').length) * 30, 667)}px`);
      } else {
        setHeight('126px');
      }
    }, [text]);
    useEffect(() => {
      setText(text_moren);
    }, [text_moren]);

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
      if (onTextChange) {
        onTextChange(event.target.value);
      }
    };

    return (
      <div
        className="self-stretch min-h-[126px] min-w-[200px] max-w-[500px] rounded-radius-xl bg-colors-background-bg-primary box-border overflow-hidden shrink-0 flex flex-row items-start justify-center text-left text-sm text-colors-text-text-quaternary-500 font-roboto-mono border-[1px] border-solid border-colors-border-border-secondary"
        style={codeSnippetStyle}
      >
        
        <div className="grid w-full gap-1.5">
          <Label htmlFor="message-2">{name}</Label>
          <Textarea
            placeholder=""
            id="message-2"
            value={text}
            onChange={handleTextChange}
            style={{ height: height }} 
          />
          {/* <p className="text-sm text-muted-foreground">
            Your message will be copied to the support team.
          </p> */}
        </div>
      </div>
    );
  }
);

export default CodeSnippet;
