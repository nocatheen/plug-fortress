use std::{path::PathBuf, time::Duration};

use num::clamp;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Emitter, Listener, Manager};
use tauri_plugin_store::StoreExt;

use crate::{
    console::ConsoleEvent,
    state::{app::AppState, files::path_to_string},
};

pub struct GameState {
    pub game_path: PathBuf,
    pub username: String,

    kills_enabled: bool,
    killstreaks_enabled: bool,
    deaths_enabled: bool,
    deathstreaks_enabled: bool,

    options: Options,
    service_enabled: bool,

    pub current_killstreak: u8,
    pub current_deathstreak: u8,
}

#[derive(Serialize, Clone)]
pub struct GameDisplay {
    pub game_path: String,
    pub username: String,
    pub service_enabled: bool,
    pub options: Options,

    pub kills_enabled: bool,
    pub killstreaks_enabled: bool,
    pub deaths_enabled: bool,
    pub deathstreaks_enabled: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Options {
    pub first_kill_power: Option<u8>,
    pub max_killstreak: Option<u8>,
    pub killstreak_continuous: Option<u8>,
    pub first_death_power: Option<u8>,
    pub max_deathstreak: Option<u8>,
    pub deathstreak_continuous: Option<u8>,
}

impl Options {
    pub fn new() -> Self {
        Self {
            first_kill_power: Some(40),
            max_killstreak: Some(5),
            killstreak_continuous: Some(30),
            first_death_power: Some(40),
            max_deathstreak: Some(5),
            deathstreak_continuous: Some(30),
        }
    }
}

impl GameState {
    pub fn new(game_path: PathBuf, username: String) -> Self {
        Self {
            game_path,
            username,
            service_enabled: false,
            options: Options::new(),
            kills_enabled: false,
            killstreaks_enabled: false,
            deaths_enabled: false,
            deathstreaks_enabled: false,
            current_killstreak: 0,
            current_deathstreak: 0,
        }
    }

