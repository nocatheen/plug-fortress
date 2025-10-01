import { openUrl } from "@tauri-apps/plugin-opener";
import { Typography } from "@mantine/core";
import { Dot } from "lucide-react";
import { JSX, useEffect } from "react";

export function InfoTab({ onReady }: { onReady: () => void }): JSX.Element | null {
  useEffect(() => {
    onReady();
  }, []);

  return (
    <>
      <div className="px-10 py-5">
        <Typography>
          <h2>Haii!</h2>
          <p>
            If you, for some reason, still haven't got it yet, this is a <b>sex toy app</b>. More
            specifically, an app that allows your{" "}
            <Link link="https://buttplug.io/">buttplug.io</Link> compatable toys to work with the
            game <Link link="https://www.teamfortress.com/">Team Fortress 2</Link>. Even more
            specifically, it listens for and makes your <b>sex toy</b> vibrate on game events such
            as:
          </p>
          <p>
            <span className="flex">
              <Dot /> Kills :]
            </span>
            <span className="flex">
              <Dot /> Killstreaks! :D
            </span>
            <span className="flex">
              <Dot /> Deaths :[
            </span>
            <span className="flex">
              <Dot /> Deathtreaks? :(
            </span>
            <span className="flex">
              <Dot /> ...chat messages..?
            </span>
          </p>
          <p>
            If this is what you're looking for, then go and check out the{" "}
            <Link link="">tutorial</Link>! Or you can try just figuring out everything by yourself.
          </p>
          <p>
            Also, this app is based on the simular project{" "}
            <Link link="https://github.com/fionafibration/team-frotress-2">
              Team Frotress 2 (GitHub)
            </Link>
            . It has simular features, and the app you're using right now is basically just a
            user-friendly, GUI version of team-frotress-2.
          </p>
        </Typography>
      </div>
    </>
  );
}

function Link({ children, link }: { children: React.ReactNode; link: string }) {
  return (
    <a className="cursor-pointer" onClick={() => openUrl(link)}>
      {children}
    </a>
  );
}
