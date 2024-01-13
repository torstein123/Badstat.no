// PlayerRecentMatches.js
import React, { useState, useEffect, useMemo } from 'react';
import './PlayerRecentMatches.css'; // Ensure this CSS file exists in the same directory

function PlayerRecentMatches({ playerName }) {
    const [allMatches, setAllMatches] = useState([]);
    const [seasonOptions, setSeasonOptions] = useState(['All Seasons']);
    const [classOptions, setClassOptions] = useState(['All Classes']);
    const [matchOptions, setMatchOptions] = useState(['All Matches']);
    const [seasonFilter, setSeasonFilter] = useState('All Seasons');
    const [outcomeFilter, setOutcomeFilter] = useState('All');
    const [tournamentClassFilter, setTournamentClassFilter] = useState('All Classes');
    const [matchFilter, setMatchFilter] = useState('All Matches');
    const [sortOrder, setSortOrder] = useState(''); // '', 'biggest-wins', 'biggest-losses'

    useEffect(() => {
        async function fetchMatches() {
            try {
                const data = require('../cleaned_file.json'); // Adjust the path to your data file
                setAllMatches(data);
            } catch (error) {
                console.error("Error fetching the matches:", error);
            }
        }
        fetchMatches();
    }, []);

    // Populate filter dropdown options
    useEffect(() => {
        const seasons = new Set();
        const classes = new Set();
        const matchTypes = new Set();

        allMatches.forEach(match => {
            if (match["Season"]) seasons.add(match["Season"]);
            if (match["Tournament Class"]) classes.add(match["Tournament Class"]);
            if (match["Match"]) matchTypes.add(match["Match"]);
        });

        setSeasonOptions(['All Seasons', ...seasons]);
        setClassOptions(['All Classes', ...classes]);
        setMatchOptions(['All Matches', ...matchTypes]);
    }, [allMatches]);

    // Calculate and sort match score differences
    const getScoreDifference = (match) => {
        let scoreDiff = 0;
        if (match.Result) {
            const games = match.Result.split(',');
            games.forEach(game => {
                const [playerScore, opponentScore] = game.split('/').map(Number);
                scoreDiff += playerScore - opponentScore;
            });
        }
        return scoreDiff;
    };

    const findOpponents = (match) => {
        let opponents = [];
        if (match["Team 1 Player 1"] === playerName || match["Team 1 Player 2"] === playerName) {
            opponents.push(match["Team 2 Player 1"]);
            opponents.push(match["Team 2 Player 2"]);
        } else if (match["Team 2 Player 1"] === playerName || match["Team 2 Player 2"] === playerName) {
            opponents.push(match["Team 1 Player 1"]);
            opponents.push(match["Team 1 Player 2"]);
        }
        return opponents.filter(opponent => opponent !== "NaN").join(' & ');
    };

    // Filter and sort matches
    const filteredAndSortedMatches = useMemo(() => {
        const matches = allMatches
            .filter(match => {
                return (
                    (seasonFilter === 'All Seasons' || match["Season"] === seasonFilter) &&
                    (tournamentClassFilter === 'All Classes' || match["Tournament Class"] === tournamentClassFilter) &&
                    (matchFilter === 'All Matches' || match["Match"] === matchFilter) &&
                    (match["Team 1 Player 1"] === playerName || 
                     match["Team 1 Player 2"] === playerName ||
                     match["Team 2 Player 1"] === playerName ||
                     match["Team 2 Player 2"] === playerName)
                );
            })
            .map(match => {
                const isWin = match["Winner Player 1"] === playerName || match["Winner Player 2"] === playerName;
                return {
                    ...match,
                    isWin,
                    opponents: findOpponents(match),
                    scoreDifference: isWin ? getScoreDifference(match) : -getScoreDifference(match)
                };
            });

        if (outcomeFilter === 'Won') {
            return matches.filter(match => match.isWin);
        } else if (outcomeFilter === 'Lost') {
            return matches.filter(match => !match.isWin);
        }

        // Sort by score difference if requested
        if (sortOrder === 'biggest-wins') {
            return matches.filter(match => match.isWin).sort((a, b) => b.scoreDifference - a.scoreDifference);
        } else if (sortOrder === 'biggest-losses') {
            return matches.filter(match => !match.isWin).sort((a, b) => a.scoreDifference - b.scoreDifference);
        }

        return matches;
    }, [allMatches, seasonFilter, outcomeFilter, tournamentClassFilter, matchFilter, sortOrder]);

    // Count total wins and losses
    const totalWins = filteredAndSortedMatches.filter(match => match.isWin).length;
    const totalLosses = filteredAndSortedMatches.filter(match => !match.isWin).length;

    return (
        <div>
            <div className="filters">
                {/* Season Filter */}
                <label>
                    Season:
                    <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
                        {seasonOptions.map(season => (
                            <option key={season} value={season}>{season}</option>
                        ))}
                    </select>
                </label>
                {/* ... other filter dropdowns */}
                {/* Outcome Filter */}
                <label>
                    Outcome:
                    <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                    </select>
                </label>
                {/* Tournament Class Filter */}
                <label>
                    Tournament Class:
                    <select value={tournamentClassFilter} onChange={(e) => setTournamentClassFilter(e.target.value)}>
                        {classOptions.map(tournamentClass => (
                            <option key={tournamentClass} value={tournamentClass}>{tournamentClass}</option>
                        ))}
                    </select>
                </label>
                {/* Match Filter */}
                <label>
                    Match:
                    <select value={matchFilter} onChange={(e) => setMatchFilter(e.target.value)}>
                        {matchOptions.map(matchType => (
                            <option key={matchType} value={matchType}>{matchType}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Sorting buttons */}
            <div>
                <button onClick={() => setSortOrder('biggest-wins')}>Sort by Biggest Wins</button>
                <button onClick={() => setSortOrder('biggest-losses')}>Sort by Biggest Losses</button>
            </div>

            {/* Display win/loss count */}
            <div>
                <p>Total Wins: {totalWins}</p>
                <p>Total Losses: {totalLosses}</p>
            </div>

            {/* Match cards */}
            {filteredAndSortedMatches.map((match, index) => (
                <div key={index} className="match-card">
                    <h3>{match.Date}</h3>
                    <p><strong>Tournament:</strong> {match["Tournament Name"]}</p>
                    <p><strong>Match:</strong> {match.Match}</p>
                    <p><strong>Result:</strong> {match.Result}</p>
                    <p><strong>Opponent(s):</strong> {match.opponents || 'No opponent found'}</p>
                    <p><strong>Outcome:</strong> {match.isWin ? 'Win' : 'Loss'}</p>
                    <p><strong>Score Difference:</strong> {match.scoreDifference}</p>
                    {/* You may want to display opponents here */}
                </div>
            ))}
        </div>
    );
}

export default PlayerRecentMatches;
