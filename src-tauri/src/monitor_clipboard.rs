use clipboard::osx_clipboard::OSXClipboardContext;
use clipboard::ClipboardContext;
use clipboard::ClipboardProvider;
use reqwest;
use std::sync::Arc;
use std::time::Duration;

use crate::transition;

// 仮にこのようにラッパーを作成
struct SafeOSXClipboardContext(OSXClipboardContext);

// Sendトレイトを手動で実装
unsafe impl Send for SafeOSXClipboardContext {}

pub async fn run(api_key: &str, client: &Arc<reqwest::Client>) {
    let mut ctx: ClipboardContext = match ClipboardProvider::new() {
        Ok(context) => context,
        Err(e) => {
            eprintln!("{}", e);
            return;
        }
    };

    let mut last_clipboard_content = String::new();

    // let client = reqwest::Client::new();
    // let client = Arc::new(client); // Arcでラップする

    loop {
        // クリップボードからテキストを取得
        match ctx.get_contents() {
            Ok(contents) => {
                if last_clipboard_content != contents {
                    // クリップボードの内容が前回と異なる場合
                    println!("New clipboard content: {}", contents);
                    last_clipboard_content = contents;

                    // ここで翻訳とデスクトップ通知を行う
                    match transition::run(&api_key, &last_clipboard_content, &client).await {
                        Ok(_) => {
                            // 通知
                        }
                        Err(e) => {
                            eprintln!("Error: {}", e.to_string());
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error: {}", e.to_string());
            }
        }

        // 1秒待機（ポーリング間隔）
        tokio::time::sleep(Duration::from_secs(1)).await
    }
}
