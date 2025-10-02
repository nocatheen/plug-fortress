import { ActionIcon, Button, Autocomplete, Text, Title, Tooltip, Slider } from "@mantine/core";
import { useEffect, useState, useTransition } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { PlugState } from "./SettingsTab";
import { RefreshCw } from "lucide-react";
import { ToggableCard } from "../components/ToggableCard";

export function ToyTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [connecting, setConnecting] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");

  const [plugState, setPlugState] = useState<PlugState>({
    devices: [],
    scanning: false,
    websocket_address: "",
    connected: false,
  });

  useEffect(() => {
    startTransition(async () => {
      const state = await invoke<PlugState>("get_plug_state");
      setPlugState(state);
      onReady();
    });

    const unlistenStateUpdate = listen<PlugState>("bp-state-update", async (event) => {
      setPlugState(event.payload);
    });

    return () => {
      unlistenStateUpdate.then((f) => f());
    };
  }, []);

  if (isPending) return null;
  if (!plugState.connected) {
    return (
      <div className="text-center mt-5 text-neutral-400 p-5">
        <Title>Not connected to Intiface&nbsp;Central!</Title>
        <div className="mt-5">
          <Text>
            Make sure Intiface&nbsp;Central is running and the websocket address in set correctly.
          </Text>
        </div>
        <div className="absolute flex inset-0 justify-center items-center">
          <Button
            size="md"
            loading={connecting}
            onClick={async () => {
              setConnecting(true);
              await invoke("connect_to_server");
              const state = await invoke<PlugState>("get_plug_state");
              setConnecting(false);
              setPlugState(state);
            }}
          >
            Try reconnecting
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="px-5 py-2">
      <div className="flex items-end gap-5 mb-5">
        <Autocomplete
          className="flex-1"
          label="Search"
          placeholder="Device name"
          data={plugState.devices.map((d) => d.name)}
          value={currentSearch}
          onChange={setCurrentSearch}
        />
        <Tooltip label={plugState.scanning ? "Stop scanning" : "Start scanning"} color="gray">
          <ActionIcon
            variant={plugState.scanning ? "light" : "default"}
            size={55}
            onClick={() => {
              if (plugState.scanning) {
                invoke("stop_scanning");
              } else {
                invoke("start_scanning");
              }
            }}
          >
            <RefreshCw className={plugState.scanning ? "animate-spin" : ""} />
          </ActionIcon>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-5">
        {plugState.devices
          .filter((d) => d.name.toLowerCase().includes(currentSearch.toLowerCase()))
          .map((d, i) => (
            <ToggableCard
              key={i}
              name={d.name}
              options={d.features.map((f) => {
                return {
                  label: f.name,
                  description: "Maximum allowed power",
                  count_id: true,
                  content: (
                    <Slider
                      min={0}
                      max={f.step_count}
                      defaultValue={f.max_step}
                      label={(value) => `${value}`}
                      marks={[
                        { value: 0, label: "0" },
                        { value: f.step_count, label: `${f.step_count}` },
                      ]}
                      onChangeEnd={(value) => {
                        invoke("set_max_step", { device: d.id, feature: f.id, value: value });
                      }}
                    />
                  ),
                };
              })}
              enabled={d.enabled}
              onSwitch={() => {
                invoke("toggle_device", { device: d.id, enable: !d.enabled });
              }}
            />
          ))}
      </div>
    </div>
  );
}