    pub async fn init(&mut self, app: &AppHandle) {
        let app_handle = app.clone();

        if let Ok(store) = app_handle.store("store.json") {
            fn parse_bool(value: Option<Value>) -> bool {
                value.map(|v| v.as_bool().unwrap_or(false)).unwrap_or(false)
            }

            fn parse_u8(value: Option<Value>, default: u64) -> u8 {
                value
                    .map(|v| v.as_u64())
                    .unwrap_or(Some(default))
                    .unwrap_or(default) as u8
            }

            self.kills_enabled = parse_bool(store.get("game-feature-kills"));
            self.killstreaks_enabled = parse_bool(store.get("game-feature-killstreaks"));
            self.deaths_enabled = parse_bool(store.get("game-feature-deaths"));
            self.deathstreaks_enabled = parse_bool(store.get("game-feature-deathstreaks"));

            self.options.first_kill_power = Some(parse_u8(store.get("first-kill-power"), 40));
            self.options.max_killstreak = Some(parse_u8(store.get("max-killstreak"), 5));
            self.options.killstreak_continuous =
                Some(parse_u8(store.get("killstreak-continuous"), 30));
            self.options.first_death_power = Some(parse_u8(store.get("first-death-power"), 40));
            self.options.max_deathstreak = Some(parse_u8(store.get("max-deathstreak"), 5));
            self.options.deathstreak_continuous =
                Some(parse_u8(store.get("deathstreak-continuous"), 30));

            app_handle
                .emit("game-state-update", self.display())
                .unwrap();
        }

        app.listen("kill", move |event| {
            let app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(ConsoleEvent::Kill { killer, victim, .. }) =
                    serde_json::from_str::<ConsoleEvent>(&event.payload())
                {
                    let state = app_handle.state::<AppState>();
                    let mut game = state.game.lock().await;
                    let plug = state.plug.clone();
                    if killer == game.username {
                        game.current_killstreak += 1;
                        game.current_deathstreak = 0;
                        let ks = clamp(
                            game.current_killstreak,
                            0,
                            game.options.max_killstreak.unwrap(),
                        );
                        let mut power = game.options.first_kill_power.unwrap() as f64 * 0.01;
                        if game.killstreaks_enabled {
                            let ks_power = 1.0 - power;
                            let ks_part = ks_power / game.options.max_killstreak.unwrap() as f64;
                            power += ks_part * ks as f64;
                        }
                        if game.kills_enabled {
                            tauri::async_runtime::spawn(async move {
                                plug.lock().await.vibrate_add(power).await;
                                tokio::time::sleep(Duration::from_millis(300)).await;
                                plug.lock().await.vibrate_remove(power).await;
                            });
                        }
                    } else if victim == game.username {
                        game.current_deathstreak += 1;
                        game.current_killstreak = 0;
                        let ds = clamp(
                            game.current_deathstreak,
                            0,
                            game.options.max_deathstreak.unwrap(),
                        );
                        let mut power = game.options.first_death_power.unwrap() as f64 * 0.01;
                        if game.deathstreaks_enabled {
                            let ds_power = 1.0 - power;
                            let ds_part = ds_power / game.options.max_deathstreak.unwrap() as f64;
                            power += ds_part * ds as f64;
                        }
                        if game.deaths_enabled {
                            tauri::async_runtime::spawn(async move {
                                plug.lock().await.vibrate_add(power).await;
                                tokio::time::sleep(Duration::from_millis(300)).await;
                                plug.lock().await.vibrate_remove(power).await;
                            });
                        }
                    }
                }
            });
        });
        let app_handle = app.clone();
        app.listen("team-swap", move |event| {
            let app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(ConsoleEvent::TeamSwap) =
                    serde_json::from_str::<ConsoleEvent>(&event.payload())
                {
                    let state = app_handle.state::<AppState>();
                    let mut game = state.game.lock().await;
                    game.current_killstreak = 0;
                    game.current_deathstreak = 0;
                }
            });
        });
        let app_handle = app.clone();
        app.listen("server-connect", move |event| {
            let app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(ConsoleEvent::ServerConnect { .. }) =
                    serde_json::from_str::<ConsoleEvent>(&event.payload())
                {
                    let state = app_handle.state::<AppState>();
                    let mut game = state.game.lock().await;
                    game.current_killstreak = 0;
                    game.current_deathstreak = 0;
                }
            });
        });
    }

    pub fn start(&mut self) {
        self.service_enabled = true;
    }

    pub fn stop(&mut self) {
        self.service_enabled = false;
    }

    pub fn set_options(&mut self, options: Options, app_handle: AppHandle) {
        if let Ok(store) = app_handle.store("store.json") {
            if options.first_kill_power.is_some() {
                store.set("first-kill-power", options.first_kill_power);
            }
            if options.max_killstreak.is_some() {
                store.set("max-killstreak", options.max_killstreak);
            }
            if options.killstreak_continuous.is_some() {
                store.set("killstreak-continuous", options.killstreak_continuous);
            }
            if options.first_death_power.is_some() {
                store.set("first-death-power", options.first_death_power);
            }
            if options.max_deathstreak.is_some() {
                store.set("max-deathstreak", options.max_deathstreak);
            }
            if options.deathstreak_continuous.is_some() {
                store.set("deathstreak-continuous", options.deathstreak_continuous);
            }
        }

        if options.first_kill_power.is_some() {
            self.options.first_kill_power = options.first_kill_power;
        }
        if options.max_killstreak.is_some() {
            self.options.max_killstreak = options.max_killstreak;
        }
        if options.killstreak_continuous.is_some() {
            // todo: change current power here
            self.options.killstreak_continuous = options.killstreak_continuous;
        }
        if options.first_death_power.is_some() {
            self.options.first_death_power = options.first_death_power;
        }
        if options.max_deathstreak.is_some() {
            self.options.max_deathstreak = options.max_deathstreak;
        }
        if options.deathstreak_continuous.is_some() {
            // todo: change current power here
            self.options.deathstreak_continuous = options.deathstreak_continuous;
        }
    }

    pub fn toggle_kills(&mut self, enabled: bool) {
        self.kills_enabled = enabled;
    }

    pub fn toggle_killstreaks(&mut self, enabled: bool) {
        if !enabled {
            // todo: stop vibration here
        }
        self.killstreaks_enabled = enabled;
    }

    pub fn toggle_deaths(&mut self, enabled: bool) {
        self.deaths_enabled = enabled;
    }

    pub fn toggle_deathstreaks(&mut self, enabled: bool) {
        if !enabled {
            // todo: stop vibration here
        }
        self.deathstreaks_enabled = enabled;
    }

    pub fn display(&self) -> GameDisplay {
        GameDisplay {
            game_path: path_to_string(&self.game_path),
            username: self.username.to_owned(),
            service_enabled: self.service_enabled,
            options: self.options.clone(),
            kills_enabled: self.kills_enabled,
            killstreaks_enabled: self.killstreaks_enabled,
            deaths_enabled: self.deaths_enabled,
            deathstreaks_enabled: self.deathstreaks_enabled,
        }
    }
}

#[tauri::command]
pub async fn set_game_options(app_handle: AppHandle, options: Options) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut state = state.game.lock().await;
    state.set_options(options, app_handle.clone());
    app_handle
        .emit("game-state-update", state.display())
        .unwrap();
    Ok(())
}

#[tauri::command]
pub async fn toggle_game_feature(
    app_handle: AppHandle,
    feature: String,
    enabled: bool,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut state = state.game.lock().await;

    let store = app_handle.store("store.json").map_err(|e| e.to_string())?;
    store.set(format!("game-feature-{}", feature), enabled);

    match feature.as_str() {
        "kills" => state.toggle_kills(enabled),
        "killstreaks" => state.toggle_killstreaks(enabled),
        "deaths" => state.toggle_deaths(enabled),
        "deathstreaks" => state.toggle_deathstreaks(enabled),
        _ => {}
    }
    app_handle
        .emit("game-state-update", state.display())
        .unwrap();
    Ok(())
}
