import { useState } from "react";
import { Navbar } from "./components/navbar/Navbar";
import { Settings } from "./tabs/Settings";
import { Logs } from "./tabs/Logs";
import { Game } from "./tabs/Game";
import { Toy } from "./tabs/Toy";
import { LogsProvider } from "./contexts/LogsContext";
import { Blank } from "./tabs/Intro";

function App() {
  const [activeTab, setActiveTab] = useState(-1);

  const renderTabContent = () => {
    switch (activeTab) {
      case -1:
        return <Blank />;
      case 0:
        return <Game />;
      case 1:
        return <Toy />;
      case 2:
        return <Logs />;
      case 3:
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed z-10">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <LogsProvider>
        <div className="absolute left-[75px] right-0 top-0 h-dvh">{renderTabContent()}</div>
      </LogsProvider>
    </>
  );
}

export default App;
