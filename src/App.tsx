import { invoke } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { listen } from "@tauri-apps/api/event";
import { ChangeEvent } from "react";

import SetApiComponent from "./components/SetApi";
import HomeComponent from "./components/Home";

function App() {
  const [apikey, setApikey] = useState("");
  const [validApiKey, setValidApiKey] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ja");

  useEffect(() => {
    // 設定しているAPIキーが使えるものか認証
    const initialize = async () => {

      const result = await executeInvoke('verify_api_key_on_startup');
      if (result) setValidApiKey(true);
      
      try {
        const ln = await invoke('confirm_language_on_startup');
        setSelectedLanguage(ln as string);
      } catch {
        console.log(`Err: languageを取得できませんでした`);
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

  // invoke処理をまとめる(結果をbooleanで受け取れる)
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
    if (result) setValidApiKey(true);
  };

  const handleStart = async () => {
    if (!validApiKey) {
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

  // 言語を変更
  const handleChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    // Rustの言語に
    setSelectedLanguage(e.target.value);
    const setLanguage = e.target.value;
    await executeInvoke('save_language', {setLanguage});
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
      <HomeComponent 
        translating={translating}
        validApiKey={validApiKey}
        selectedLanguage={selectedLanguage}
        handleChange={handleChange}
        handleStart={handleStart}
        handleStop={handleStop}
      />
      <SetApiComponent 
        validApiKey={validApiKey}
        setValidApiKey={setValidApiKey}
        handleSaveApiKey={handleSaveApiKey}
        setApikey={setApikey}
      />

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
