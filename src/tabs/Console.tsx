import { Code } from "@mantine/core";

export function Console({ logs }: { logs: string[] }) {
  return (
    <div className="p-5">
      <div className="flex flex-col justify-start">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            <Code block>{log}</Code>
          </div>
        ))}
      </div>
    </div>
  );
}
