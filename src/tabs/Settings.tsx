import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { TextInput, Button } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";

type Settings = {
  game_path: string;
};

export function Settings() {
  const [dirPath, setDirPath] = useState("");

  useEffect(() => {
    const fetchDir = async () => {
      const settings = await invoke<Settings>("get_settings");
      setDirPath(settings.game_path);
    };
    fetchDir();
  }, []);

  async function pickDir() {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    if (selected) {
      invoke("set_settings", {
        settings: {
          game_path: selected,
        },
      })
        .then(() => {
          setDirPath(selected);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  return (
    <div className="mx-10 my-5">
      <div className="flex justify-center items-end w-full">
        <TextInput
          type="text"
          value={dirPath}
          readOnly
          placeholder="C:\Program Files (x86)\Steam\steamapps\common\Team Fortress 2"
          label="Path to Team Fortress 2 directory"
          className="mr-5 flex-1"
        />
        <Button onClick={pickDir}>Open...</Button>
      </div>
    </div>
  );
}
