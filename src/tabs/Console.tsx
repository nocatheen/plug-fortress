import { Code } from "@mantine/core";
import { useContext, useEffect } from "react";
import { LogsContext } from "../contexts/LogsContext";

export function Console() {
  const { logs, updateLogs } = useContext(LogsContext);

  useEffect(() => {
    const interval = setInterval(() => {
      updateLogs();
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
