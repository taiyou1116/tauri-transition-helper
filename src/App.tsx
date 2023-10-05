import { invoke, event } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

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
    <div>
      { translating ? (
        <button onClick={() => handleStop()}>
          中止
        </button>
      ) : (
        <button onClick={() => handleStart()}>
          開始
        </button>
      )}
      
      { usefulApiKey ? (
        <div>
          有用なAPIキーが設定されています
          <button onClick={() => {setUsefulApiKey(false);}}>再度APIキーを設定する</button>
        </div>
      ) : (
        <form onSubmit={(e) => handleSaveApiKey(e)}>
          <input type="text" placeholder="YOUR_API_KEY" onChange={(e) => setApikey(e.target.value)}/>
          <button type="submit">セットAPI</button>
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
