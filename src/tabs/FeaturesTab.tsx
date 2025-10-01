import { Slider, Switch } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import React, { useEffect, useState, useTransition } from "react";

export function FeaturesTab({ onReady }: { onReady: () => void }) {
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    onReady();
  }, []);

  const [serviceEnabled, setServiceEnabled] = useState(false);

  const [kills, setKills] = useState(false);
  const [killstreaks, setKillstreaks] = useState(false);
  const [deaths, setDeaths] = useState(false);
  const [deathstreaks, setDeathstreaks] = useState(false);

  if (isPending) return null;
  return (
    <div className="px-5 py-2">
      <div className="flex justify-center items-center gap-5 my-5">
        <Switch
          size="xl"
          onLabel="ON"
          offLabel="OFF"
          checked={serviceEnabled}
          onChange={(event) => {
            if (event.currentTarget.checked) {
              invoke("start_console");
            } else {
              invoke("stop_console");
            }
            setServiceEnabled(event.currentTarget.checked);
          }}
        />
        <span className="text-2xl font-black">Enable service</span>
      </div>
      <div className="flex flex-col gap-5">
        <Feature
          enabled={kills}
          onSwitch={() => setKills((prev) => !prev)}
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
                  defaultValue={40}
                  label={(value) => `${value}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                />
              ),
            },
          ]}
        />
        <Feature
          enabled={killstreaks}
          onSwitch={() => setKillstreaks((prev) => !prev)}
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
                  defaultValue={5}
                  label={(value) => `${value}`}
                  marks={Array.from({ length: 19 }, (_, i) => {
                    return { value: i + 2, label: `${i + 2}` };
                  })}
                />
              ),
            },
            {
              label: "Continuous",
              description: "% from current killstreak power",
              content: (
                <Slider
                  min={0}
                  max={100}
                  defaultValue={30}
                  label={(value) => `${value}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                />
              ),
            },
          ]}
        />
        <Feature
          enabled={deaths}
          onSwitch={() => setDeaths((prev) => !prev)}
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
                  defaultValue={40}
                  label={(value) => `${value}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                />
              ),
            },
          ]}
        />
        <Feature
          enabled={deathstreaks}
          onSwitch={() => setDeathstreaks((prev) => !prev)}
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
                  defaultValue={5}
                  label={(value) => `${value}`}
                  marks={Array.from({ length: 19 }, (_, i) => {
                    return { value: i + 2, label: `${i + 2}` };
                  })}
                />
              ),
            },
            {
              label: "Continuous",
              description: "% from current deathstreak power",
              content: (
                <Slider
                  min={0}
                  max={100}
                  defaultValue={30}
                  label={(value) => `${value}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

type Option = {
  label?: string;
  description?: string;
  content: React.ReactNode;
};

function Feature({
  name,
  description,
  options,
  enabled,
  onSwitch,
}: {
  name: string;
  description: string;
  options: Option[];
  enabled: boolean;
  onSwitch: () => void;
}) {
  return (
    <div className="w-full p-3 ring-1 ring-neutral-700 rounded-lg">
      <div className="flex items-end gap-2">
        <Switch size="md" checked={enabled} onChange={onSwitch}></Switch>
        <div className={`font-bold text-xl ${enabled ? "" : "text-neutral-500"}`}>{name}</div>
      </div>
      <div className={`${enabled ? "text-neutral-400" : "text-neutral-600"} ml-14 text-sm`}>
        {description}
      </div>
      {enabled && (
        <div className="mt-3">
          {options.map((option, i) => (
            <div key={i}>
              {option.label ? (
                <div className="mt-2 ring-1 ring-neutral-700 rounded-lg px-4 pt-3 pb-7" key={i}>
                  <div className="font-bold">{option.label}</div>
                  <div className="text-neutral-400 mb-1 text-sm">{option.description}</div>
                  {option.content}
                </div>
              ) : (
                <div className="mt-2">{option.content}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
