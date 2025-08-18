import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import JLink from "./components/JLink";
import PlayerStats from "./pages/PlayerStats";
import MatchHistory from "./pages/MatchHistory";
import Corporations from "./pages/Corporations";
import CorporationInfo from "./pages/CorporationInfo";
import PlayerInfo from "./pages/PlayerInfo";
import MatchInfo from "./pages/MatchInfo";
import NewMatch from "./pages/NewMatch";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-100 space-x-4">
        <JLink variant="nav" to="/new">
          New Match
        </JLink>
        <JLink variant="nav" to="/">
          Match History
        </JLink>
        <JLink variant="nav" to="/players/all">
          Players
        </JLink>
        <JLink variant="nav" to="/corporations/all">
          Corporations
        </JLink>
      </nav>

      <div className="p-4">
        <Routes>
          {/* New */}
          <Route path="/new" element={<NewMatch />} />
          {/* Matches */}
          <Route path="/" element={<Navigate to="/matches/all" replace />} />
          <Route
            path="/matches"
            element={<Navigate to="/matches/all" replace />}
          />
          <Route path="/matches/all" element={<MatchHistory />} />
          <Route path="/matches/:matchId" element={<MatchInfo />} />

          {/* Players */}
          <Route
            path="/players"
            element={<Navigate to="/players/all" replace />}
          />
          <Route path="/players/all" element={<PlayerStats />} />
          <Route path="/players/:playerId" element={<PlayerInfo />} />

          {/* Corporations */}
          <Route
            path="/corporations"
            element={<Navigate to="/corporations/all" replace />}
          />
          <Route path="/corporations/all" element={<Corporations />} />
          <Route path="/corporations/:corpId" element={<CorporationInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
