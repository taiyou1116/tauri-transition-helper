import { invoke } from "@tauri-apps/api";
import { event } from "@tauri-apps/api";
import "./App.css";

function App() {
  async function callRustFunction() {
    try {
      await invoke('start_monitor_from_flont');  // Rust側で定義した関数名を指定
    } catch (error) {
      console.error(`Failed to run Rust function: ${error}`);
    }
  }

  // この部分を追加
  event.listen('myCustomEvent', (event) => {
    console.log("Custom event received:", event?.payload);
    myCustomEvent();
  });

  function myCustomEvent() {
    console.log("Nice:");
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
