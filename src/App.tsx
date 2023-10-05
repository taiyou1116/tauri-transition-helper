import { invoke, event } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

import Button from "./components/Button";

function App() {
  const [apikey, setApikey] = useState("");
  const [usefulApiKey, setUsefulApiKey] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
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

  }

  // イベントを実行
  event.listen('issueNotification', (event) => {
    console.log("Custom event received:", event.payload);
    sendNotificationToDesktop(event.payload as string);
  });

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
      { translating ? (
        <Button 
          text="翻訳停止"
          variant="default"
          onClick={() => handleStop()}
        />
      ) : (
        <Button 
          text="翻訳開始"
          variant="primary"
          onClick={() => handleStart()}
        />
      )}
      { usefulApiKey ? (
        <div className="flex items-center space-x-2 mt-4">
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
