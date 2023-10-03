use crate::{config, transition};
use clipboard::{ClipboardContext, ClipboardProvider};
use dotenv::dotenv;
use reqwest;
use std::time::Duration;
use tauri::Window;

#[tauri::command]
pub async fn start_monitor_from_flont(window: Window) {
    let join = tokio::spawn(async move {
        run(window).await;
    });
}

async fn run(window: Window) {
    dotenv().ok();
    let config_instance = config::Config::new().expect("Failed to load config");
    let api_key = config_instance.api_key;

    let mut ctx: ClipboardContext = match ClipboardProvider::new() {
        Ok(context) => context,
        Err(e) => {
            eprintln!("{}", e);
            return;
        }
    };

    let mut last_clipboard_content = String::new();
    let mut contents = None;

    let client = reqwest::Client::new();

    loop {
        // クリップボードからテキストを取得
        contents = match ctx.get_contents() {
            Ok(ctx_contents) => Some(ctx_contents),
            Err(e) => {
                eprintln!("Error: {}", e);
                None // エラーが発生した場合はNoneを設定
            }
        };

        // `content` が Some(value) であり、`last_clipboard_content` と異なる場合
        if contents.as_ref() != Some(&last_clipboard_content) {
            if let Some(c) = contents {
                println!("New clipboard content: {}", c);
                last_clipboard_content = c;

                // ここで翻訳とデスクトップ通知を行う
                match transition::run(&api_key, &last_clipboard_content, &client).await {
                    Ok(translated_text) => {
                        // 通知
                        if let Err(e) = window.emit("issueNotification", Some(translated_text)) {
                            eprintln!("Failed to emit event: {}", e);
                        }
                    }
                    Err(e) => {
                        eprintln!("Error: {}", e.to_string());
                    }
                }
            }
        }

        // 1秒待機（ポーリング間隔）
        tokio::time::sleep(Duration::from_secs(1)).await
    }
}
