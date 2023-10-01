use clipboard::ClipboardContext;
use clipboard::ClipboardProvider;
use reqwest;
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
    let mut content = None;

    let client = reqwest::Client::new();

    loop {
        // クリップボードからテキストを取得
        content = match ctx.get_contents() {
            Ok(contents) => Some(contents),
            Err(e) => {
                eprintln!("Error: {}", e);
                None // エラーが発生した場合はNoneを設定
            }
        };

        // `content` が Some(value) であり、`last_clipboard_content` と異なる場合
        if content.as_ref() != Some(&last_clipboard_content) {
            if let Some(c) = content {
                println!("New clipboard content: {}", c);
                last_clipboard_content = c;

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

        // 1秒待機（ポーリング間隔）
        tokio::time::sleep(Duration::from_secs(1)).await
    }
}
