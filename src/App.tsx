import { useEffect, useState } from "react";
import { Navbar } from "./components/navbar/Navbar";
import { Device, SettingsTab } from "./tabs/SettingsTab";
import { LogsTab } from "./tabs/LogsTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { ToyTab } from "./tabs/ToyTab";
import { LogsProvider } from "./contexts/LogsContext";
import { InfoTab } from "./tabs/InfoTab";
import { Calendar, Gamepad, Info, Joystick, Settings } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { notifications } from "@mantine/notifications";

function App() {
  const [loadingTab, setLoadingTab] = useState(4);
  const [activeTab, setActiveTab] = useState(4);

  const links = [
    { icon: Gamepad, label: "Features" },
    { icon: Joystick, label: "Toy" },
    { icon: Calendar, label: "Events" },
    { icon: Settings, label: "Settings" },
    { icon: Info, label: "About" },
  ];

  const tabs: (typeof FeaturesTab)[] = [FeaturesTab, ToyTab, LogsTab, SettingsTab, InfoTab];

  useEffect(() => {
    const unlistenDeviceAdded = listen<Device>("bp-device-added", async (event) => {
      notifications.show({
        title: "New device found",
        message: event.payload.name,
      });
    });
    const unlistenDeviceRemove = listen<Device>("bp-device-removed", async (event) => {
      notifications.show({
        title: "Device removed",
        message: event.payload.name,
        color: "red",
      });
    });

    return () => {
      unlistenDeviceAdded.then((f) => f());
      unlistenDeviceRemove.then((f) => f());
    };
  }, []);

  return (
    <>
      <div className="fixed z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setLoadingTab}
          data={links}
          loadingTab={loadingTab}
        />
      </div>
      <LogsProvider>
        <div className="absolute left-[75px] right-0 top-0 h-dvh">
          {tabs.map((Tab, i) => (
            <div key={i}>
              {(loadingTab === i || activeTab === i) && (
                <Tab
                  onReady={() => {
                    setActiveTab(i);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </LogsProvider>
    </>
  );
}

export default App;
