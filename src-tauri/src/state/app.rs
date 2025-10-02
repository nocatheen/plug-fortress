use std::{path::PathBuf, str::FromStr, sync::Arc};

use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

use crate::{
    console::ParserManager,
    state::{
        files::{find_game_path, find_user_name, path_to_string},
        game::{GameDisplay, GameState},
        plug::{PlugDisplay, PlugState},
    },
};

pub struct AppState {
    pub game: Arc<Mutex<GameState>>,
    pub plug: Arc<Mutex<PlugState>>,
    pub parser: Mutex<ParserManager>,
}

impl AppState {
    pub fn new(app_handle: AppHandle) -> Self {
        let store = app_handle.store("store.json").unwrap();
        let mut path = find_game_path();
        let mut username = find_user_name();
        let mut ws = "ws://localhost:12345".to_owned();
        if let Some(Value::String(p)) = store.get("game-path") {
            let Ok(p) = PathBuf::from_str(&p);
            path = p;
        }
        store.set("game-path", path_to_string(&path));
        if let Some(Value::String(u)) = store.get("username") {
            username = u;
        }
        store.set("username", username.clone());
        if let Some(Value::String(w)) = store.get("websocket-address") {
            ws = w;
        }
        store.set("websocket-address", ws.clone());
        Self {
            game: Mutex::new(GameState::new(path, username)).into(),
            plug: Mutex::new(PlugState::new(ws)).into(),
            parser: Mutex::new(ParserManager::new()),
        }
    }

    pub async fn display_game(&self) -> Result<GameDisplay, String> {
        let state = self.game.lock().await;
        Ok(state.display())
    }

    pub async fn display_plug(&self) -> Result<PlugDisplay, String> {
        let state = self.plug.lock().await;
        Ok(state.display())
    }

    pub async fn start(&self, app_handle: AppHandle) {
        self.parser.lock().await.start(app_handle.clone()).await;
        let mut game = self.game.lock().await;
        game.current_deathstreak = 0;
        game.current_killstreak = 0;
        game.start();
        app_handle
            .emit("game-state-update", game.display())
            .unwrap();
    }

    pub async fn stop(&self, app_handle: AppHandle) {
        self.parser.lock().await.stop().await;
        let mut game = self.game.lock().await;
        game.stop();
        app_handle
            .emit("game-state-update", game.display())
            .unwrap();
    }
}

#[tauri::command]
pub async fn start_service(app_handle: AppHandle) {
    app_handle
        .state::<AppState>()
        .start(app_handle.clone())
        .await;
}

#[tauri::command]
pub async fn stop_service(app_handle: AppHandle) {
    app_handle
        .state::<AppState>()
        .stop(app_handle.clone())
        .await;
}

#[tauri::command]
pub async fn reset_store(app_handle: AppHandle) {
    let store = app_handle.store("store.json").unwrap();
    store.clear();
    store.close_resource();
    app_handle.exit(0);
}
