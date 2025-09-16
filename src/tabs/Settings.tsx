import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { TextInput, Button } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";

type Settings = {
  steam_path: string;
  game_path: string;
};

export function Settings() {
  const [settings, setSettings] = useState<Settings>({
    steam_path: "",
    game_path: "",
  });
  const [defaultSettings, setDefaultSettings] = useState<Settings>({
    steam_path: "",
    game_path: "",
  });

  useEffect(() => {
    (async () => {
      const settings = await invoke<Settings>("get_settings");
      setSettings(settings);
    })();

    (async () => {
      const defaults = await invoke<Settings>("get_default_settings");
      setDefaultSettings(defaults);
    })();
  }, []);

  async function setDirectory(type: "steam" | "game") {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (!selected) return;

    let newSettings: Settings = { ...settings };

    switch (type) {
      case "steam":
        newSettings.steam_path = selected;
        break;
      case "game":
        newSettings.game_path = selected;
        break;
      default:
        break;
    }

    invoke("set_settings", {
      settings: newSettings,
    })
      .then(() => {
        setSettings(newSettings);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  return (
    <div className="mx-10 my-5">
      <PathInput
        path={settings.steam_path}
        label="Path to Steam installation directory"
        placeholder={defaultSettings.steam_path}
        onClick={() => setDirectory("steam")}
      />
      <PathInput
        path={settings.game_path}
        label="Path to Team Fortress 2 directory"
        placeholder={defaultSettings.game_path}
        onClick={() => setDirectory("game")}
      />
    </div>
  );
}

function PathInput({
  path,
  label,
  placeholder,
  onClick,
}: {
  path: string;
  label: string;
  placeholder: string;
  onClick: (...args: any[]) => Promise<any>;
}) {
  return (
    <div className="flex justify-center items-end w-full mb-5">
      <TextInput
        type="text"
        value={path}
        readOnly
        placeholder={placeholder}
        label={label}
        className="mr-5 flex-1"
      />
      <Button onClick={onClick}>Open...</Button>
    </div>
  );
}
