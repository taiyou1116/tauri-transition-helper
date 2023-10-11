import { invoke } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { listen } from "@tauri-apps/api/event";
import { ChangeEvent } from "react";

import Button from "./components/Button";

function App() {
  const [apikey, setApikey] = useState("");
  const [usefulApiKey, setUsefulApiKey] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    // 設定しているAPIキーが使えるものか認証
    const initialize = async () => {
      let result;
      try {
        result = await invoke('verify_api_key_on_startup');
        setUsefulApiKey(true);
      } catch {
        console.log(`Err: ${result}`);
      }
    };
    initialize();

    // 通知が複数回呼ばれるのを防ぐ
    let already_unmounted = false; // マウントされた瞬間にアンマウントされる場合があるため用意
    let unlisten: () => void = () => {};
    
    (async () => {
      const unlsn = await listen<string>(
        "issueNotification",
        (event) => {
          console.log("Custom event received:", event.payload);
          sendNotificationToDesktop(event.payload as string);
        });
    
      if (already_unmounted) {
        unlsn();
      } else {
        unlisten = unlsn;
      }
    })();
    
    // クリーンアップ関数：コンポーネントのアンマウント時に実行
    return () => {
  
      already_unmounted = true;
    
      // イベントリッスン終了
      unlisten();
    };
  }, []);

  const executeInvoke = async (invokeName: string, payload?: any) => {
    try {
      await invoke(invokeName, payload);
      return true;
    } catch (error) {
      console.error(`Failed to run Rust function: ${error}`);
      return false;
    }
  };
  
  // APIキーを設定
  const handleSaveApiKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await executeInvoke('save_apikey', { apikey });
    toast[result ? 'success' : 'error'](result ? 'APIキーを設定しました' : 'このAPIキーは使えません');
    if (result) setUsefulApiKey(true);
  };

  const handleStart = async () => {
    if (!usefulApiKey) {
      toast.error("有用なAPIキーが設定されていません");
      return;
    }
    await executeInvoke('start_monitor_from_flont');
    setTranslating(true);
  };

  const handleStop = async () => {
    await executeInvoke('stop_transition');
    setTranslating(false);
  }

  const [selectedValue, setSelectedValue] = useState("ja");

  const handleChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    // Rustの言語に
    setSelectedValue(e.target.value);
    const setLanguage = e.target.value;
    await executeInvoke('set_language', {setLanguage});
  };

  // 翻訳された通知を出す
  const sendNotificationToDesktop = async (translatedText: string) => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
      try {
        sendNotification({ title: '翻訳されました', body: translatedText });
      } catch (error) {
        console.log(`Something went wrong: ${error}`);
      }
    } 
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-200">
      <div>
        <label htmlFor="fruit">Fruit: </label>
        <select id="fruit" value={selectedValue} onChange={(e) => handleChange(e)}>
          <option value="ja">日本語</option>
          <option value="en">English</option>
          <option value="zh-CN">中国語（簡体）</option>
          <option value="zh-TW">中国語（繁体）</option>
          <option value="ko">한국어</option>
        </select>
      </div>
      { translating ?(
        <Button 
          text="翻訳停止"
          variant="default"
          onClick={() => handleStop()}
        />
      ) : (
        usefulApiKey &&
        <Button 
          text="翻訳開始"
          variant="primary"
          onClick={() => handleStart()}
          className="w-40"
        />
      )}
      { usefulApiKey ? (
          <div className="flex items-center space-x-2 mt-20 border border-gray-300 py-2 px-4 rounded-md shadow-sm">
            <span className="text-lg text-green-600">有用なAPIキーが設定されています</span>
            <Button 
              text="再度APIキーを設定する"
              variant="default"
              onClick={() => {setUsefulApiKey(false);}}
            />
          </div>
      ) : (
        <form onSubmit={(e) => handleSaveApiKey(e)} className="flex items-center space-x-2 mt-4">
          <input 
            type="text" 
            placeholder="YOUR_API_KEY" 
            onChange={(e) => setApikey(e.target.value)} 
            className="px-4 py-2 border rounded-md"/>
          <Button 
            text="APIキーをセット"
            variant="success"
            type="submit"
          />
        </form>
      )}

      {/* フロント通知 */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className:'bg-gray-50 dark:bg-slate-600 dark:text-white rounded-md shadow-md'
        }}
      />
    </div>
  );
}

export default App;
