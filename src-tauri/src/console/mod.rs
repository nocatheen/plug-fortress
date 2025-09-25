mod event;
mod parser;

use std::{sync::Mutex, thread};

pub use event::ConsoleEvent;
pub use parser::ConsoleParser;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};

use crate::{settings::SettingsManager, state::AppState};

#[tauri::command]
pub fn start_console(
    app_handle: AppHandle,
    settings: tauri::State<'_, SettingsManager>,
) -> tauri::Result<()> {
    let settings = settings.get();
    let mut path = settings.game_path;
    path.push("tf/console.log");
    let mut parser = ConsoleParser::new(path.to_str().unwrap());

    let state = app_handle.state::<Mutex<AppState>>();
    state.lock().unwrap().service_enabled = true;

    thread::spawn(move || {
        let state = app_handle.state::<Mutex<AppState>>();
        loop {
            if !state.lock().unwrap().service_enabled {
                break;
            };
            match ConsoleEvent::from_block(&parser.read_block()) {
                ConsoleEvent::Kill {
                    killer,
                    victim,
                    weapon,
                    crit,
                } => {
                    #[derive(Clone, Serialize)]
                    struct KillPayload {
                        killer: String,
                        victim: String,
                        weapon: String,
                        crit: bool,
                    }
                    app_handle
                        .emit(
                            "kill",
                            KillPayload {
                                killer,
                                victim,
                                weapon,
                                crit,
                            },
                        )
                        .unwrap();
                }
                ConsoleEvent::ChatMessage { player, message } => {
                    #[derive(Clone, Serialize)]
                    struct ChatMessagePayload {
                        player: String,
                        message: String,
                    }
                    app_handle
                        .emit("chat-message", ChatMessagePayload { player, message })
                        .unwrap();
                }
                ConsoleEvent::TeamSwap => {
                    app_handle.emit("team-swap", ()).unwrap();
                }
                ConsoleEvent::ServerConnect { map } => {
                    #[derive(Clone, Serialize)]
                    struct ServerConnectPayload {
                        map: String,
                    }
                    app_handle
                        .emit("team-swap", ServerConnectPayload { map })
                        .unwrap();
                }
                ConsoleEvent::ServerDisconnect => {
                    app_handle.emit("server-disconnect", ()).unwrap();
                }
                ConsoleEvent::PlayerConnect { player } => {
                    #[derive(Clone, Serialize)]
                    struct PlayerConnectPayload {
                        player: String,
                    }
                    app_handle
                        .emit("player-connect", PlayerConnectPayload { player })
                        .unwrap();
                }
                ConsoleEvent::Other { block } => {
                    println!("Unknown event: {:?}", block)
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub fn stop_console(state: tauri::State<'_, Mutex<AppState>>) {
    state.lock().unwrap().service_enabled = false;
}
