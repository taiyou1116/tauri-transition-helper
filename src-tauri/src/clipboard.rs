use clipboard::ClipboardContext;
use clipboard::ClipboardProvider;
use std::thread;
use std::time::Duration;

use crate::transition;

pub async fn run(api_key: &str) {
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
    let mut last_clipboard_content = String::new();

    loop {
        // クリップボードからテキストを取得
        match ctx.get_contents() {
            Ok(contents) => {
                if last_clipboard_content != contents {
                    // クリップボードの内容が前回と異なる場合
                    println!("New clipboard content: {}", contents);
                    last_clipboard_content = contents;

                    // ここで翻訳とデスクトップ通知を行う
                    // transition::run(&contents);
                    match transition::run(&api_key, &last_clipboard_content).await {
                        Ok(_) => {
                            println!("good job!")
                        }
                        Err(e) => {
                            eprintln!("{}", e);
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error: {}", e);
            }
        }

        // 1秒待機（ポーリング間隔）
        thread::sleep(Duration::from_secs(1));
    }
}
