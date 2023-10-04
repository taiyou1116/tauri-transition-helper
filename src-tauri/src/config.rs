use crate::monitor_clipboard::BUNDLE_IDENTIFIER;
use dotenv::from_path;
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

#[tauri::command]
pub async fn save_apikey(apikey: String) {
    let data_dir = tauri::api::path::data_dir()
        .unwrap_or(std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER);
    // ない場合は作成
    if !data_dir.exists() {
        std::fs::create_dir(&data_dir).expect("error");
    }
    // このディレクトリにログファイルを作成
    let env_file_path = &data_dir.join(".env");
    let mut file = std::fs::File::create(env_file_path).expect("ファイルの作成に失敗しました");
    writeln!(file, "GOOGLE_TRANSLATE_API_KEY={}", apikey).expect("書き込みに失敗しました");
}
