import { Code, Title, Text } from "@mantine/core";
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
    <div className="mx-10 my-5">
      <div className="mb-10">
        <Title>Console</Title>
        <Text size="sm">New logs appear on top</Text>
      </div>
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
