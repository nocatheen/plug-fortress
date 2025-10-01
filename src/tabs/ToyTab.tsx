import {
  ActionIcon,
  Loader,
  LoadingOverlay,
  Select,
  Text,
  Title,
  Tooltip,
  Button,
  Slider,
} from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

type PlugState = {
  scanning: boolean;
  connected: boolean;
  selected_device_id: number;
};

type Device = {
  id: number;
  name: string;
  features: Feature[];
};

export function ToyTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();

  const [devices, setDevices] = useState<Device[]>([]);
  const [state, setState] = useState<PlugState>({
    connected: false,
    scanning: false,
    selected_device_id: -1,
  });

  const currentDevice = devices.find((d) => d.id == state.selected_device_id);

  useEffect(() => {
    (async () => {
      const devices = await invoke<Device[]>("list_devices");
      setDevices(devices);
    })();
  }, [state]);

  useEffect(() => {
    startTransition(async () => {
      const newState = await invoke<PlugState>("get_plug_state");
      setState(newState);
      onReady();
    });

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

    const unlistenStatusCheck = listen<PlugState>("status-check", (event) => {
      setState(event.payload);
    });

    return () => {
      unlistenDeviceAdded.then((f) => f());
      unlistenStatusCheck.then((f) => f());
      invoke("test_selected", { active: false });
    };
  }, []);

  if (isPending) return null;
  return (
    <>
      <div>
        {state.connected ? (
          <div className="flex flex-col h-screen">
            <div className="px-5 py-2 flex justify-between items-end">
              <Select
                label="Selected device"
                placeholder="Choose available device"
                className="flex-1 mr-5"
                data={devices.map((d) => {
                  return { value: d.id.toString(), label: d.name };
                })}
                value={currentDevice?.id.toString()}
                onChange={(_value, option) => {
                  invoke("test_selected", { active: false }).then(() => {
                    invoke("select_device", { deviceId: parseInt(option.value) });
                    setState((prev) => {
                      return {
                        ...prev,
                        selected_device_id: parseInt(option.value),
                      };
                    });
                  });
                }}
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
            <div className="flex-1 relative p-5">
              <LoadingOverlay visible={state.scanning} zIndex={10} overlayProps={{ blur: 5 }} />
              {currentDevice != undefined && (
                <DeviceCard
                  id={currentDevice.id}
                  name={currentDevice.name}
                  features={currentDevice.features}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="absolute flex inset-0 justify-center items-center -z-1">
              <Loader />
            </div>
            <div className="text-center mt-5 text-neutral-400 p-5">
              <Title>Not connected to Intiface&nbsp;Central!</Title>
              <div className="mt-5">
                <Text>
                  Make sure Intiface&nbsp;Central is running and the websocket address in set
                  correctly.
                </Text>
              </div>
              <div className="absolute flex inset-0 justify-center items-center -z-1">
                <Loader />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

type Feature = {
  id: number;
  name: string;
  step_count: number;
  max_step: number;
};

function DeviceCard({ id, name, features }: { id: number; name: string; features: Feature[] }) {
  const [testing, setTesting] = useState(false);

  return (
    <div className="w-full p-5 ring-1 ring-neutral-700 rounded-lg">
      <div className="flex justify-between mb-5">
        <div className="font-bold text-2xl">{name}</div>
        <Tooltip label={"Test all motors at selected power"} color="gray">
          <Button
            color={testing ? "red" : "blue"}
            h={30}
            onClick={() => {
              if (testing) {
                invoke("test_selected", { active: false });
              } else {
                invoke("test_selected", { active: true });
              }
              setTesting((prev) => !prev);
            }}
          >
            {testing ? "Stop test" : "Start test"}
          </Button>
        </Tooltip>
      </div>
      <div className="mx-5 h-1 flex justify-center items-center">
        <div className="flex-1 h-0.5 bg-neutral-600 rounded-2xl"></div>
        <div className="mx-5 flex justify-center font-bold text-neutral-500">
          Set max power for every feature below
        </div>
        <div className="flex-1 h-0.5 bg-neutral-600 rounded-2xl"></div>
      </div>
      {features.map((feature, i) => (
        <div className="mt-5 ring-1 ring-neutral-700 rounded-lg px-4 pt-3 pb-8" key={i}>
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">
              {feature.name} <span className="text-neutral-500 ml-1">#{i}</span>
            </div>
            <div className="text-neutral-400">Power</div>
          </div>
          <Slider
            color="blue"
            min={0}
            max={feature.step_count}
            defaultValue={feature.max_step}
            label={(value) => `${value}`}
            marks={[
              { value: 0, label: "Min" },
              { value: 20, label: Math.trunc(feature.step_count * 0.2) },
              { value: 50, label: Math.trunc(feature.step_count * 0.5) },
              { value: 80, label: Math.trunc(feature.step_count * 0.8) },
              { value: 100, label: "Max" },
            ]}
            onChangeEnd={(value) => {
              invoke("set_feature_max_step", {
                deviceId: id,
                featureId: feature.id,
                maxStep: value,
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}
