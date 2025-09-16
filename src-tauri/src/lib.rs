pub mod settings;

use crate::settings::{SettingsDisplay, SettingsManager, SettingsPatch};

#[tauri::command]
fn get_settings(manager: tauri::State<SettingsManager>) -> SettingsDisplay {
    manager.get()
}

#[tauri::command]
fn get_default_settings(manager: tauri::State<SettingsManager>) -> SettingsDisplay {
    manager.get_default()
}

#[tauri::command]
fn set_settings(manager: tauri::State<SettingsManager>, settings: SettingsPatch) {
    manager.set(settings);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SettingsManager::new())
        .invoke_handler(tauri::generate_handler![get_settings, set_settings, get_default_settings])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
