import "./App.css";
import PlayerStats from "./components/PlayerStats";
import Corporations from "./components/Corporations";
import MatchHistory from "./components/MatchHistory";
function App() {
  return (
    <>
      <MatchHistory />
      <PlayerStats />
      <Corporations />
    </>
  );
}

export default App;
