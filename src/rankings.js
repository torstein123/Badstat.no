import React, { useState } from 'react';
import data from './combined_rankings.json';
import SearchBar from './Search_Bar';

const Player = ({ player, rank }) => {
  const club = player.Klubb.split('|').filter(Boolean).pop(); // Extract the last visible club name
  return (
    <div>
      <h2>{player.Navn}</h2>
      <p>Rank: {rank}</p>
      <p>Class: {club}</p>
      <p>Points: {player['2023']}</p>
    </div>
  );
};

const Rankings = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const onSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredData = data.filter((player) =>
    player.Navn.toLowerCase().includes(searchTerm)
  );

  const sortedData = filteredData.sort(
    (a, b) => b['2023'] - a['2023']
  );

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
