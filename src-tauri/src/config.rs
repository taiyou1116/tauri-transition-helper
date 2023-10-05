use crate::monitor_clipboard::BUNDLE_IDENTIFIER;
use crate::transition;
use dotenv::from_path;
use reqwest;
use std::io::Write;
use std::{env, fs::File};

pub struct Config {
    pub api_key: String,
}
impl Config {
    pub fn new(mut file: &File) -> Result<Self, env::VarError> {
        let data_dir = tauri::api::path::data_dir()
            .unwrap_or(std::path::PathBuf::from("./"))
            .join(BUNDLE_IDENTIFIER);
        let env_file_path = data_dir.join(".env");

        if let Err(e) = from_path(env_file_path) {
            writeln!(file, "dotenverror: {}", e).expect("dotenverror: e");
        }
        let api_key = env::var("GOOGLE_TRANSLATE_API_KEY")?;
        println!("{}", api_key);
        Ok(Self { api_key })
    }
}

// 開始時に有用か調べる関数
#[tauri::command]
pub async fn verify_api_key_on_startup() -> Result<(), String> {
    let data_dir = tauri::api::path::data_dir()
        .unwrap_or(std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER);
    // ない場合は作成
    if !data_dir.exists() {
        std::fs::create_dir(&data_dir).expect("error");
    }

    let env_file_path = data_dir.join(".env");

    if let Err(e) = from_path(env_file_path) {
        return Err(e.to_string());
    }
    let api_key = env::var("GOOGLE_TRANSLATE_API_KEY")
        .expect("msg")
        .to_string();

    // APIキーが有用かどうか調べる
    let client = reqwest::Client::new();
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

#[tauri::command]
pub async fn save_apikey(apikey: String) -> Result<(), String> {
    let data_dir = tauri::api::path::data_dir()
        .unwrap_or(std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER);
    // ない場合は作成
    if !data_dir.exists() {
        std::fs::create_dir(&data_dir).expect("error");
    }
    // このディレクトリにenvファイルを作成しAPI_KEYを書き込む
    let env_file_path = &data_dir.join(".env");
    let mut file = std::fs::File::create(env_file_path).expect("envファイルの作成に失敗しました");
    writeln!(file, "GOOGLE_TRANSLATE_API_KEY={}", &apikey).expect("書き込みに失敗しました");

    // APIキーが有用かどうか調べる
    let client = reqwest::Client::new();
    match transition::run(&apikey, "english", &client).await {
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
