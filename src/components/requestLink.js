import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { searchPlayers } from '../services/databaseService';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Import your Firebase configuration here
import { auth } from '../firebase'; // Import your Firebase auth configuration here
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions

const LinkRequest = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term) => {
    if (!term || term.trim() === '') {
      setSuggestions([]);
      setSearch(term);
      return;
    }

    try {
      setLoading(true);
      const players = await searchPlayers(term);
      const filteredData = players.filter((player) =>
        player.Navn.toLowerCase().startsWith(term.toLowerCase())
      );
      
      if (filteredData.length > 0) {
        setSuggestions(filteredData.slice(0, 5));
      } else {
        setSuggestions([]);
      }
      setSearch(term);
    } catch (error) {
      console.error('Error searching players:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Define the addLinkRequest function outside of handleKeyDown
  const addLinkRequest = async (playerName, userId) => {
    const linkRequestsRef = collection(db, 'link requests');
    try {
      const docRef = await addDoc(linkRequestsRef, {
        playerName,
        status: 'accepted',
        userId,
      });
    } catch (error) {
      console.error('Error adding link request: ', error);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 && selectedIndex !== -1) {
      const selectedSuggestion = suggestions[selectedIndex];
      setSearch(selectedSuggestion.Navn);
      setSuggestions([]);
      setSelectedIndex(-1);
  
      // Get the currently authenticated user
      const user = auth.currentUser;
  
      if (user) {
        // Use the user's UID as the userId
        const userId = user.uid;
  
        // Call the addLinkRequest function to add the selected suggestion to the database
        addLinkRequest(selectedSuggestion.Navn, userId);
      }
    }
  };
  

  { suggestions.length > 0 && (
    <ul className="no-bullets">
      {suggestions.map((suggestion, index) => (
        <li key={index}>
          <span style={{ cursor: 'pointer' }} onClick={() => handleSuggestionClick(suggestion)}>
            <Link to={`/player/${encodeURIComponent(suggestion.Navn)}`}>
              {suggestion.Navn}
            </Link>
          </span>
        </li>
      ))}
    </ul>
  )}

  const handleSuggestionClick = (selectedSuggestion) => {
    setSearch(selectedSuggestion.Navn);
    setSuggestions([]);
  
    // Get the currently authenticated user
    const user = auth.currentUser;
  
    if (user) {
      // Use the user's UID as the userId
      const userId = user.uid;
  
      // Call the addLinkRequest function to add the selected suggestion to the database
      addLinkRequest(selectedSuggestion.Navn, userId);
    }
  };
  

  return (
    <div className="PlayerList">
      <h1>Gjør krav på spillerprofil🏸</h1>
      <input
        type="text"
        placeholder="Søk etter spiller"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {loading && <p>Laster...</p>}
      {suggestions.length > 0 && (
        <ul className="no-bullets">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <span style={{ cursor: 'pointer' }}>
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

export default LinkRequest;
