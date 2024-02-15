import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../combined_rankings.json';
import './PlayerSearch.css';
import AsyncSelect from 'react-select/async';

const PlayerSearch = () => {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const navigate = useNavigate();

  // State to store the current window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterPlayers = (inputValue) => {
    return data.filter(player =>
      player.Navn.toLowerCase().includes(inputValue.toLowerCase())
    ).map(player => ({ value: player.Navn, label: player.Navn }));
  };

  const loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(filterPlayers(inputValue));
    }, 300);
  };

  const handleChange1 = (selectedOption) => {
    setPlayer1(selectedOption);
  };

  const handleChange2 = (selectedOption) => {
    setPlayer2(selectedOption);
  };

  const handleCompare = () => {
    if (player1 && player2) {
      navigate(`/compare/${encodeURIComponent(player1.value)}/${encodeURIComponent(player2.value)}`);
    }
  };

  // Update customStyles with conditional logic based on windowWidth
  const customStyles = {
    control: (base) => ({
      ...base,
      cursor: 'text',
      width: '100%', // Use 100% width for responsive design
      minWidth: '300px',
    }),
  };

  return (
    <div className="headerandinput">
      <div className="input-container">
        <h1 className="header">Head to head </h1>
        <div className="suggestion-container">
          <AsyncSelect
            loadOptions={loadOptions}
            onChange={handleChange1}
            value={player1}
            defaultOptions={[]}
            cacheOptions
            styles={customStyles}
            placeholder="Spiller 1"
          />
          <h1 className="versus">VS</h1>
          <AsyncSelect
            loadOptions={loadOptions}
            onChange={handleChange2}
            value={player2}
            defaultOptions={[]}
            cacheOptions
            styles={customStyles}
            placeholder="Spiller 2"
          />
          </div>
        <button className="compare-button" onClick={handleCompare}>
          Sammenligne
        </button>
      </div>
    </div>
  );
};

export default PlayerSearch;
