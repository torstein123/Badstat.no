import React, { useState, useEffect } from 'react';
import { getAllRankings } from './services/databaseService';
import SearchBar from './Search_Bar';

const Player = ({ player, rank }) => {
  const club = player['All Clubs'] ? player['All Clubs'].split('|').filter(Boolean).pop() : ''; // Extract the last visible club name
  return (
    <div>
      <h2>{player.Navn}</h2>
      <p>Rank: {rank}</p>
      <p>Class: {club}</p>
      <p>Points: {player['2024']}</p>
    </div>
  );
};

const Rankings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rankingsData = await getAllRankings();
        setData(rankingsData);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredData = data.filter((player) =>
    player.Navn && player.Navn.toLowerCase().includes(searchTerm)
  );

  const sortedData = filteredData.sort(
    (a, b) => (b['2024'] || 0) - (a['2024'] || 0)
  );

  if (loading) {
    return <div>Loading rankings...</div>;
  }

  return (
    <div>
      <SearchBar onSearch={onSearch} />
      {sortedData.map((player, index) => (
        <Player key={index} player={player} rank={index + 1} />
      ))}
    </div>
  );
};

export default Rankings;
