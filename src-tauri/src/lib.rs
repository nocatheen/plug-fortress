pub mod console;
pub mod settings;
pub mod state;

use std::sync::Mutex;

use crate::{
    console::{start_console, stop_console},
    settings::{get_default_settings, get_settings, set_settings, SettingsManager},
    state::AppState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SettingsManager::new())
        .manage(Mutex::new(AppState::new()))
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            get_default_settings,
            start_console,
            stop_console,
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
