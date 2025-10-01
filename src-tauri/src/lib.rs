pub mod console;
pub mod plug;
pub mod settings;
pub mod state;

use std::{sync, time::Duration};
use tauri::Manager;

use crate::{
    console::{start_console, stop_console},
    plug::*,
    settings::{get_default_settings, get_settings, set_settings, SettingsManager},
    state::AppState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SettingsManager::new())
        .manage(sync::Mutex::new(AppState::new()))
        .manage(tokio::sync::Mutex::new(PlugState::new()))
        .setup(|app| {
            let app_handle = app.app_handle().to_owned();

            // There should be a better way than just polling current connection status every second,
            // but i have yet to find whether buttplug-rs client allows "subscribing" to some event like that.
            tauri::async_runtime::spawn(async move {
                let plug_state = app_handle.state::<tokio::sync::Mutex<PlugState>>();
                let settings = app_handle.state::<SettingsManager>();
                loop {
                    let ws_path = settings.get().websocket_address;
                    if let Err(e) = check_connection(
                        &app_handle,
                        plug_state.clone(),
                        &format!("ws://{}", ws_path),
                    )
                    .await
                    {
                        eprintln!("{e:?}");
                    } else {
                        tokio::time::sleep(Duration::from_millis(1000)).await;
                    };
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // settings
            get_settings,
            set_settings,
            get_default_settings,
            // logs
            start_console,
            stop_console,
            // plug
            get_plug_state,
            start_scanning,
            stop_scanning,
            list_devices,
            set_feature_max_step,
            select_device,
            test_selected,
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
