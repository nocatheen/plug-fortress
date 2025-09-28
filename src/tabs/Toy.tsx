import { ActionIcon, Loader, Select, Text, Title, Tooltip } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { DeviceCard } from "../components/DeviceCard";
import { listen } from "@tauri-apps/api/event";
import { LoadingScreen } from "../components/LoadingScreen";

type PlugState = {
  scanning: boolean;
  connected: boolean;
};

type Feature = {
  id: number;
  name: string;
  step_count: number;
  max_step: number;
};

type Device = {
  id: number;
  name: string;
  features: Feature[];
};

export function Toy() {
  const [loading, setLoading] = useState(-2);

  const [state, setState] = useState<PlugState>({
    connected: false,
    scanning: false,
  });

  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    async function fetchState() {
      const state = await invoke<PlugState>("get_plug_state");
      setLoading((prev) => prev + 1);
      setState(state);
    }

    fetchState();
    const interval = setInterval(fetchState, 1000);

    (async () => {
      const devices = await invoke<Device[]>("list_devices");
      console.log(devices);
      setLoading((prev) => prev + 1);
      setDevices(devices);
    })();

    const unlistenDeviceAdded = listen<Device>("device-added", (event) => {
      setDevices((prev) => {
        const id = prev.findIndex((device) => device.id === event.payload.id);
        if (id !== -1) {
          return prev.map((device, index) => (index === id ? event.payload : device));
        } else {
          return [...prev, event.payload];
        }
      });
    });

    return () => {
      clearInterval(interval);
      setLoading((prev) => prev + 1);
      unlistenDeviceAdded.then((f) => f());
    };
  }, []);

  return (
    <LoadingScreen visible={loading < 0}>
      <div>
        {state.connected ? (
          <div>
            <div className="px-5 py-2 flex justify-between items-end">
              <Select
                label="Selected device"
                placeholder="Choose available device"
                className="flex-1 mr-5"
                data={devices.map((d) => d.name)}
              />
              <Tooltip label={state.scanning ? "Stop scanning" : "Start scanning"} color="gray">
                <ActionIcon
                  variant="light"
                  size={55}
                  color={state.scanning ? "blue" : "gray"}
                  onClick={() => {
                    if (!state.scanning) {
                      invoke("start_scanning");
                    } else {
                      invoke("stop_scanning");
                    }
                    setState((prev) => {
                      return {
                        ...prev,
                        scanning: !state.scanning,
                      };
                    });
                  }}
                >
                  <RefreshCw className={state.scanning ? "animate-spin" : undefined} />
                </ActionIcon>
              </Tooltip>
            </div>
            {/* <DeviceCard  /> */}
          </div>
        ) : (
          <div className="text-center mt-5 text-neutral-400 p-5">
            <Title>Not connected to Intiface&nbsp;Central!</Title>
            <div className="mt-5">
              <Text>
                Make sure Intiface&nbsp;Central is running and the websocket address in set
                correctly.
              </Text>
            </div>
            <div className="absolute flex inset-0 justify-center items-center -z-1">
              <Loader color="gray" />
            </div>
          </div>
        )}
      </div>
    </LoadingScreen>
  );
}
