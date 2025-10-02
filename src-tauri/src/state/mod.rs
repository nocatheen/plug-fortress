use std::path::PathBuf;

use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::state::{app::AppState, game::GameDisplay, plug::PlugDisplay};

pub mod app;
pub mod device;
pub mod files;
pub mod game;
pub mod plug;

#[tauri::command]
pub async fn get_game_state(state: tauri::State<'_, AppState>) -> Result<GameDisplay, String> {
    state.display_game().await
}

#[tauri::command]
pub async fn get_plug_state(state: tauri::State<'_, AppState>) -> Result<PlugDisplay, String> {
    state.display_plug().await
}

#[tauri::command]
pub async fn set_websocket_address(
    app_handle: AppHandle,
    state: tauri::State<'_, AppState>,
    websocket_address: String,
) -> Result<(), String> {
    let mut plug = state.plug.lock().await;
    let store = app_handle.store("store.json").map_err(|e| e.to_string())?;
    store.set("websocket-address", websocket_address.clone());
    plug.websocket_address = websocket_address;
    Ok(())
}

#[tauri::command]
pub async fn set_game_path(
    app_handle: AppHandle,
    state: tauri::State<'_, AppState>,
    game_path: String,
) -> Result<(), String> {
    let mut game = state.game.lock().await;
    let store = app_handle.store("store.json").map_err(|e| e.to_string())?;
    store.set("game-path", game_path.clone());
    game.game_path = PathBuf::from(game_path);
    Ok(())
}

#[tauri::command]
pub async fn set_username(
    app_handle: AppHandle,
    state: tauri::State<'_, AppState>,
    username: String,
) -> Result<(), String> {
    let mut game = state.game.lock().await;
    let store = app_handle.store("store.json").map_err(|e| e.to_string())?;
    store.set("username", username.clone());
    game.username = username;
    Ok(())
}
