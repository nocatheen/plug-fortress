pub mod settings;

use settings::{SettingsManager, SettingsPatch, SettingsState};

#[tauri::command]
fn get_settings(manager: tauri::State<SettingsManager>) -> SettingsState {
    manager.get()
}

#[tauri::command]
fn set_settings(manager: tauri::State<SettingsManager>, settings: SettingsPatch) {
    manager.set(settings);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manager = SettingsManager::new(SettingsState {
        game_path: "".into(),
    });

    tauri::Builder::default()
        .manage(manager)
        .invoke_handler(tauri::generate_handler![get_settings, set_settings])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
