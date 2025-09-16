pub mod default;

use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};

use crate::settings::default::{find_game_path, find_steam_path, path_to_string};

#[derive(Clone, Default)]
pub struct SettingsState {
    pub steam_path: PathBuf,
    pub game_path: PathBuf,
}

#[derive(Clone, Serialize)]
pub struct SettingsDisplay {
    pub steam_path: String,
    pub game_path: String,
}

#[derive(Deserialize)]
pub struct SettingsPatch {
    pub steam_path: Option<String>,
    pub game_path: Option<String>,
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
        };

        Self {
            state: Mutex::new(state.clone()),
            default: state,
        }
    }

    pub fn get(&self) -> SettingsDisplay {
        let state = self.state.lock().unwrap();
        SettingsDisplay {
            steam_path: path_to_string(&state.steam_path),
            game_path: path_to_string(&state.game_path),
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
    }

    pub fn get_default(&self) -> SettingsDisplay {
        SettingsDisplay {
            steam_path: path_to_string(&self.default.steam_path),
            game_path: path_to_string(&self.default.game_path),
        }
    }
}
