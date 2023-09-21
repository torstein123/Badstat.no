import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../combined_rankings.json';
import './PlayerSearch.css';

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
};

const PlayerSearch = () => {
  const [player1, setPlayer1] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [selectedIndex1, setSelectedIndex1] = useState(-1);
  const [player2, setPlayer2] = useState('');
  const [suggestions2, setSuggestions2] = useState([]);
  const [selectedIndex2, setSelectedIndex2] = useState(-1);

  const debouncedSearchTerm1 = useDebounce(player1, 300);
  const debouncedSearchTerm2 = useDebounce(player2, 300);

  const navigate = useNavigate();
  const wrapperRef1 = useRef(null);
  const wrapperRef2 = useRef(null);

  useEffect(() => {
    if (debouncedSearchTerm1) {
      handleSearch1(debouncedSearchTerm1);
    }
  }, [debouncedSearchTerm1]);

  useEffect(() => {
    if (debouncedSearchTerm2) {
      handleSearch2(debouncedSearchTerm2);
    }
  }, [debouncedSearchTerm2]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside1);
    document.addEventListener('mousedown', handleClickOutside2);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside1);
      document.removeEventListener('mousedown', handleClickOutside2);
    };
  }, []);

  const handleSearch1 = (term) => {
    const filteredData = data.filter(player => player.Navn.toLowerCase().includes(term.toLowerCase()));
    setSuggestions1(filteredData.slice(0, 5));
  };

  const handleSearch2 = (term) => {
    const filteredData = data.filter(player => player.Navn.toLowerCase().includes(term.toLowerCase()));
    setSuggestions2(filteredData.slice(0, 5));
  };

  const handleCompare = () => {
    if (player1 && player2) {
      navigate(`/compare/${encodeURIComponent(player1)}/${encodeURIComponent(player2)}`);
    }
  };

  const handleClickOutside1 = event => {
    if (wrapperRef1.current && !wrapperRef1.current.contains(event.target)) {
      setSuggestions1([]);
    }
  };

  const handleClickOutside2 = event => {
    if (wrapperRef2.current && !wrapperRef2.current.contains(event.target)) {
      setSuggestions2([]);
    }
  };

  const handleKeyDown1 = (e) => {
    if (e.keyCode === 38 && selectedIndex1 > 0) {
      setSelectedIndex1(selectedIndex1 - 1);
    } else if (e.keyCode === 40 && selectedIndex1 < suggestions1.length - 1) {
      setSelectedIndex1(selectedIndex1 + 1);
    } else if (e.keyCode === 13 && selectedIndex1 !== -1) {
      setPlayer1(suggestions1[selectedIndex1].Navn);
      setSuggestions1([]);
      setSelectedIndex1(-1);
    }
  };

  const handleKeyDown2 = (e) => {
    if (e.keyCode === 38 && selectedIndex2 > 0) {
      setSelectedIndex2(selectedIndex2 - 1);
    } else if (e.keyCode === 40 && selectedIndex2 < suggestions2.length - 1) {
      setSelectedIndex2(selectedIndex2 + 1);
    } else if (e.keyCode === 13 && selectedIndex2 !== -1) {
      setPlayer2(suggestions2[selectedIndex2].Navn);
      setSuggestions2([]);
      setSelectedIndex2(-1);
    }
  };

  return (
    <div>
      <div className="input-container">
        <div className="suggestion-container">
          <input
            type="text"
            placeholder="Player 1"
            value={player1}
            onChange={(e) => { setPlayer1(e.target.value); handleSearch1(e.target.value); }}
          />
          <ul className="no-bullets">
            {suggestions1.map((suggestion, index) => (
              <li key={index} onClick={() => setPlayer1(suggestion.Navn)}>{suggestion.Navn}</li>
            ))}
          </ul>
        </div>
        <div className="suggestion-container">
          <input
            type="text"
            placeholder="Player 2"
            value={player2}
            onChange={(e) => { setPlayer2(e.target.value); handleSearch2(e.target.value); }}
          />
          <ul className="no-bullets">
            {suggestions2.map((suggestion, index) => (
              <li key={index} onClick={() => setPlayer2(suggestion.Navn)}>{suggestion.Navn}</li>
            ))}
          </ul>
        </div>
        <button onClick={handleCompare}>Compare</button>
      </div>
    </div>
  );
};





export default PlayerSearch;
