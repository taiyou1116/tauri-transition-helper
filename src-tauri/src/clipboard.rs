use clipboard::ClipboardContext;
use clipboard::ClipboardProvider;
use std::time::Duration;

use crate::transition;

pub async fn run(api_key: &str) {
    let mut ctx: ClipboardContext = match ClipboardProvider::new() {
        Ok(context) => context,
        Err(e) => {
            eprintln!("{}", e);
            return;
        }
    };
    let mut last_clipboard_content = String::new();

    let client = reqwest::Client::new();

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
                            eprintln!("Error: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }

        // 1秒待機（ポーリング間隔）
        tokio::time::sleep(Duration::from_secs(1)).await
    }
}
