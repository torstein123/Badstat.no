import React, { useState, useEffect, useMemo } from 'react';
import './PlayerRecentMatches.css'; // Ensure this CSS file exists in the same directory

const convertDateString = (dateString) => {
    const parts = dateString.split('.');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

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

        setSeasonOptions(['Alle sesonger', ...seasons]);
        setClassOptions(['Alle klasser', ...classes]);
        setMatchOptions(['Alle kategorier', ...matchTypes]);
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

    const findTeamAndOpponents = (match) => {
        let teamPartner = '';
        let opponents = [];
    
        if (match["Team 1 Player 1"] === playerName) {
            teamPartner = match["Team 1 Player 2"];
            opponents.push(match["Team 2 Player 1"]);
            opponents.push(match["Team 2 Player 2"]);
        } else if (match["Team 1 Player 2"] === playerName) {
            teamPartner = match["Team 1 Player 1"];
            opponents.push(match["Team 2 Player 1"]);
            opponents.push(match["Team 2 Player 2"]);
        } else if (match["Team 2 Player 1"] === playerName) {
            teamPartner = match["Team 2 Player 2"];
            opponents.push(match["Team 1 Player 1"]);
            opponents.push(match["Team 1 Player 2"]);
        } else if (match["Team 2 Player 2"] === playerName) {
            teamPartner = match["Team 2 Player 1"];
            opponents.push(match["Team 1 Player 1"]);
            opponents.push(match["Team 1 Player 2"]);
        }
    
        return {
            teamPartner: teamPartner,
            opponents: opponents.filter(opponent => opponent !== "NaN").join(' & ')
        };
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
                const { teamPartner, opponents } = findTeamAndOpponents(match);
            
                return {
                    ...match,
                    isWin,
                    teamPartner, // Add this line
                    opponents,
                    scoreDifference: isWin ? getScoreDifference(match) : -getScoreDifference(match)
                };
            })
            .sort((a, b) => new Date(convertDateString(b.Date)) - new Date(convertDateString(a.Date)));

        // Apply additional filters and sorting
        if (outcomeFilter === 'Won') {
            return matches.filter(match => match.isWin);
        } else if (outcomeFilter === 'Lost') {
            return matches.filter(match => !match.isWin);
        }
    
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
                    Sesong:
                    <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
                        {seasonOptions.map(season => (
                            <option key={season} value={season}>{season}</option>
                        ))}
                    </select>
                </label>
                {/* ... other filter dropdowns */}
                {/* Outcome Filter */}
                <label>
                    Utfall:
                    <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                        <option value="All">Alle</option>
                        <option value="Won">Vunnet</option>
                        <option value="Lost">Tapt</option>
                    </select>
                </label>
                {/* Tournament Class Filter */}
                <label>
                    Klasse:
                    <select value={tournamentClassFilter} onChange={(e) => setTournamentClassFilter(e.target.value)}>
                        {classOptions.map(tournamentClass => (
                            <option key={tournamentClass} value={tournamentClass}>{tournamentClass}</option>
                        ))}
                    </select>
                </label>
                {/* Match Filter */}
                <label>
                    Kategori:
                    <select value={matchFilter} onChange={(e) => setMatchFilter(e.target.value)}>
                        {matchOptions.map(matchType => (
                            <option key={matchType} value={matchType}>{matchType}</option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Sorting buttons */}
            <div>
                <button onClick={() => setSortOrder('biggest-wins')}>Største seire</button>
                <button onClick={() => setSortOrder('biggest-losses')}>Største tap</button>
            </div>

            {/* Display win/loss count */}
            <div>
                <p>Vunnet: {totalWins}</p>
                <p>Tapt: {totalLosses}</p>
            </div>

            {/* Match cards */}
            {filteredAndSortedMatches.map((match, index) => (
                <div key={index} className="match-card">
                    <h3>{match.Date}</h3>
                    <p><strong>Turnering:</strong> {match["Tournament Name"]}</p>
                    <p><strong>Kategori:</strong> {match.Match}</p>
                    <p><strong>Resultat:</strong> {match.Result}</p>
                    <p><strong>Partner:</strong> {match.teamPartner}</p>
                    <p><strong>Motstander(e):</strong> {match.opponents || 'No opponent found'}</p>

                    <p>
                        <strong>Utfall:</strong> 
                        {match.isWin ? 
                            <span style={{ color: 'green' }}>Seier</span> : 
                            <span style={{ color: 'red' }}>Tap</span>
                        }
                    </p>
                    <p><strong>Poengforskjell:</strong> {match.scoreDifference}</p>
                    {/* You may want to display opponents here */}
                </div>
            ))}
        </div>
    );
}

export default PlayerRecentMatches;