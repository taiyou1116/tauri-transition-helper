use crate::monitor_clipboard::BUNDLE_IDENTIFIER;
use crate::transition;
use dotenv::from_path;
use reqwest;
use std::io::Write;
use std::path::PathBuf;
use std::{env, fs::File};

fn get_data_dir() -> PathBuf {
    tauri::api::path::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER)
}

pub struct Config {
    pub api_key: String,
}
impl Config {
    pub fn new(mut file: &File) -> Result<Self, env::VarError> {
        let env_file_path = get_data_dir().join(".env");

        if let Err(e) = from_path(env_file_path) {
            writeln!(file, "dotenverror: {}", e).expect("dotenverror: e");
        }
        let api_key = env::var("GOOGLE_TRANSLATE_API_KEY")?;
        println!("{}", api_key);
        Ok(Self { api_key })
    }
}

// APIが使えるかテスト
async fn run_transition_test(apikey: Option<String>) -> Result<(), String> {
    let api_key = match apikey {
        Some(key) => key,
        None => env::var("GOOGLE_TRANSLATE_API_KEY")
            .expect("msg")
            .to_string(),
    };

    let client = reqwest::Client::new();
    println!("{}", api_key);
    match transition::run(&api_key, "english", &client).await {
        Ok(translated_text) => {
            println!("Text: {}", translated_text);
            Ok(())
        }
        Err(e) => {
            eprintln!("Error: {}", e.to_string());
            Err(e)
        }
    }
}

// 開始時にAPIキーが有用か調べる
#[tauri::command]
pub async fn verify_api_key_on_startup() -> Result<(), String> {
    let env_file_path = get_data_dir().join(".env");

    if let Err(e) = from_path(env_file_path) {
        return Err(e.to_string());
    }
    run_transition_test(None).await
}

// フロントからAPIキーを設定する
#[tauri::command]
pub async fn save_apikey(apikey: String) -> Result<(), String> {
    let env_file_path = get_data_dir().join(".env");

    let mut file = std::fs::File::create(env_file_path).expect("envファイルの作成に失敗しました");
    writeln!(file, "GOOGLE_TRANSLATE_API_KEY={}", &apikey).expect("書き込みに失敗しました");

    run_transition_test(Some(apikey)).await
}
