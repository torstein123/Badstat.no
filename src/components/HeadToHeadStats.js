import React from 'react';
import './HeadToHeadStats.css';

function HeadToHeadStats({ player1, player2, headToHeadMatches, gameType }) {
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
    let gameTypeInfo;
    if (gameType !== 'All') {
        gameTypeInfo = <h3>Kategori: {gameType}</h3>;
    } else {
        gameTypeInfo = <h3>All Game Types</h3>;
    }

    // Wrap the returned JSX in a single parent div
    return (
        <div>
            {gameTypeInfo}
            <div className="win-lose-comparison-box">
                <div className="player1-wins">
                    <h2 style={{ color: '#5c5c5c' }}>{player1.split(' ')[0]}</h2>
                    <h1>{player1Wins}</h1>
                </div>
                <div className="player2-wins">
                    <h2 style={{ color: '#5c5c5c' }}>{player2.split(' ')[0]}</h2>
                    <h1>{player2Wins}</h1>
                </div>
            </div>
        </div>
    );
}

export default HeadToHeadStats;
