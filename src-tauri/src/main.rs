// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod monitor_clipboard;
mod transition;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            monitor_clipboard::start_monitor_from_flont,
            config::save_apikey
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
