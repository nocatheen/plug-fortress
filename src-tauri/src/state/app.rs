use std::sync::Arc;

use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::Mutex;

use crate::{
    console::ParserManager,
    state::{
        files::{find_game_path, find_user_name},
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
    pub fn new() -> Self {
        Self {
            game: Mutex::new(GameState::new(find_game_path(), find_user_name())).into(),
            plug: Mutex::new(PlugState::new("ws://localhost:12345".to_string())).into(),
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
