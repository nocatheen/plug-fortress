import { useState } from "react";
import { NavbarMinimal } from "./components/NavbarMinimal";
import { Settings } from "./tabs/Settings";
import { Console } from "./tabs/Console";
import { Game } from "./tabs/Game";
import { Kills } from "./tabs/Kills";
import { Duels } from "./tabs/Duels";

function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\n";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function generateRandomStringArray(arrayLength: number, stringLength: number): string[] {
  const randomStrings: string[] = [];
  for (let i = 0; i < arrayLength; i++) {
    randomStrings.push(generateRandomString(stringLength));
  }
  return randomStrings;
}

function App() {
  const [activeTab, setActiveTab] = useState(3);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Game />;
      case 1:
        return <Kills />;
      case 2:
        return <Duels />;
      case 3:
        return <Console logs={generateRandomStringArray(100, 50)} />;
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
      <div className="absolute left-[75px] right-0 top-0 h-dvh">{renderTabContent()}</div>
    </>
  );
}

export default App;
