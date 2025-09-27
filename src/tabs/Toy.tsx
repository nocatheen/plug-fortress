import { Loader, Text, Title } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

type PlugState = {
  scanning: boolean;
  connected: boolean;
};

export function Toy() {
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState<PlugState>({
    connected: false,
    scanning: false,
  });

  useEffect(() => {
    async function fetchState() {
      const state = await invoke<PlugState>("get_plug_state");
      setLoading(false);
      setState(state);
    }

    fetchState();
    const interval = setInterval(fetchState, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="absolute flex inset-0 justify-center items-center">
          <Loader color="blue" />
        </div>
      ) : (
        <div>
          {state.connected ? (
            <div className=""></div>
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
      )}
    </>
  );
}
