import { Slider, Switch } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState, useTransition } from "react";
import { ToggableCard } from "../components/ToggableCard";
import { GameState } from "./SettingsTab";
import { listen } from "@tauri-apps/api/event";

export function FeaturesTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();

  const [gameState, setGameState] = useState<GameState>();

  useEffect(() => {
    startTransition(async () => {
      const state = await invoke<GameState>("get_game_state");
      setGameState(state);
      onReady();
    });

    const unlistenStateUpdate = listen<GameState>("game-state-update", async (event) => {
      setGameState(event.payload);
    });

    return () => {
      unlistenStateUpdate.then((f) => f());
    };
  }, []);

  if (isPending || gameState === undefined) return null;
  return (
    <div className="px-5 py-2">
      <div className="flex justify-center items-center gap-5 my-5">
        <Switch
          size="xl"
          onLabel="ON"
          offLabel="OFF"
          checked={gameState.service_enabled}
          onChange={(event) => {
            if (event.currentTarget.checked) {
              invoke("start_service");
            } else {
              invoke("stop_service");
            }
          }}
        />
        <span className="text-2xl font-black">Enable service</span>
      </div>
      <div className="flex flex-col gap-5">
        <ToggableCard
          enabled={gameState.kills_enabled}
          onSwitch={() =>
            invoke("toggle_game_feature", { feature: "kills", enabled: !gameState.kills_enabled })
          }
          name="Kills"
          description="Vibrate once on every kill"
          options={[
            {
              label: "Power on first kill",
              description: "% from max power set in toy options",
              content: (
                <Slider
                  min={0}
                  max={100}
                  defaultValue={gameState.options.first_kill_power}
                  label={(value) => `${value}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                  onChangeEnd={(value) => {
                    const options = {
                      first_kill_power: value,
                    };
                    invoke("set_game_options", { options });
                  }}
                />
              ),
            },
          ]}
        />
        <ToggableCard
          enabled={gameState.killstreaks_enabled}
          onSwitch={() =>
            invoke("toggle_game_feature", {
              feature: "killstreaks",
              enabled: !gameState.killstreaks_enabled,
            })
          }
          name="Killstreaks"
          description="Vibrate continiously on gaining killstreak"
          options={[
            {
              label: "Max killstreak",
              description: "How many kills does it take to reach 100% power",
              content: (
                <Slider
                  min={2}
                  max={20}
                  defaultValue={gameState.options.max_killstreak}
                  label={(value) => `${value}`}
                  marks={Array.from({ length: 19 }, (_, i) => {
                    return { value: i + 2, label: `${i + 2}` };
                  })}
                  onChangeEnd={(value) => {
                    const options = {
                      max_killstreak: value,
                    };
                    invoke("set_game_options", { options });
                  }}
                />
              ),
            },
            // {
            //   label: "Continuous",
            //   description: "% from current killstreak power",
            //   content: (
            //     <Slider
            //       min={0}
            //       max={100}
            //       defaultValue={gameState.options.killstreak_continuous}
            //       label={(value) => `${value}%`}
            //       marks={[
            //         { value: 0, label: "0%" },
            //         { value: 100, label: "100%" },
            //       ]}
            //       onChangeEnd={(value) => {
            //         const options = {
            //           killstreak_continuous: value,
            //         };
            //         invoke("set_game_options", { options });
            //       }}
            //     />
            //   ),
            // },
          ]}
        />
        <ToggableCard
          enabled={gameState.deaths_enabled}
          onSwitch={() =>
            invoke("toggle_game_feature", {
              feature: "deaths",
              enabled: !gameState.deaths_enabled,
            })
          }
          name="Deaths"
          description="Vibrate once on every death"
          options={[
            {
              label: "Power on first death",
              description: "% from max power set in toy options",
              content: (
                <Slider
                  min={0}
                  max={100}
                  defaultValue={gameState.options.first_death_power}
                  label={(value) => `${value}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                  onChangeEnd={(value) => {
                    const options = {
                      first_death_power: value,
                    };
                    invoke("set_game_options", { options });
                  }}
                />
              ),
            },
          ]}
        />
        <ToggableCard
          enabled={gameState.deathstreaks_enabled}
          onSwitch={() =>
            invoke("toggle_game_feature", {
              feature: "deathstreaks",
              enabled: !gameState.deathstreaks_enabled,
            })
          }
          name="Deathstreaks"
          description="Vibrate continiously on gaining deathstreak"
          options={[
            {
              label: "Max Deathstreak",
              description: "How many deaths does it take to reach 100% power",
              content: (
                <Slider
                  min={2}
                  max={20}
                  defaultValue={gameState.options.max_deathstreak}
                  label={(value) => `${value}`}
                  marks={Array.from({ length: 19 }, (_, i) => {
                    return { value: i + 2, label: `${i + 2}` };
                  })}
                  onChangeEnd={(value) => {
                    const options = {
                      max_deathstreak: value,
                    };
                    invoke("set_game_options", { options });
                  }}
                />
              ),
            },
            // {
            //   label: "Continuous",
            //   description: "% from current deathstreak power",
            //   content: (
            //     <Slider
            //       min={0}
            //       max={100}
            //       defaultValue={gameState.options.deathstreak_continuous}
            //       label={(value) => `${value}%`}
            //       marks={[
            //         { value: 0, label: "0%" },
            //         { value: 100, label: "100%" },
            //       ]}
            //       onChangeEnd={(value) => {
            //         const options = {
            //           deathstreak_continuous: value,
            //         };
            //         invoke("set_game_options", { options });
            //       }}
            //     />
            //   ),
            // },
          ]}
        />
      </div>
    </div>
  );
}
