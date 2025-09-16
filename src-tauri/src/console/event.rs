use regex::Regex;
use std::sync::LazyLock;

static KILL_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
    r"(?P<date>\d{2}/\d{2}/\d{4}) - (?P<time>\d{2}:\d{2}:\d{2}): (?P<killer>.+?) killed (?P<victim>.+?) with (?P<weapon>\w+)(?:\. \((?P<crit>crit)\))?"
).unwrap()
});

static CHAT_MESSAGE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
    r"(?P<date>\d{2}/\d{2}/\d{4}) - (?P<time>\d{2}:\d{2}:\d{2}): (?P<player>.+?) :  (?P<message>.+)")
    .unwrap()
});

static TEAM_SWAP_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"(?P<date>\d{2}/\d{2}/\d{4}) - (?P<time>\d{2}:\d{2}:\d{2}): Teams have been switched\.",
    )
    .unwrap()
});

static SERVER_CONNECT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?P<date>\d{2}/\d{2}/\d{4}) - (?P<time>\d{2}:\d{2}:\d{2}):$").unwrap()
});

static SERVER_DISCONNECT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?P<date>\d{2}/\d{2}/\d{4}) - (?P<time>\d{2}:\d{2}:\d{2}): Lobby destroyed")
        .unwrap()
});

static PLAYER_CONNECT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"(?P<date>\d{2}/\d{2}/\d{4}) - (?P<time>\d{2}:\d{2}:\d{2}): (?P<player>.+?) connected",
    )
    .unwrap()
});

pub enum ConsoleEvent {
    Kill {
        killer: String,
        victim: String,
        weapon: String,
        crit: bool,
    },
    ChatMessage {
        player: String,
        message: String,
    },
    TeamSwap,
    ServerConnect {
        map: String,
    },
    ServerDisconnect,
    PlayerConnect {
        player: String,
    },
    Other {
        block: Vec<String>,
    },
}

impl ConsoleEvent {
    pub fn from_block(block: &[String]) -> Self {
        if block.is_empty() {
            return ConsoleEvent::Other {
                block: block.to_vec(),
            };
        }

        if let Some(caps) = KILL_RE.captures(&block[0]) {
            return ConsoleEvent::Kill {
                killer: caps["killer"].to_string(),
                victim: caps["victim"].to_string(),
                weapon: caps["weapon"].to_string(),
                crit: caps.name("crit").is_some(),
            };
        }
        if let Some(caps) = CHAT_MESSAGE_RE.captures(&block[0]) {
            return ConsoleEvent::ChatMessage {
                player: caps["player"].to_string(),
                message: caps["message"].to_string(),
            };
        }
        if TEAM_SWAP_RE.is_match(&block[0]) {
            return ConsoleEvent::TeamSwap;
        }
        if SERVER_CONNECT_RE.is_match(&block[0]) {
            if block[1] != "Team Fortress" {
                return ConsoleEvent::Other {
                    block: block.to_vec(),
                };
            }

            let map_re = Regex::new(r"Map: (\S+)").unwrap();
            let mut map = String::new();
            if let Some(m) = map_re.captures(&block[2]) {
                map = m[1].to_string();
            }
            return ConsoleEvent::ServerConnect { map };
        }
        if SERVER_DISCONNECT_RE.is_match(&block[0]) {
            return ConsoleEvent::ServerDisconnect;
        }
        if let Some(caps) = PLAYER_CONNECT_RE.captures(&block[0]) {
            return ConsoleEvent::PlayerConnect {
                player: caps["player"].to_string(),
            };
        }
        return ConsoleEvent::Other {
            block: block.to_vec(),
        };
    }
}
