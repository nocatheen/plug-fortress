pub mod console;
pub mod state;

use tauri::Manager;

use crate::state::{app::AppState, plug::*, *};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .setup(|app| {
            let app_handle = app.app_handle().to_owned();
            tauri::async_runtime::spawn(async move {
                let state = app_handle.state::<AppState>();
                state.plug.lock().await.init(&app_handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_game_state,
            get_plug_state,
            set_game_path,
            set_username,
            set_websocket_address,
            connect_to_server,
            start_scanning,
            stop_scanning,
            toggle_device,
            set_max_step,
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
