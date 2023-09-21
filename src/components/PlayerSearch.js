import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../combined_rankings.json';

const PlayerSearch = () => {
  const [player1, setPlayer1] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [player2, setPlayer2] = useState('');
  const navigate = useNavigate();

  const handleSearch1 = (term) => {
    const filteredData = data.filter(player => player.Navn.toLowerCase().includes(term.toLowerCase()));
    setSuggestions1(filteredData.slice(0, 5));
  };

  const handleSearch2 = (term) => {
    const filteredData = data.filter(player => player.Navn.toLowerCase().includes(term.toLowerCase()));
    setSuggestions2(filteredData.slice(0, 5));
  };

  const renderWarning = () => {
    if (!player1 || !player2) {
      return <p>Both player fields must be filled.</p>;
    }
    return null;
  };

  const handleCompare = () => {
    navigate(`/compare/${encodeURIComponent(player1)}/${encodeURIComponent(player2)}`);
  };

  return (
    <div>
      {renderWarning()}
      <input type="text" placeholder="Player 1" value={player1} onChange={(e) => { setPlayer1(e.target.value); handleSearch1(e.target.value); }} />
      <ul>
        {suggestions1.map((suggestion, index) => (
          <li key={index} onClick={() => setPlayer1(suggestion.Navn)}>{suggestion.Navn}</li>
        ))}
      </ul>
      <input type="text" placeholder="Player 2" value={player2} onChange={(e) => { setPlayer2(e.target.value); handleSearch2(e.target.value); }} />
      <ul>
        {suggestions2.map((suggestion, index) => (
          <li key={index} onClick={() => setPlayer2(suggestion.Navn)}>{suggestion.Navn}</li>
        ))}
      </ul>
      <button onClick={handleCompare}>Compare</button>
    </div>
  );
};

export default PlayerSearch;
