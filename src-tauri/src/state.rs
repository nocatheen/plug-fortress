use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Clone, Deserialize, Serialize)]
pub struct AppState {
    pub service_enabled: bool,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            service_enabled: false,
        }
    }
}

#[tauri::command]
pub fn get_state(state: tauri::State<Mutex<AppState>>) -> AppState {
    state.lock().unwrap().clone()
}

#[tauri::command]
pub fn set_state(state: tauri::State<Mutex<AppState>>, new_state: AppState) {
    let mut state = state.lock().unwrap();
    *state = new_state;
}
