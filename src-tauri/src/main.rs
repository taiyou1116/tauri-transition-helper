// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
mod config;
mod monitor_clipboard;
mod transition;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let config = config::Config::new().expect("Failed to load config");

    let handle = tokio::spawn(async move {
        monitor_clipboard::run(&config.api_key).await;
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
