import { listen } from "@tauri-apps/api/event";
import { createContext, useEffect, useRef } from "react";
import { useState } from "react";

export const LogsContext = createContext<{
  logs: string[];
  updateLogs: () => void;
}>({
  logs: [],
  updateLogs: () => {},
});

export function LogsProvider({ children }: { children?: React.ReactNode }) {
  const [logs, setLogs] = useState<string[]>([]);
  const buffer = useRef<string[]>([]);

  useEffect(() => {
    const unlisten = listen<string>("console-log", (event) => {
      buffer.current.push(event.payload);
      buffer.current = buffer.current.slice(-100);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const updateLogs = () => {
    setLogs([...buffer.current.slice().reverse()]);
  };

  return <LogsContext value={{ logs, updateLogs }}>{children}</LogsContext>;
}
