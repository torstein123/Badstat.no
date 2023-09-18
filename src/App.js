import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PlayerDetail from './PlayerDetail';
import data from './combined_rankings.json';
import './Custom.scss';
import Navbar from "./Navigation/Navbar.js";
import Home from './pages/Home';
import Hvorfor from './pages/Hvorfor';
import Hvordan from './pages/Hvordan';
import ContactPage from './pages/Feedback';


const FlyingRackets = () => {
  const rackets = Array.from({ length: 2 });

  return (
    <div className="flying-rackets">
      {rackets.map((_, index) => {
        const animationDuration = 20;
        const left = Math.random() * 150;
        const top = Math.random() * 150;

        return (
          <div
            key={index}
            className="racket"
            style={{
              animation: `flyAndRotate ${animationDuration}s linear infinite`,
              left: `${left}%`,
              top: `${top}%`,
            }}
          >
            🏸
          </div>
        );
      })}
    </div>
  );
};

const PlayerList = () => {
  const [search, setSearch] = React.useState('');
  const filteredData = data.filter(
    (player) =>
      player.Navn.toLowerCase().includes(search.toLowerCase()) ||
      player.Klubb.toLowerCase().includes(search.toLowerCase())
  );
  const sortedData = filteredData.sort((a, b) => b['2022'] - a['2022']);
  const results = sortedData.slice(0, 20);
  const isSearching = search.length > 0; // Check if user is searching

  return (
    <div className="PlayerList">
      <h1>Se rankingliste, statistikk og historie for 2013-2023🏸</h1>
      <input
        type="text"
        placeholder="Søk etter spiller eller klubb"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isSearching ? (
        <h2>
          Søker... <span className="rotating-emoji">🔍</span>
        </h2>
      ) : (
        <h2>Topp 20 i 2022/2023 🤩</h2>
      )}
      <div className="player-list">
        {results.map((item, index) => {
          const club = item.Klubb.split('|').filter(Boolean).pop(); // Extract the last visible club name
          return (
            <div key={index} className="player-item">
              <span className="ranking">{index + 1}.</span>
              <Link to={`/player/${encodeURIComponent(item.Navn)}`}>
                {item.Navn}
              </Link>
              : {club} - {item['2022']}
            </div>
          );
        })}
      </div>
      <Changelog />
    </div>
  );
};

const Changelog = () => {
  return (
    <div className="Changelog">
      <h3>Updates 💪</h3>
      <ul>
        <li>Version 0.1.0 (05/2023): La til navigasjonsbar og sider</li>
        <li>Version 0.0.2 (05/2023): Kan se basic trender og mobilvennlighet</li>
        <li>Version 0.0.1 (05/2023): Development started</li>
      </ul>
      <button className="button-link">Gi feedback</button>
    </div>
  );
};


const App = () => {
  const bodyStyle = {
    backgroundColor: "#36393f",
  };

  return (
    <Router>
    <FlyingRackets />
    <Navbar />
    <div className="main-content" style={bodyStyle}>
      <Routes>
        <Route path="/" element={<PlayerList />} />
        <Route path="/player/:name" element={<PlayerDetail />} />
        <Route path="/hjem" element={<Home />} />
        <Route path="/hvorfor" element={<Hvorfor />} />
        <Route path="/hvordan" element={<Hvordan />} />
        <Route path="/feedback" element={<ContactPage />} />

      </Routes>
    </div>
  </Router>
  );
};

export default App;

