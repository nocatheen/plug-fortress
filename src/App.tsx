import { useState } from "react";
import { NavbarMinimal } from "./components/NavbarMinimal";
import { Settings } from "./tabs/Settings";
import { Console } from "./tabs/Console";
import { Game } from "./tabs/Game";
import { Kills } from "./tabs/Kills";
import { Duels } from "./tabs/Duels";
import { LogsProvider } from "./contexts/LogsContext";

function App() {
  const [activeTab, setActiveTab] = useState(4);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Game />;
      case 1:
        return <Kills />;
      case 2:
        return <Duels />;
      case 3:
        return <Console />;
      case 4:
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed z-10">
        <NavbarMinimal activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <LogsProvider>
        <div className="absolute left-[75px] right-0 top-0 h-dvh">{renderTabContent()}</div>
      </LogsProvider>
    </>
  );
}

export default App;
