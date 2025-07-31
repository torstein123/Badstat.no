import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './headTohead.css';
import HeadToHeadStats from './HeadToHeadStats'; // Import the new component
import MatchPrediction from './MatchPrediction';
import { motion } from 'framer-motion';
import { getHeadToHeadMatches } from '../services/databaseService';

function cleanValue(value) {
    if (!value || value === 'NaN' || value === 'undefined') return null;
    return value;
}

function formatDate(dateString) {
    const parts = dateString.split('.');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}.${month}.${year}`;
    }
    return dateString;
}

function HeadToHead() {
    const [allMatches, setAllMatches] = useState([]);
    const { player1, player2 } = useParams();
    const [gameType, setGameType] = useState('All');
    const [sortBy, setSortBy] = useState('date'); // 'date' or 'tournament'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [yearFilter, setYearFilter] = useState('all');

    // Debug: Log the player names from URL
    console.log('URL params - player1:', player1, 'player2:', player2);
    console.log('Decoded player1:', decodeURIComponent(player1), 'player2:', decodeURIComponent(player2));

    const handleGameTypeChange = (type) => {
        setGameType(type);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const headToHeadMatches = useMemo(() => {
        const filtered = allMatches.filter(match => {
            let matchesType;
            switch (gameType) {
                case 'Single':
                    matchesType = ['Herresingle', 'Damesingle'];
                    break;
                case 'Double':
                    matchesType = ['Herredouble', 'Damedouble'];
                    break;
                case 'Mixed':
                    matchesType = ['Mixeddouble'];
                    break;
                default:
                    matchesType = ['Herresingle', 'Damesingle', 'Herredouble', 'Damedouble', 'Mixeddouble'];
            }

            if (gameType !== 'Alle' && !matchesType.includes(match["Match"])) return false;

            // Year filter
            if (yearFilter !== 'all') {
                const matchYear = convertToDate(match.Date)?.getFullYear().toString();
                if (matchYear !== yearFilter) return false;
            }

            // Since we're already getting head-to-head matches from the database,
            // we just need to apply the game type and year filters
            return true;
        });

        console.log('Filtered head-to-head matches:', filtered.length, 'for players:', player1, 'vs', player2);
        return filtered;
    }, [allMatches, player1, player2, gameType, yearFilter]);

    useEffect(() => {
        async function fetchMatches() {
            try {
                const decodedPlayer1 = decodeURIComponent(player1);
                const decodedPlayer2 = decodeURIComponent(player2);
                console.log('Fetching head-to-head matches for:', decodedPlayer1, 'vs', decodedPlayer2);
                const data = await getHeadToHeadMatches(decodedPlayer1, decodedPlayer2);
                console.log('Fetched matches:', data.length, 'total matches');
                if (data.length > 0) {
                    console.log('Sample match:', data[0]);
                } else {
                    console.log('No matches found');
                }
                setAllMatches(data);
            } catch (error) {
                console.error("Error fetching the matches:", error);
            }
        }
        fetchMatches();
    }, [player1, player2]); // Add player1 and player2 to dependencies

    const GameTypeButtons = () => {
        const gameTypes = ['Alle', 'Single', 'Double', 'Mixed'];
        return (
            <div className="flex justify-center gap-4 mb-8">
                {gameTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => handleGameTypeChange(type)}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105
                            ${gameType === type 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                                : 'bg-white/15 text-white hover:bg-white/25'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        );
    };

    // Get unique years from matches
    const years = useMemo(() => {
        const uniqueYears = new Set();
        allMatches.forEach(match => {
            const date = convertToDate(match.Date);
            if (date) {
                uniqueYears.add(date.getFullYear().toString());
            }
        });
        return Array.from(uniqueYears).sort().reverse();
    }, [allMatches]);

    function convertToDate(dateString) {
        const parts = dateString.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            return new Date(year, month - 1, day);
        }
        return null;
    }

    // Sort matches
    const sortedMatches = useMemo(() => {
        return [...headToHeadMatches].sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = convertToDate(a.Date);
                const dateB = convertToDate(b.Date);
                if (dateA && dateB) {
                    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                }
                return 0;
            } else {
                const tournamentA = a["Tournament Name"].toLowerCase();
                const tournamentB = b["Tournament Name"].toLowerCase();
                return sortOrder === 'desc' 
                    ? tournamentB.localeCompare(tournamentA)
                    : tournamentA.localeCompare(tournamentB);
            }
        });
    }, [headToHeadMatches, sortBy, sortOrder]);

    const safeValue = (value) => (value && value !== 'NaN' ? value : '');

    return (
        <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <HeadToHeadStats 
                    player1={player1} 
                    player2={player2} 
                    headToHeadMatches={headToHeadMatches} 
                    gameType={gameType} 
                />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <MatchPrediction 
                        player1={player1}
                        player2={player2}
                        matches={allMatches}
                        gameType={gameType}
                    />
                </motion.div>

                <GameTypeButtons />

                {/* Filters and Controls */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="bg-white/15 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Alle år</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        
                        <button
                            onClick={() => setSortBy('date')}
                            className={`px-4 py-2 rounded-lg ${
                                sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-white/15 text-white'
                            }`}
                        >
                            Dato
                        </button>
                        <button
                            onClick={() => setSortBy('tournament')}
                            className={`px-4 py-2 rounded-lg ${
                                sortBy === 'tournament' ? 'bg-blue-600 text-white' : 'bg-white/15 text-white'
                            }`}
                        >
                            Turnering
                        </button>
                        <button
                            onClick={toggleSortOrder}
                            className="px-4 py-2 bg-white/15 text-white rounded-lg"
                        >
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                    </div>
                    
                    <span className="text-sm text-gray-300">
                        Viser {sortedMatches.length} kamper
                    </span>
                </div>

                {/* Mobile view - Cards */}
                <div className="block lg:hidden space-y-4">
                    {sortedMatches.map((match, index) => {
                        // Get teams with proper partner highlighting and clean values
                        const team1 = {
                            player1: cleanValue(match["Team 1 Player 1"]),
                            player2: cleanValue(match["Team 1 Player 2"]),
                        };
                        const team2 = {
                            player1: cleanValue(match["Team 2 Player 1"]),
                            player2: cleanValue(match["Team 2 Player 2"]),
                        };

                        // Determine winning team
                        const team1Won = match["Winner Player 1"] === team1.player1 || match["Winner Player 1"] === team1.player2;
                        
                        // Determine which team to show first (winners)
                        const winnersTeam = team1Won ? team1 : team2;
                        const losersTeam = team1Won ? team2 : team1;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:bg-white/15"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-400">{formatDate(match.Date)}</span>
                                    <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full">
                                        {cleanValue(match.Match) || '-'}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            {winnersTeam.player1 && (
                                                <span className={`text-sm font-medium ${
                                                    winnersTeam.player1 === player1 ? 'text-blue-400' :
                                                    winnersTeam.player1 === player2 ? 'text-pink-400' :
                                                    'text-gray-400'
                                                }`}>
                                                    {winnersTeam.player1}
                                                </span>
                                            )}
                                            {winnersTeam.player2 && (
                                                <span className={`text-sm font-medium ${
                                                    winnersTeam.player2 === player1 ? 'text-blue-400' :
                                                    winnersTeam.player2 === player2 ? 'text-pink-400' :
                                                    'text-gray-400'
                                                }`}>
                                                    {winnersTeam.player2}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-white font-medium bg-white/10 px-3 py-1 rounded-full text-sm mx-2">
                                            {cleanValue(match.Result) || '-'}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {losersTeam.player1 && (
                                                <span className={`text-sm ${
                                                    losersTeam.player1 === player1 ? 'text-blue-400/70' :
                                                    losersTeam.player1 === player2 ? 'text-pink-400/70' :
                                                    'text-gray-400'
                                                }`}>
                                                    {losersTeam.player1}
                                                </span>
                                            )}
                                            {losersTeam.player2 && (
                                                <span className={`text-sm ${
                                                    losersTeam.player2 === player1 ? 'text-blue-400/70' :
                                                    losersTeam.player2 === player2 ? 'text-pink-400/70' :
                                                    'text-gray-400'
                                                }`}>
                                                    {losersTeam.player2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{cleanValue(match["Tournament Name"]) || '-'}</span>
                                        <span>{cleanValue(match["Tournament Class"]) || '-'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Desktop view - Table */}
                <div className="hidden lg:block">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <span>Dato</span>
                                            {sortBy === 'date' && (
                                                <span className="text-blue-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Vinnere</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Resultat</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Tapere</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <span>Turnering</span>
                                            {sortBy === 'tournament' && (
                                                <span className="text-blue-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Klasse</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Kategori</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedMatches.map((match, index) => {
                                    // Determine if player1 is in team 1
                                    const player1InTeam1 = match["Team 1 Player 1"] === player1 || match["Team 1 Player 2"] === player1;
                                    const player2InTeam1 = match["Team 1 Player 1"] === player2 || match["Team 1 Player 2"] === player2;

                                    // Get teams with proper partner highlighting
                                    const team1 = {
                                        player1: cleanValue(match["Team 1 Player 1"]),
                                        player2: cleanValue(match["Team 1 Player 2"]),
                                    };
                                    const team2 = {
                                        player1: cleanValue(match["Team 2 Player 1"]),
                                        player2: cleanValue(match["Team 2 Player 2"]),
                                    };

                                    // Determine winning team
                                    const team1Won = match["Winner Player 1"] === team1.player1 || match["Winner Player 1"] === team1.player2;
                                    
                                    // Determine which team to show first (winners)
                                    const winnersTeam = team1Won ? team1 : team2;
                                    const losersTeam = team1Won ? team2 : team1;
                                    
                                    return (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="transition-colors hover:bg-white/5"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {formatDate(match.Date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    {winnersTeam.player1 && (
                                                        <span className={`text-sm font-medium ${
                                                            winnersTeam.player1 === player1 ? 'text-blue-400' :
                                                            winnersTeam.player1 === player2 ? 'text-pink-400' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {winnersTeam.player1}
                                                        </span>
                                                    )}
                                                    {winnersTeam.player2 && (
                                                        <span className={`text-sm font-medium ${
                                                            winnersTeam.player2 === player1 ? 'text-blue-400' :
                                                            winnersTeam.player2 === player2 ? 'text-pink-400' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {winnersTeam.player2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-white font-medium bg-white/10 px-3 py-1 rounded-full text-sm">
                                                    {cleanValue(match.Result) || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-end">
                                                    {losersTeam.player1 && (
                                                        <span className={`text-sm ${
                                                            losersTeam.player1 === player1 ? 'text-blue-400/70' :
                                                            losersTeam.player1 === player2 ? 'text-pink-400/70' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {losersTeam.player1}
                                                        </span>
                                                    )}
                                                    {losersTeam.player2 && (
                                                        <span className={`text-sm ${
                                                            losersTeam.player2 === player1 ? 'text-blue-400/70' :
                                                            losersTeam.player2 === player2 ? 'text-pink-400/70' :
                                                            'text-gray-400'
                                                        }`}>
                                                            {losersTeam.player2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {cleanValue(match["Tournament Name"]) || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {cleanValue(match["Tournament Class"]) || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                                                    {cleanValue(match.Match) || '-'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeadToHead;
