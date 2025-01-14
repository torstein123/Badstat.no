import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import PlayerDetail from './PlayerDetail';
import PlayerComparison from './components/PlayerComparison';
import './Custom.scss';
import Navbar from "./Navigation/Navbar.js";
import Hvorfor from './pages/Hvorfor';
import Hvordan from './pages/Hvordan';
import ContactPage from './pages/Feedback';
import PlayerSearch from './components/PlayerSearch';
import { AuthenticationContextProvider } from './Auth-Context.js';
import RegisterScreen from './RegisterScreen'; // Update with the correct path
import AccountScreen from './AccountScreen.js'; // Update with the correct path
import { AuthenticationContext } from './Auth-Context.js'; // Adjust the import path
import Home from './components/hjemmeside.js';
import LinkRequestScreen from './components/requestLink.js';
import AdminComponent from './components/admin.js';
import Diary from './components/diary.js';
import PlayerList from './components/PlayerList.js';
import './App.css';
import Leaderboard from './components/MostGames.js';







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






const Changelog = () => {
  return (
    <div className="Oppdateringer">
      <h3>Updates 💪</h3>
      <ul>
        <li>Version 0.8.0 (01/2024): Turneringsoversikt(Spillerdetaljer)</li>
        <li>Version 0.2.0 (10/2023): Head to head - Kamper</li>
        <li>Version 0.2.0 (09/2023): Head to head - rankingpoeng</li>
        <li>Version 0.1.0 (05/2023): La til navigasjonsbar og sider</li>
        <li>Version 0.0.2 (05/2023): Kan se basic trender og mobilvennlighet</li>
        <li>Version 0.0.1 (05/2023): Development started</li>
      </ul>
    </div>
  );
};

const LoginRequired = () => {
  return <div id="login">Kun brukere har tilgang til denne funksjonen</div>;
};

const MainApp = () => {
  const { isAuthenticated, user, isLoading } = useContext(AuthenticationContext);
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>; // Customize as needed
  }


  console.log("isAuthenticated:", isAuthenticated);

  return (
    <div>
      <FlyingRackets />
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/account" element={<AccountScreen />} />
          <Route path="/" element={<Home />} />
          <Route path="/MostGames" element={<Leaderboard />} />
          {isAuthenticated ? (
            <>
              <Route path="/compare/:player1/:player2" element={<PlayerComparison />} />
              <Route path="/player/:name" element={<PlayerDetail />} />
              <Route path="/hvorfor" element={<Hvorfor />} />
              <Route path="/hvordan" element={<Hvordan />} />
              <Route path="/feedback" element={<ContactPage />} />
              <Route path="/link" element={<LinkRequestScreen />} />
              <Route path="/admin" element={<AdminComponent />} />
              <Route path="/Diary" element={<Diary userId={user?.uid} />} />
              <Route path="/playerlist" element={<PlayerList />} />
              <Route path="/headtohead" element={<PlayerSearch />} />
              <Route path="/test" element={<LoginRequired />} />
            </>
          ) : (
            <>
              <Route path="/headtohead" element={<LoginRequired />} />
              <Route path="/PlayerList" element={<LoginRequired />} />
              <Route path="/Diary" element={<LoginRequired />} />
              <Route path="/player*" element={<LoginRequired />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthenticationContextProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthenticationContextProvider>
  );
};

export default App;