import { useContext, useEffect } from "react";
import {
  ChatMessageEvent,
  KillEvent,
  LogsContext,
  PlayerConnectEvent,
  ServerConnectEvent,
  ServerDisconnectEvent,
  TeamSwapEvent,
  TFEvent,
} from "../contexts/LogsContext";
import { Killicon } from "../components/Killicon";

export function Logs() {
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
      <div className="flex flex-col justify-start">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
            <Event key={i} event={log} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Event({ event }: { event: TFEvent }) {
  console.log(event);
  if (event.type === "kill") {
    const e = event.event as KillEvent;
    return <Kill killer={e.victim} victim={e.killer} weapon={e.weapon} crit={e.crit} />;
  }
  if (event.type === "chatMessage") {
    const e = event.event as ChatMessageEvent;
    return <></>;
  }
  if (event.type === "teamSwap") {
    const e = event.event as TeamSwapEvent;
    return <></>;
  }
  if (event.type === "serverConnect") {
    const e = event.event as ServerConnectEvent;
    return <></>;
  }
  if (event.type === "serverDisconnect") {
    const e = event.event as ServerDisconnectEvent;
    return <></>;
  }
  if (event.type === "playerConnect") {
    const e = event.event as PlayerConnectEvent;
    return <></>;
  }
  return <></>;
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
  return (
    <div className="tf2build text-xl bg-[#f1e9cb] w-fit h-10 rounded-md flex items-center">
      <div className="text-[#a3574a] mx-5">{killer}</div>
      <div className="relative h-full w-fit">
        {crit && <div className="absolute inset-0 bg-radial from-red-400 to-transparent to-50%" />}
        <div className="relative flex items-center justify-center w-full h-full">
          <Killicon icon={weapon} />
        </div>
      </div>

      <div className="text-[#557c83] mx-5">{victim}</div>
    </div>
  );
}
