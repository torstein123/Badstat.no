import React, { useEffect, useState } from 'react';
import data from './path_to_combined_csv'; // Adjust path accordingly

const HeadToHead = ({ player1, player2 }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Filter the match data for matches between player1 and player2
    const filteredData = data.filter(match => 
        (match['Team 1 Player 1'] === player1 && match['Team 2 Player 1'] === player2) || 
        (match['Team 1 Player 1'] === player2 && match['Team 2 Player 1'] === player1));

    // Compute the statistics
    const player1Wins = filteredData.filter(match => match['Winner Player 1'] === player1).length;
    const player2Wins = filteredData.filter(match => match['Winner Player 1'] === player2).length;

    setStats({
      player1Wins,
      player2Wins,
      totalMatches: filteredData.length,
    });
  }, [player1, player2]);

  return (
    <div>
      <h2>{player1} vs {player2}</h2>
      <p>{player1} wins: {stats.player1Wins}</p>
      <p>{player2} wins: {stats.player2Wins}</p>
      <p>Total matches: {stats.totalMatches}</p>
    </div>
  );
};

export default HeadToHead;
