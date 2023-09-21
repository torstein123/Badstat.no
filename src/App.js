import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PlayerDetail from './PlayerDetail';
import PlayerComparison from './components/PlayerComparison';
import data from './combined_rankings.json';
import './Custom.scss';
import Navbar from "./Navigation/Navbar.js";
import Home from './pages/Home';
import Hvorfor from './pages/Hvorfor';
import Hvordan from './pages/Hvordan';
import ContactPage from './pages/Feedback';
import PlayerSearch from './components/PlayerSearch';

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
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleSearch = (term) => {
    const filteredData = data.filter((player) =>
      player.Navn.toLowerCase().startsWith(term.toLowerCase())
    );
    if (filteredData.length > 0) {
      setSuggestions(filteredData.slice(0, 5));
    } else {
      setSuggestions([]);
    }
    setSearch(term);
  };



  const handleKeyDown = (e) => {
    if (e.keyCode === 38 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (e.keyCode === 40 && selectedIndex < suggestions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.keyCode === 13 && selectedIndex !== -1) {
      setSearch(suggestions[selectedIndex].Navn);
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };


  return (
    <div className="PlayerList">
      <h1>Se rankingliste, statistikk og historie fra 2013-2023🏸</h1>
      <input
        type="text"
        placeholder="Søk etter spiller"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <ul className="no-bullets">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <span
                
                style={{ cursor: 'pointer' }}
              >
                <Link to={`/player/${encodeURIComponent(suggestion.Navn)}`}>
                  {suggestion.Navn}
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
      {/* Your existing player list rendering code */}
      <div className="player-list">
        {/* Your existing player list rendering code */}
      </div>
    </div>
  );
};





const Changelog = () => {
  return (
    <div className="Changelog">
      <h3>Updates 💪</h3>
      <ul>
        <li>Version 0.2.0 (09/2023): Head to head - rankingpoeng</li>
        <li>Version 0.1.0 (05/2023): La til navigasjonsbar og sider</li>
        <li>Version 0.0.2 (05/2023): Kan se basic trender og mobilvennlighet</li>
        <li>Version 0.0.1 (05/2023): Development started</li>
      </ul>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="footer">
      <p>Sist oppdatert 19.09.2023</p>
      <p>Utviklet av Torstein Olsen</p>
      <p>Data er hentet fra badmintonportalen.</p>
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
          <Route path="/compare/:player1/:player2" element={<PlayerComparison />} />
          <Route path="/player/:name" element={<PlayerDetail />} />
          <Route path="/hjem" element={<Home />} />
          <Route path="/hvorfor" element={<Hvorfor />} />
          <Route path="/hvordan" element={<Hvordan />} />
          <Route path="/feedback" element={<ContactPage />} />
          <Route path="/" element={<>
            <PlayerList /> {/* Render PlayerList */}
            <PlayerSearch /> {/* Always render PlayerSearch */}
            <Changelog /> {/* Render Changelog */}
          </>} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};
export default App;

