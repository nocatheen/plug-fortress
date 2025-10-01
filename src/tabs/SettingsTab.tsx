import { useEffect, useState, useTransition } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  TextInput,
  Button,
  Tooltip,
  ActionIcon,
  TextInputProps,
  Blockquote,
  Code,
} from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { Info, Undo2 } from "lucide-react";

export type Settings = {
  steam_path: string;
  game_path: string;
  username: string;
  websocket_address: string;
};

export function SettingsTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();

  const [settings, setSettings] = useState<Settings>({
    steam_path: "",
    game_path: "",
    username: "",
    websocket_address: "",
  });
  const [defaultSettings, setDefaultSettings] = useState<Settings>({
    steam_path: "",
    game_path: "",
    username: "",
    websocket_address: "",
  });

  useEffect(() => {
    startTransition(async () => {
      const settings = await invoke<Settings>("get_settings");
      setSettings(settings);

      const defaults = await invoke<Settings>("get_default_settings");
      setDefaultSettings(defaults);

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

  async function setDirectory(type: "steam" | "game", path: string) {
    let newSettings: Settings = { ...settings };

    switch (type) {
      case "steam":
        newSettings.steam_path = path;
        break;
      case "game":
        newSettings.game_path = path;
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

  const [wsError, setWsError] = useState(false);

  if (isPending) return null;

  return (
    <div className="px-10 py-5">
      <PathInput
        path={settings.game_path}
        label="Path to Team Fortress 2 directory"
        placeholder={defaultSettings.game_path}
        onClick={async () => setDirectory("game", (await pickDirectory()) ?? "")}
        onUndo={() => {
          setDirectory("game", defaultSettings.game_path);
        }}
      />
      <div className="flex justify-center items-end w-full mb-5">
        <UndoInput
          value={settings.username}
          placeholder={defaultSettings.username}
          label="Steam account display name"
          onUndo={() => {
            invoke("set_settings", {
              settings: {
                username: defaultSettings.username,
              },
            })
              .then(() => {
                setSettings((prev) => {
                  return { ...prev, username: defaultSettings.username };
                });
              })
              .catch((e) => {
                console.error(e);
              });
          }}
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            const value = input.value;

            setSettings((prev) => {
              return { ...prev, username: value };
            });
          }}
          onBlur={() => {
            invoke("set_settings", {
              settings: {
                username: settings.username,
              },
            }).catch((e) => {
              console.error(e);
            });
          }}
        />
      </div>
      <div className="flex justify-center items-end w-full mb-5">
        <UndoInput
          value={settings.websocket_address}
          placeholder={defaultSettings.websocket_address}
          label="Intiface Central websocket address"
          onUndo={() => {
            invoke("set_settings", {
              settings: {
                websocket_address: defaultSettings.websocket_address,
              },
            })
              .then(() => {
                setSettings((prev) => {
                  return { ...prev, websocket_address: defaultSettings.websocket_address };
                });
              })
              .catch((e) => {
                console.error(e);
              });
          }}
          onChange={(e) => {
            const filtered = e.target.value.replace(/[^0-9.:a-zA-Z]/g, "");

            setSettings((prev) => ({ ...prev, websocket_address: filtered }));
            setWsError(false);
          }}
          onBlur={(e) => {
            let addr = e.target.value;
            if (/^(localhost|(\d{1,3}\.){3}\d{1,3}):\d{1,5}$/.test(addr)) {
              setSettings((prev) => ({ ...prev, websocket_address: addr }));
              invoke("set_settings", {
                settings: {
                  websocket_address: addr,
                },
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
  placeholder,
  onClick,
  onUndo,
}: {
  path: string;
  label: string;
  placeholder: string;
  onClick: (...args: any[]) => any;
  onUndo: (...args: any[]) => any;
}) {
  return (
    <div className="flex justify-center items-end w-full mb-5">
      <UndoInput readOnly value={path} label={label} placeholder={placeholder} onUndo={onUndo} />
      <Button className="ml-5" onClick={onClick}>
        Open...
      </Button>
    </div>
  );
}

function UndoInput({
  value,
  placeholder,
  onUndo,
  ...rest
}: {
  value: string;
  placeholder: string;
  onUndo: (...args: any[]) => any;
} & TextInputProps) {
  return (
    <TextInput
      type="text"
      value={value}
      placeholder={placeholder}
      className="flex-1"
      rightSection={
        value != placeholder && (
          <Tooltip
            label="Reset"
            position="top"
            transitionProps={{ transition: "fade", duration: 300 }}
            openDelay={500}
            color="gray"
          >
            <ActionIcon size={32} variant="filled" color="red" onClick={onUndo}>
              <Undo2 size={20} />
            </ActionIcon>
          </Tooltip>
        )
      }
      {...rest}
    />
  );
}
