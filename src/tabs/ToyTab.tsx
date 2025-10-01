import { Button, Text, Title } from "@mantine/core";
import { useEffect, useState, useTransition } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { PlugState } from "./SettingsTab";

export function ToyTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [connecting, setConnecting] = useState(false);

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
  return (
    <>
      <div>
        {plugState.connected ? (
          <></>
        ) : (
          <>
            <div className="text-center mt-5 text-neutral-400 p-5">
              <Title>Not connected to Intiface&nbsp;Central!</Title>
              <div className="mt-5">
                <Text>
                  Make sure Intiface&nbsp;Central is running and the websocket address in set
                  correctly.
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
          </>
        )}
      </div>
    </>
  );
}
