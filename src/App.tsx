import { invoke, event } from "@tauri-apps/api";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";

function App() {
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

  async function sendNotificationToDesktop(translatedText: string) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
      try {
        console.log("通知");
        sendNotification({ title: '翻訳されました', body: translatedText });
      } catch (error) {
        console.log(`Something went wrong: ${error}`);
      }
    } 
}


  return (
    <div>
      あいうえお
      <button onClick={() => callRustFunction()}>
        開始
      </button>
    </div>
  );
}

export default App;
