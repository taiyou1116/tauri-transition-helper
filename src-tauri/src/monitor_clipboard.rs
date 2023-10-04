use crate::{config, transition};
use clipboard::{ClipboardContext, ClipboardProvider};
use reqwest;
use std::fs::File;
use std::io::Write;
use std::time::Duration;
use tauri::Window;

pub const BUNDLE_IDENTIFIER: &str = "com.taiyou.tauri-transition-helper";

// アプリのデバッグ用
fn init_data_dir() -> File {
    // データを保存するディレクトリを取得(なかったら現在のディレクトリに生成)
    let data_dir = tauri::api::path::data_dir()
        .unwrap_or(std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER);
    // エラー処理
    if !data_dir.exists() {
        std::fs::create_dir(&data_dir).expect("error");
    }
    // このディレクトリにログファイルを作成
    let log_file_path = &data_dir.join("app.log");
    let mut file = std::fs::File::create(log_file_path).expect("ログファイルの作成に失敗しました");
    writeln!(file, "アプリケーションが起動しました").expect("ログの書き込みに失敗しました");
    file
}

#[tauri::command]
pub async fn start_monitor_from_flont(window: Window) {
    let file: File = init_data_dir();

    let _join = tokio::spawn(async move {
        run(window, file).await;
    });
}

async fn run(window: Window, mut file: File) {
    let config_instance = config::Config::new(&file).expect("Failed to load config");
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
