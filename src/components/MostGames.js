import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correctly import useNavigate here
import playerMatches from '../cleaned_file.json';
import combinedRankings from '../combined_rankings.json';
import combinedRankingsDD from '../combined_rankingsDD.json';
import combinedRankingsDS from '../combined_rankingsDS.json';
import combinedRankingsHD from '../combined_rankingsHD.json';
import combinedRankingsHS from '../combined_rankingsHS.json';
import combinedRankingsMIX from '../combined_rankingsMIX.json';
import './MostGames.css';

const Leaderboard = () => {
    const [category, setCategory] = useState('Sammenlagt');
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate(); // Use useNavigate hook to get the navigate function

    useEffect(() => {
        setMatches(playerMatches);
    }, []);

    const aggregateMatchCounts = (matches, category) => {
        const playerCounts = {};
    
        matches.forEach(match => {
            const matchCategory = match.Match; // No need to transform here
            if (category === 'Sammenlagt' || matchCategory === category || (category === 'Mixed Double' && matchCategory === "Mixeddouble")) {
                ['Team 1 Player 1', 'Team 1 Player 2', 'Team 2 Player 1', 'Team 2 Player 2'].forEach(position => {
                    const playerName = match[position];
                    if (playerName && playerName !== "NaN") {
                        playerCounts[playerName] = (playerCounts[playerName] || 0) + 1;
                    }
                });
            }
        });
    
        return playerCounts;
    };
    

    const calculateRankingPoints = (category) => {
        const rankingPointsFiles = {
            'Sammenlagt': combinedRankings,
            'Herresingle': combinedRankingsHS,
            'Herredouble': combinedRankingsHD,
            'Damesingle': combinedRankingsDS,
            'Damedouble': combinedRankingsDD,
            'Mixed Double': combinedRankingsMIX
        };
    
        const rankingPoints = {};
        const selectedRankingPoints = rankingPointsFiles[category];
    
        if (!selectedRankingPoints) {
            console.error(`No ranking points data found for category: ${category}`);
            return rankingPoints;
        }
    
        selectedRankingPoints.forEach(player => {
            const playerName = player.Navn;
            const latestYear = Math.max(...Object.keys(player).filter(key => /^\d{4}$/.test(key)));
            const totalPoints = parseFloat(player[latestYear] || 0);
            rankingPoints[playerName] = totalPoints;
        });
    
        return rankingPoints;
    };
    

    const navigateToPlayerProfile = (playerName) => {
        navigate(`/player/${encodeURIComponent(playerName)}`);
    };

    const combinedMatchCounts = aggregateMatchCounts(matches, 'Sammenlagt');
    const matchCounts = aggregateMatchCounts(matches, category);
    const sortedPlayers = Object.entries(category === 'Sammenlagt' ? combinedMatchCounts : matchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const rankingPoints = calculateRankingPoints(category);
    const sortedPlayersByRankingPoints = Object.entries(rankingPoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return (
        <div className="leaderboard-container">
            <h2>Leaderboard: {category}</h2>
            <div className="select-container">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Sammenlagt">Sammenlagt</option>
                    <option value="Herresingle">Herresingle</option>
                    <option value="Herredouble">Herredouble</option>
                    <option value="Damesingle">Damesingle</option>
                    <option value="Damedouble">Damedouble</option>
                    <option value="Mixed Double">Mixed Double</option>
                </select>
            </div>
            <div className="tables-container">
                <div className="table">
                    <h3>Kamper siden 2013</h3>
                    <ol className="leaderboard-list">
                        {sortedPlayers.map(([player, count], index) => (
                            <li key={index} onClick={() => navigateToPlayerProfile(player)}>
                                <span className="player-name">{player}</span>: {count} kamper
                            </li>
                        ))}
                    </ol>

                </div>
                <div className="table">
                    <h3>Ranking Poeng (2024)</h3>
                    <ol className="leaderboard-list">
                        {sortedPlayersByRankingPoints.map(([player, points], index) => (
                            // Update the onClick to use navigateToPlayerProfile
                            <li key={index} onClick={() => navigateToPlayerProfile(player)} style={{cursor: 'pointer'}}><span className="player-name">{player}</span>: {points} poeng</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
