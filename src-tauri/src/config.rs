use crate::monitor_clipboard::BUNDLE_IDENTIFIER;
use crate::transition;
use reqwest;
use std::collections::HashMap;
use std::env;
use std::fs;
use std::io::Write;
use std::path::PathBuf;

fn get_data_dir() -> PathBuf {
    tauri::api::path::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER)
}

pub struct Config {
    pub api_key: String,
    pub language: String,
}
impl Config {
    pub fn new() -> Result<Self, env::VarError> {
        let api_key = env::var("GOOGLE_TRANSLATE_API_KEY")?;
        let language = env::var("LANGUAGE")?;
        Ok(Self { api_key, language })
    }
}

// APIが使えるかテスト
async fn run_transition_test(apikey: Option<String>) -> Result<(), String> {
    let api_key = match apikey {
        Some(key) => key,
        None => env::var("GOOGLE_TRANSLATE_API_KEY")
            .expect("google api keyが取得できませんでした")
            .to_string(),
    };

    let client = reqwest::Client::new();
    match transition::run(&api_key, "a", &client).await {
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
    let data_dir = tauri::api::path::data_dir()
        .unwrap_or(std::path::PathBuf::from("./"))
        .join(BUNDLE_IDENTIFIER);
    // data_dirがなければ作成
    if !data_dir.exists() {
        std::fs::create_dir(&data_dir).expect("error");
    }
    let env_file_path = get_data_dir().join(".env");

    if !env_file_path.exists() {
        let file = std::fs::File::create(&env_file_path).expect("envファイルの作成に失敗しました");
        // 初期値のLANGUAGEを入れる
        writeln!(&file, "LANGUAGE=ja\n").expect("languageの設定に失敗しました");
    }
    dotenv::from_path(&env_file_path).ok();
    run_transition_test(None).await
}

// envファイルのvalueを変更(KEYがなかったら作成)
fn change_environment_value(key: String, value: &str) -> Result<(), String> {
    let env_file_path = get_data_dir().join(".env");
    // envファイルの値を即座に反映
    env::set_var(&key, &value);
    let content = fs::read_to_string(&env_file_path).map_err(|e| e.to_string())?;
    let mut env_map: HashMap<String, String> = HashMap::new();

    // 2. キーと値のペアを解析
    for line in content.lines() {
        let parts: Vec<&str> = line.split('=').collect();
        if parts.len() == 2 {
            env_map.insert(parts[0].to_string(), parts[1].to_string());
        }
    }
    // 3. キーの値を更新
    env_map.insert(key, value.to_string());

    // 4. HashMapを.env形式に (KEY=VALUE)
    let mut new_content = String::new();
    for (key, value) in env_map.iter() {
        new_content.push_str(&format!("{}={}\n", key, value));
    }

    // 5. ファイルを上書き保存
    let mut file = std::fs::OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(&env_file_path)
        .map_err(|e| e.to_string())?;

    file.write_all(new_content.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}

// フロントからAPIキーを設定する
#[tauri::command]
pub async fn save_apikey(apikey: String) -> Result<(), String> {
    match change_environment_value("GOOGLE_TRANSLATE_API_KEY".to_string(), &apikey) {
        Ok(_) => run_transition_test(Some(apikey)).await,
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn save_language(set_language: String) -> Result<(), String> {
    change_environment_value("LANGUAGE".to_string(), &set_language)?;

    Ok(())
}
