import { Switch } from "@mantine/core";

export type Option = {
  label?: string;
  description?: string;
  count_id?: boolean;
  content: React.ReactNode;
};

export function ToggableCard({
  name,
  description,
  options,
  enabled,
  onSwitch,
}: {
  name: string;
  description?: string;
  options: Option[];
  enabled: boolean;
  onSwitch: () => void;
}) {
  return (
    <div className="w-full p-3 ring-1 ring-neutral-700 rounded-lg">
      <div className={`flex items-end gap-2 ${description ? "" : "mb-1"}`}>
        <Switch size="md" checked={enabled} onChange={onSwitch}></Switch>
        <div className={`font-bold text-xl ${enabled ? "" : "text-neutral-500"}`}>{name}</div>
      </div>
      {description && (
        <div className={`${enabled ? "text-neutral-400" : "text-neutral-600"} ml-14 text-sm`}>
          {description}
        </div>
      )}

      {enabled && (
        <div className="mt-3">
          {options.map((option, i) => (
            <div key={i}>
              {option.label ? (
                <div className="mt-2 ring-1 ring-neutral-700 rounded-lg px-4 pt-3 pb-7" key={i}>
                  <div className="flex justify-between">
                    <div className="font-bold">{option.label}</div>
                    {option.count_id && <div className="font-bold text-neutral-500">#{i}</div>}
                  </div>
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
