use regex::Regex;
use std::fs::read_to_string;
use std::path::Path;
use std::path::PathBuf;

const TF2_APP_ID: u32 = 440;

pub fn find_steam_path() -> PathBuf {
    let steam_dir = steamlocate::SteamDir::locate()
        .map(|s| s.path().to_owned())
        .unwrap_or(PathBuf::new());
    steam_dir
}

pub fn find_game_path() -> PathBuf {
    if let Ok(steam_dir) = steamlocate::SteamDir::locate() {
        if let Ok(Some(game)) = steam_dir.find_app(TF2_APP_ID) {
            let mut path = game.1.path().to_owned();
            path.push("steamapps\\common");
            path.push(game.0.install_dir);
            return path;
        }
    }
    PathBuf::new()
}

pub fn find_user_name() -> String {
    let mut path = find_steam_path();
    path.push("config/loginusers.vdf");
    if let Ok(raw) = read_to_string(path) {
        let re = Regex::new(r#""PersonaName"\s*"([^"]+)""#).unwrap();

        if let Some(caps) = re.captures(&raw) {
            return caps[1].to_owned();
        }
    }
    String::new()
}

pub fn path_to_string(path: &Path) -> String {
    let path = path
        .canonicalize()
        .map(|p| p.display().to_string())
        .unwrap_or(String::new());
    match path.strip_prefix(r"\\?\") {
        Some(p) => p.to_string(),
        None => path,
    }
}
