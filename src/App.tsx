import { invoke, event } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useState } from "react";

function App() {
  const [apikey, setApikey] = useState("");

  // Rustコード(start_monitor_from_flont)を実行
  async function callRustFunction() {
    try {
      // Rust側で定義した関数を実行
      await invoke('start_monitor_from_flont');  
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
  async function setApi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await invoke('save_apikey', {apikey});
    } catch {
      console.log("Err: cannt save apikey");
    }
  }

  return (
    <div>
      <button onClick={() => callRustFunction()}>
        開始
      </button>
      <form onSubmit={(e) => setApi(e)}>
        <input type="text" placeholder="YOUR_API_KEY" onChange={(e) => setApikey(e.target.value)}/>
        <button type="submit">セットAPI</button>
      </form>
    </div>
  );
}

export default App;
