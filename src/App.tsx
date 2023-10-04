import { invoke, event } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { useState } from "react";

function App() {
  const [success, setSuccess] = useState("...");
  const [call, setCall] = useState("...");
  const [noti, setNoti] = useState("...");

  async function callRustFunction() {
    try {
      // Rust側で定義した関数を実行
      await invoke('start_monitor_from_flont');  
      setSuccess("成功");
    } catch (error) {
      console.error(`Failed to run Rust function: ${error}`);
      setSuccess("失敗");
    }
  }

  // イベントを実行
  event.listen('issueNotification', (event) => {
    console.log("Custom event received:", event.payload);
    sendNotificationToDesktop(event.payload as string);
    setCall("呼ばれた");
  });

  const sendNotificationToDesktop = async (translatedText: string) => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
      try {
        await sendNotification({ title: '翻訳されました', body: translatedText });
        setNoti("noti");
      } catch (error) {
        console.log(`Something went wrong: ${error}`);
      }
    } 
  }

  return (
    <div>
      <button onClick={() => callRustFunction()}>
        開始
      </button>
      <div>
        { success }
      </div>
      <div>
        { call }
      </div>
      <div>
        { noti }
      </div>
    </div>
  );
}

export default App;
