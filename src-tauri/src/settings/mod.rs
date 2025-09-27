pub mod files;

use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};

use crate::settings::files::{find_game_path, find_steam_path, find_user_name, path_to_string};

#[derive(Clone, Default)]
pub struct SettingsState {
    pub steam_path: PathBuf,
    pub game_path: PathBuf,
    pub username: String,
    pub websocket_address: String,
}

#[derive(Clone, Serialize)]
pub struct SettingsDisplay {
    pub steam_path: String,
    pub game_path: String,
    pub username: String,
    pub websocket_address: String,
}

#[derive(Deserialize)]
pub struct SettingsPatch {
    pub steam_path: Option<String>,
    pub game_path: Option<String>,
    pub username: Option<String>,
    pub websocket_address: Option<String>,
}

pub struct SettingsManager {
    pub state: Mutex<SettingsState>,
    pub default: SettingsState,
}

impl SettingsManager {
    pub fn new() -> Self {
        let state = SettingsState {
            steam_path: find_steam_path(),
            game_path: find_game_path(),
            username: find_user_name(),
            websocket_address: String::from("localhost:12345"),
        };

        Self {
            state: Mutex::new(state.clone()),
            default: state,
        }
    }

    pub fn get(&self) -> SettingsState {
        let state = self.state.lock().unwrap();
        state.to_owned()
    }

    pub fn display(&self) -> SettingsDisplay {
        let state = self.state.lock().unwrap();
        SettingsDisplay {
            steam_path: path_to_string(&state.steam_path),
            game_path: path_to_string(&state.game_path),
            username: state.username.clone(),
            websocket_address: state.websocket_address.clone(),
        }
    }

    pub fn set(&self, patch: SettingsPatch) {
        let mut state = self.state.lock().unwrap();
        if let Some(steam_path) = patch.steam_path {
            state.steam_path = PathBuf::from(steam_path);
        }
        if let Some(game_path) = patch.game_path {
            state.game_path = PathBuf::from(game_path);
        }
        if let Some(username) = patch.username {
            state.username = username;
        }
        if let Some(websocket_address) = patch.websocket_address {
            state.websocket_address = websocket_address;
        }
    }

    pub fn get_default(&self) -> SettingsDisplay {
        SettingsDisplay {
            steam_path: path_to_string(&self.default.steam_path),
            game_path: path_to_string(&self.default.game_path),
            username: self.default.username.clone(),
            websocket_address: self.default.websocket_address.clone(),
        }
    }
}

#[tauri::command]
pub fn get_settings(manager: tauri::State<SettingsManager>) -> SettingsDisplay {
    manager.display()
}

#[tauri::command]
pub fn get_default_settings(manager: tauri::State<SettingsManager>) -> SettingsDisplay {
    manager.get_default()
}

#[tauri::command]
pub fn set_settings(manager: tauri::State<SettingsManager>, settings: SettingsPatch) {
    manager.set(settings);
}
