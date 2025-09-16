use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Clone, Serialize)]
pub struct SettingsState {
    pub game_path: String,
}

#[derive(Deserialize)]
pub struct SettingsPatch {
    pub game_path: Option<String>,
}

pub struct SettingsManager {
    pub state: Mutex<SettingsState>,
}

impl SettingsManager {
    pub fn new(initial: SettingsState) -> Self {
        Self {
            state: Mutex::new(initial),
        }
    }

    pub fn get(&self) -> SettingsState {
        let state = self.state.lock().unwrap();
        state.clone()
    }

    pub fn set(&self, patch: SettingsPatch) {
        let mut state = self.state.lock().unwrap();
        if let Some(game_path) = patch.game_path {
            state.game_path = game_path;
        }
    }
}
