import React from 'react';

const PlayerTournaments = ({ playerName, playerTournaments }) => {
  // Ensure the playerTournaments is an array and filter the tournaments for the specific player
  const filteredTournaments = Array.isArray(playerTournaments) ? playerTournaments.filter(tournament =>
    tournament['Team 1 Player 2'] === playerName ||
    tournament['Team 2 Player 2'] === playerName
  ) : [];

  return (
    <div>
      {filteredTournaments.length > 0 ? (
        filteredTournaments.map((tournament, index) => (
          <div key={index}>
            <p>Season: {tournament['Season']}</p>
            <p>Tournament Name: {tournament['Tournament Name']}</p>
            <p>Date: {tournament['Date']}</p>
            <p>Tournament Class: {tournament['Tournament Class']}</p>
            <p>Result: {tournament['Result']}</p>
            {/* ... include other details as needed ... */}
          </div>
        ))
      ) : (
        <p>No tournaments found for player {playerName}.</p>
      )}
    </div>
  );
};

export default PlayerTournaments;
