mod event;
mod parser;

use std::time::Duration;

pub use event::ConsoleEvent;
pub use parser::ConsoleParser;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};

use crate::{console::parser::LineType, state::app::AppState};

pub struct ParserManager {
    enabled: bool,
}

impl ParserManager {
    pub fn new() -> Self {
        Self { enabled: false }
    }

    pub async fn stop(&mut self) {
        println!("Stopping parser");
        self.enabled = false;
    }

    pub async fn start(&mut self, app_handle: AppHandle) {
        println!("Starting parser");
        let mut path = app_handle
            .state::<AppState>()
            .game
            .lock()
            .await
            .game_path
            .clone();
        path.push("tf/console.log");
        let mut parser = ConsoleParser::new(path.to_str().unwrap());

        self.enabled = true;

        tauri::async_runtime::spawn(async move {
            loop {
                let state = &app_handle.state::<AppState>().parser;
                let mut block = Vec::new();
                loop {
                    if !state.lock().await.enabled {
                        return;
                    };
                    let (line, ltype) = parser.read_line();
                    match ltype {
                        LineType::NewBlock => {
                            if !block.is_empty() {
                                parser.reset_line();
                                break;
                            }
                            block.push(line);
                        }
                        LineType::Part => {
                            block.push(line);
                        }
                        LineType::Empty => {
                            if !block.is_empty() {
                                break;
                            }
                            tokio::time::sleep(Duration::from_millis(200)).await;
                        }
                    }
                }
                match ConsoleEvent::from_block(&block) {
                    ConsoleEvent::Kill {
                        killer,
                        victim,
                        weapon,
                        crit,
                    } => {
                        #[derive(Clone, Serialize, Debug)]
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
                            .emit("server-connect", ServerConnectPayload { map })
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
                        println!("Unknown event: {:?}", block);
                    }
                }
            }
        });
    }
}
