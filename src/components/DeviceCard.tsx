import { Button, Slider } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";

export type Feature = {
  id: number;
  name: string;
  step_count: number;
  max_step: number;
};

export function DeviceCard({
  id,
  name,
  features,
}: {
  id: number;
  name: string;
  features: Feature[];
}) {
  return (
    <div className="w-full p-5 ring-1 ring-neutral-700 rounded-lg">
      <div className="flex justify-between mb-4">
        <div className="font-bold text-2xl">{name}</div>
        <Button h={30} onClick={() => invoke("test_selected", { active: true })}>
          Start Test (all motors)
        </Button>
      </div>
      <div className="mx-5 h-1 flex justify-center items-center">
        <div className="flex-1 h-0.5 bg-neutral-600 rounded-2xl"></div>
        <div className="mx-5 flex justify-center text font-bold text-neutral-500">
          Available features
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
