import { Button, Slider } from "@mantine/core";

export type Feature = {
  id: number;
  name: string;
  maxPower: number;
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
        <Button h={30}>Start Test (all motors)</Button>
      </div>
      <div className="mx-5 h-1 flex justify-center items-center">
        <div className="flex-1 h-0.5 bg-neutral-600 rounded-2xl"></div>
        <div className="mx-5 flex justify-center text font-bold text-neutral-500">
          Available features
        </div>
        <div className="flex-1 h-0.5 bg-neutral-600 rounded-2xl"></div>
      </div>
      {features.map((feature, i) => (
        <div className="mt-5 ring-1 ring-neutral-700 rounded-lg px-4 pt-3 pb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">
              {feature.name} <span className="text-neutral-500 ml-1">#{i}</span>
            </div>
            <div className="text-neutral-400">Max power</div>
          </div>
          <Slider
            color="blue"
            defaultValue={feature.maxPower}
            label={(value) => `${value}%`}
            marks={[
              { value: 0, label: "Min" },
              { value: 20, label: "20%" },
              { value: 50, label: "50%" },
              { value: 80, label: "80%" },
              { value: 100, label: "Max" },
            ]}
          />
        </div>
      ))}
    </div>
  );
}
