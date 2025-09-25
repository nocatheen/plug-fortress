import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ChatMessageEvent,
  KillEvent,
  LogsContext,
  PlayerConnectEvent,
  ServerConnectEvent,
  TFEvent,
} from "../contexts/LogsContext";
import { Killicon } from "../components/Killicon";
import { Earth, MessageSquare, Shuffle, Unplug, UserRoundPlus } from "lucide-react";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { invoke } from "@tauri-apps/api/core";
import { Settings } from "./Settings";

const NameContext = createContext<{
  name: string;
}>({
  name: "",
});

export function Logs() {
  const { logs, updateLogs } = useContext(LogsContext);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useScrollToBottom(scrollRef.current, logs);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const settings = await invoke<Settings>("get_settings");
      setName(settings.username);
    })();

    const interval = setInterval(() => {
      updateLogs();
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <NameContext value={{ name }}>
      <div className="mx-5 my-5 pb-5">
        <div className="flex flex-col justify-start">
          {logs.map((log, i) => (
            <Event key={i} event={log} />
          ))}
          <div ref={scrollRef}></div>
        </div>
      </div>
    </NameContext>
  );
}
function Kill({
  killer,
  victim,
  weapon,
  crit,
}: {
  killer: string;
  victim: string;
  weapon: string;
  crit: boolean;
}) {
  const { name } = useContext(NameContext);

  return (
    <div className="w-full flex justify-end my-1">
      <div
        className={[
          "tf2build text-xl w-fit h-10 rounded-md flex items-center",
          killer === name || victim === name ? "bg-[#f1e9cb]" : "bg-[#1f1e1b]",
        ].join(" ")}
      >
        <div className={["mx-5", killer === name || victim === name ? "text-[#a3574a]" : "text-[#c2695a]"].join(" ")}>
          {killer}
        </div>
        <div className="relative h-full w-16">
          {crit && (
            <div className="absolute inset-0 bg-radial from-red-500/50 to-transparent to-50%" />
          )}
          <div
            className={[
              "relative flex items-center justify-center w-full h-full",
              killer === name || victim === name || "sepia-100 brightness-350",
            ].join(" ")}
          >
            <Killicon icon={weapon} />
          </div>
        </div>

        <div className={["mx-5", killer === name || victim === name ? "text-[#557c83]" : "text-[#608f97]"].join(" ")}>
          {victim}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ player, message }: { player: string; message: string }) {
  return (
    <div className="w-full flex justify-between bg-[#4b4b4b] text-[#fbefdb] items-center">
      <div className="w-full flex verdana px-2 text-shadow-black text-shadow-xs">
        <div className="text-[#9cd3fe]">{player}</div>
        <div className="ml-1 mr-2">:</div>
        <div>{message}</div>
      </div>
      <MessageSquare size={16} className="mr-2" />
    </div>
  );
}

function TeamSwap() {
  return (
    <div className="w-full bg-[#4b4b4b] flex items-center justify-between verdana px-2 text-shadow-black text-shadow-xs text-[#fbefdb]">
      Teams have been switched. <Shuffle size={16} />
    </div>
  );
}

function ServerConnect({ map }: { map: string }) {
  return (
    <div className="w-full h-10 flex justify-center items-center">
      <div className="flex-1 h-0.5 bg-white/40 rounded-2xl"></div>
      <div className="ml-4 mr-2 flex justify-center">
        <Earth size={20} />
      </div>
      <div className="mr-4 flex justify-center font-semibold">{map}</div>
      <div className="flex-1 h-0.5 bg-white/40 rounded-2xl"></div>
    </div>
  );
}

function ServerDisconnect() {
  return (
    <div className="w-full h-10 flex justify-center items-center">
      <div className="flex-1 h-0.5 bg-white/40 rounded-2xl"></div>
      <div className="mx-2 flex justify-center">
        <Unplug size={20} />
      </div>
      <div className="flex-1 h-0.5 bg-white/40 rounded-2xl"></div>
    </div>
  );
}

function PlayerConnect({ player }: { player: string }) {
  return (
    <div className="w-full bg-[#4b4b4b] flex items-center justify-between verdana px-2 text-shadow-black text-shadow-xs text-[#fbefdb]">
      {player} has joined the game. <UserRoundPlus size={16} />
    </div>
  );
}

function Event({ event }: { event: TFEvent }) {
  if (event.type === "kill") {
    const e = event.event as KillEvent;
    return <Kill killer={e.killer} victim={e.victim} weapon={e.weapon} crit={e.crit} />;
  }
  if (event.type === "chatMessage") {
    const e = event.event as ChatMessageEvent;
    return <ChatMessage player={e.player} message={e.message} />;
  }
  if (event.type === "teamSwap") {
    return <TeamSwap />;
  }
  if (event.type === "serverConnect") {
    const e = event.event as ServerConnectEvent;
    return <ServerConnect map={e.map} />;
  }
  if (event.type === "serverDisconnect") {
    return <ServerDisconnect />;
  }
  if (event.type === "playerConnect") {
    const e = event.event as PlayerConnectEvent;
    return <PlayerConnect player={e.player} />;
  }
  return <></>;
}
