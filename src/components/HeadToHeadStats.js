import React from 'react';

function HeadToHeadStats({ player1, player2, headToHeadMatches }) {
    // Filter matches where player1 won
    const player1Wins = headToHeadMatches.filter(match => (
        match["Winner Player 1"] === player1 || match["Winner Player 2"] === player1
    )).length;

    // Filter matches where player2 won
    const player2Wins = headToHeadMatches.filter(match => (
        match["Winner Player 1"] === player2 || match["Winner Player 2"] === player2
    )).length;

    // Calculate win percentages
    const totalMatches = player1Wins + player2Wins;
    const player1WinPercentage = totalMatches > 0 ? ((player1Wins / totalMatches) * 100).toFixed(2) : 0;
    const player2WinPercentage = totalMatches > 0 ? ((player2Wins / totalMatches) * 100).toFixed(2) : 0;

    // Determine the player with the most wins
    let playerWithMostWins = null;
    let mostWins = 0;

    if (player1Wins > player2Wins) {
        playerWithMostWins = player1;
        mostWins = player1Wins;
    } else if (player2Wins > player1Wins) {
        playerWithMostWins = player2;
        mostWins = player2Wins;
    }

    return (
        <div className="stats-box">
            <h3>Oppsummering</h3>
            <p>{player1} har vunnet: {player1Wins} ({player1WinPercentage}%)</p>
            <p>{player2} har vunnet: {player2Wins} ({player2WinPercentage}%)</p>
            {playerWithMostWins && (
                <p className="most-wins">{playerWithMostWins} har vunnet flest kamper ({mostWins}) stk</p>
            )}
        </div>
    );
}

export default HeadToHeadStats;
