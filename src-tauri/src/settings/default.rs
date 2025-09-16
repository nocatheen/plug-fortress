// Firstly we need to find a Steam installation path using Windows registry.
// Then we can find TF2 root directory as well as UserId64, convert it to
// UserId3 and use it to find TF2's launch arguments that were set in Steam.

use std::fs::canonicalize;
use std::io;
use std::path::Path;
use std::path::PathBuf;
use winreg::enums::*;
use winreg::RegKey;

pub fn find_steam_path() -> io::Result<PathBuf> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let steam = hkcu.open_subkey(r"SOFTWARE\Valve\Steam")?;
    let path_str: String = steam.get_value("SteamPath")?;
    Ok(PathBuf::from(path_str))
}

pub fn find_game_path() -> io::Result<PathBuf> {
    Ok(PathBuf::from(""))
}

pub fn path_to_string(path: &Path) -> String {
    let path_str = canonicalize(path)
        .map(|p| p.display().to_string())
        .unwrap_or(String::new());
    match path_str.strip_prefix(r"\\?\") {
        Some(p) => p.to_string(),
        None => path_str,
    }
}
