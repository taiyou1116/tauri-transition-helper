// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv;
use reqwest;
use serde_json::Value;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    dotenv::dotenv().ok();
    let api_key =
        std::env::var("GOOGLE_TRANSLATE_API_KEY").expect("GOOGLE_TRANSLATE_API_KEY must be set");
    let text_to_translate = "Hello world";
    let target_language = "ja";

    let url = format!(
        "https://translation.googleapis.com/language/translate/v2?key={}",
        api_key
    );

    let mut payload = HashMap::new();
    payload.insert("q", text_to_translate);
    payload.insert("target", target_language);

    let client = reqwest::Client::new();
    let res: Value = client
        .post(&url)
        .json(&payload)
        .send()
        .await?
        .json()
        .await?;

    match res["data"]["translations"][0]["translatedText"].as_str() {
        Some(translated_text) => println!("Translated text: {}", translated_text),
        None => println!("Translation failed"),
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
