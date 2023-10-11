import Button from "./Button"
import { ChangeEvent } from "react";

type homeProps = {
  translating: boolean,
  handleStop: () => void,
  validApiKey: boolean,
  selectedLanguage: string,
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void,
  handleStart: () => void,
}

export default function HomeComponent(props: homeProps) {
  const {translating, handleStop, validApiKey, selectedLanguage, handleChange, handleStart} = props;
  return(
    <div>
      { translating ?(
        <Button 
          text="翻訳停止"
          variant="default"
          onClick={() => handleStop()}
        />
      ) : (
        validApiKey &&
        <div className="flex gap-3">
          <select 
            value={selectedLanguage} 
            onChange={(e) => handleChange(e)}
            className="border border-gray-500"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="zh-CN">中国語（簡体）</option>
            <option value="zh-TW">中国語（繁体）</option>
            <option value="ko">한국어</option>
          </select>
          <Button 
            text="翻訳開始"
            variant="primary"
            onClick={() => handleStart()}
            className="w-40"
          />
        </div>
      )}
    </div>
  )
}