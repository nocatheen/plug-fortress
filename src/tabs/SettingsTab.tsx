import { useEffect, useState, useTransition } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { TextInput, Button, Blockquote, Code } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { Info } from "lucide-react";

export type GameOptions = {
  first_kill_power: number;
  max_killstreak: number;
  killstreak_continuous: number;
  first_death_power: number;
  max_deathstreak: number;
  deathstreak_continuous: number;
};
export type GameState = {
  game_path: string;
  username: string;
  service_enabled: boolean;
  options: GameOptions;
  kills_enabled: boolean;
  killstreaks_enabled: boolean;
  deaths_enabled: boolean;
  deathstreaks_enabled: boolean;
};
export type PlugState = {
  websocket_address: string;
  devices: Device[];
  scanning: boolean;
  connected: boolean;
};
export type Device = {
  id: string;
  name: string;
  enabled: boolean;
  features: Feature[];
};
export type Feature = {
  id: string;
  name: string;
  step_count: number;
  max_step: number;
};

export function SettingsTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();

  const [settings, setSettings] = useState({
    game_path: "",
    username: "",
    websocket_address: "",
  });

  useEffect(() => {
    startTransition(async () => {
      const gameState = await invoke<GameState>("get_game_state");
      const plugState = await invoke<PlugState>("get_plug_state");
      setSettings({
        game_path: gameState.game_path,
        username: gameState.username,
        websocket_address: plugState.websocket_address,
      });

      onReady();
    });
  }, []);

  async function pickDirectory() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    return selected;
  }

  async function setDirectory(path: string) {
    invoke("set_game_path", {
      gamePath: path,
    })
      .then(() => {
        setSettings((prev) => {
          return {
            ...prev,
            game_path: path,
          };
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }

  const [wsError, setWsError] = useState(false);

  if (isPending) return null;

  return (
    <div className="px-10 py-5">
      <PathInput
        path={settings.game_path}
        label="Path to Team Fortress 2 directory"
        onClick={async () => setDirectory((await pickDirectory()) ?? "")}
      />
      <div className="mb-5">
        <TextInput
          value={settings.username}
          label="Steam account display name"
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            const value = input.value;

            setSettings((prev) => {
              return { ...prev, username: value };
            });
          }}
          onBlur={() => {
            invoke("set_username", {
              username: settings.username,
            }).catch((e) => {
              console.error(e);
            });
          }}
        />
      </div>
      <div className="mb-5">
        <TextInput
          value={settings.websocket_address}
          label="Intiface Central websocket address"
          onChange={(e) => {
            const filtered = e.target.value.replace(/[^0-9.:a-zA-Z/]/g, "");

            setSettings((prev) => ({ ...prev, websocket_address: filtered }));
            setWsError(false);
          }}
          onBlur={(e) => {
            let addr = e.target.value;
            if (/^ws:\/\/(localhost|(\d{1,3}\.){3}\d{1,3}):\d{1,5}$/.test(addr)) {
              setSettings((prev) => ({ ...prev, websocket_address: addr }));
              invoke("set_websocket_address", {
                websocketAddress: addr,
              }).catch((e) => {
                console.error(e);
              });
            } else {
              setWsError(true);
            }
          }}
          error={wsError ? "Invalid address" : undefined}
        />
      </div>
      <div className="mb-5">
        <Blockquote color="red" icon={<Info />} mt="xl">
          For <b>Plug&nbsp;Fortress</b> to work, make sure to add the following to
          Team&nbsp;Fortress&nbsp;2 <i>launch options</i>:
          <Code block>-condebug -conclearlog +con_timestamp 1</Code>
        </Blockquote>
      </div>
    </div>
  );
}

function PathInput({
  path,
  label,
  onClick,
}: {
  path: string;
  label: string;
  onClick: (...args: any[]) => any;
}) {
  return (
    <div className="flex justify-center items-end w-full mb-5">
      <TextInput type="text" value={path} readOnly className="flex-1" label={label} />
      <Button className="ml-5" onClick={onClick}>
        Open...
      </Button>
    </div>
  );
}
