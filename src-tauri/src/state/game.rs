use std::path::PathBuf;

use serde::Serialize;

use crate::state::files::path_to_string;

pub struct GameState {
    pub game_path: PathBuf,
    pub username: String,

    service_enabled: bool,
}

#[derive(Serialize, Clone)]
pub struct GameDisplay {
    pub game_path: String,
    pub username: String,
    pub service_enabled: bool,
}

impl GameState {
    pub fn new(game_path: PathBuf, username: String) -> Self {
        Self {
            game_path,
            username,
            service_enabled: false,
        }
    }

    pub fn display(&self) -> GameDisplay {
        GameDisplay {
            game_path: path_to_string(&self.game_path),
            username: self.username.to_owned(),
            service_enabled: self.service_enabled,
        }
    }
}
