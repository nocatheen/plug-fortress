mod event;
mod parser;

use std::{sync::Mutex, thread};

pub use event::ConsoleEvent;
pub use parser::ConsoleParser;
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
                    let crit_message = if crit { "crit " } else { "" };
                    app_handle
                        .emit(
                            "console-log",
                            format!(
                                "KILL ->\n{killer} {crit_message}killed {victim} using {weapon}"
                            ),
                        )
                        .unwrap();
                }
                ConsoleEvent::ChatMessage { player, message } => {
                    app_handle
                        .emit(
                            "console-log",
                            format!("CHAT MESSAGE ->\n{player}: {message}"),
                        )
                        .unwrap();
                }
                ConsoleEvent::TeamSwap => {
                    app_handle.emit("console-log", "TEAM SWAP").unwrap();
                }
                ConsoleEvent::ServerConnect { map } => {
                    app_handle
                        .emit("console-log", format!("SERVER CONNECT ->\nMap: {map}"))
                        .unwrap();
                }
                ConsoleEvent::ServerDisconnect => {
                    app_handle.emit("console-log", "SERVER DISCONNECT").unwrap();
                }
                ConsoleEvent::PlayerConnect { player } => {
                    app_handle
                        .emit(
                            "console-log",
                            format!("PLAYER CONNECT ->\n{player} has joined the game"),
                        )
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
