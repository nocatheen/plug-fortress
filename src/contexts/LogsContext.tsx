import { listen } from "@tauri-apps/api/event";
import { createContext, useEffect, useRef } from "react";
import { useState } from "react";

export type KillEvent = {
  killer: string;
  victim: string;
  weapon: string;
  crit: boolean;
};
export type ChatMessageEvent = {
  player: string;
  message: string;
};
export type TeamSwapEvent = {};
export type ServerConnectEvent = {
  map: string;
};
export type ServerDisconnectEvent = {};
export type PlayerConnectEvent = {
  player: string;
};
export type TFEvent = {
  type:
    | "kill"
    | "chatMessage"
    | "teamSwap"
    | "serverConnect"
    | "serverDisconnect"
    | "playerConnect";
  event:
    | KillEvent
    | ChatMessageEvent
    | TeamSwapEvent
    | ServerConnectEvent
    | ServerDisconnectEvent
    | PlayerConnectEvent;
};

export const LogsContext = createContext<{
  logs: TFEvent[];
  updateLogs: () => void;
}>({
  logs: [],
  updateLogs: () => {},
});

export function LogsProvider({ children }: { children?: React.ReactNode }) {
  const [logs, setLogs] = useState<TFEvent[]>([]);
  const buffer = useRef<TFEvent[]>([]);
  const prevBuffer = useRef<TFEvent[]>([]);

  useEffect(() => {
    const unlistenKill = listen<KillEvent>("kill", (event) => {
      buffer.current.push({
        type: "kill",
        event: event.payload,
      });
      buffer.current = buffer.current.slice(-100);
    });
    const unlistenChatMessage = listen<ChatMessageEvent>("chat-message", (event) => {
      buffer.current.push({
        type: "chatMessage",
        event: event.payload,
      });
      buffer.current = buffer.current.slice(-100);
    });
    const unlistenTeamSwapEvent = listen<TeamSwapEvent>("team-swap", (event) => {
      buffer.current.push({
        type: "teamSwap",
        event: event.payload,
      });
      buffer.current = buffer.current.slice(-100);
    });
    const unlistenServerConnectEvent = listen<ServerConnectEvent>("server-connect", (event) => {
      buffer.current.push({
        type: "serverConnect",
        event: event.payload,
      });
      buffer.current = buffer.current.slice(-100);
    });
    const unlistenServerDisconnectEvent = listen<ServerDisconnectEvent>(
      "server-disconnect",
      (event) => {
        buffer.current.push({
          type: "serverDisconnect",
          event: event.payload,
        });
        buffer.current = buffer.current.slice(-100);
      }
    );
    const unlistenPlayerConnectEvent = listen<PlayerConnectEvent>("player-connect", (event) => {
      buffer.current.push({
        type: "playerConnect",
        event: event.payload,
      });
      buffer.current = buffer.current.slice(-100);
    });

    return () => {
      unlistenKill.then((f) => f());
      unlistenChatMessage.then((f) => f());
      unlistenTeamSwapEvent.then((f) => f());
      unlistenServerConnectEvent.then((f) => f());
      unlistenServerDisconnectEvent.then((f) => f());
      unlistenPlayerConnectEvent.then((f) => f());
    };
  }, []);

  const updateLogs = () => {
    if (buffer.current == prevBuffer.current) return;
    prevBuffer.current = buffer.current;
    setLogs([...buffer.current.slice()]);
  };

  return <LogsContext value={{ logs, updateLogs }}>{children}</LogsContext>;
}
