import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import PlayerStats from "./components/PlayerStats";
import MatchHistory from "./components/MatchHistory";
import Corporations from "./components/Corporations";
import CorporationInfo from "./components/CorporationInfo";
import MatchInfo from "./components/MatchInfo";
import "./App.css";

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-100 space-x-4">
        <Link to="/">Match History</Link>
        <Link to="/players">Players</Link>
        <Link to="/corporations/all">Corporations</Link>
      </nav>

      <div className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/matches/all" replace />} />
          <Route path="/matches/all" element={<MatchHistory />} />
          <Route path="/matches/:matchId" element={<MatchInfo />} />
          <Route path="/players" element={<PlayerStats />} />
          <Route
            path="/corporations"
            element={<Navigate to="/corporations/all" replace />}
          />
          <Route path="/corporations/all" element={<Corporations />} />
          <Route
            path="/corporations/:corpNameLower"
            element={<CorporationInfo />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
