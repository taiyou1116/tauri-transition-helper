import { invoke, event } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

function App() {
  const [apikey, setApikey] = useState("");

  // Rustコード(start_monitor_from_flont)を実行
  async function callRustFunction() {
    try {
      // クリップボードを定期的に監視
      await invoke('start_monitor_from_flont');  
      // 開始ボタン -> 中止ボタンに
    } catch (error) {
      console.error(`Failed to run Rust function: ${error}`);
    }
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

  // 入力したAPIをdata_dirで管理する
  async function saveApiKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const promise = invoke('save_apikey', {apikey});
    toast.promise(
      promise,
      {
        loading: 'APIキー認証中',
        success: 'このAPIキーは有用です',
        error: 'このAPIキーは使えません',
      }
    )
    await promise;
  }

  return (
    <div>
      <button onClick={() => callRustFunction()}>
        開始
      </button>
      <form onSubmit={(e) => saveApiKey(e)}>
        <input type="text" placeholder="YOUR_API_KEY" onChange={(e) => setApikey(e.target.value)}/>
        <button type="submit">セットAPI</button>
      </form>

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
