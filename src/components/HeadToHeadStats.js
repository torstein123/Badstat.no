import React from 'react';
import { motion } from 'framer-motion';

function cleanValue(value) {
    if (!value || value === 'NaN' || value === 'undefined') return null;
    return value;
}

function HeadToHeadStats({ player1, player2, headToHeadMatches, gameType }) {
    // Sort matches by date first (most recent first)
    const sortedMatches = [...headToHeadMatches].sort((a, b) => {
        const dateA = convertToDate(a.Date);
        const dateB = convertToDate(b.Date);
        return dateB - dateA;
    });

    // Filter matches where player1 won
    const player1Wins = sortedMatches.filter(match => {
        const winner1 = cleanValue(match["Winner Player 1"]);
        const winner2 = cleanValue(match["Winner Player 2"]);
        return winner1 === player1 || winner2 === player1;
    }).length;

    // Filter matches where player2 won
    const player2Wins = sortedMatches.filter(match => {
        const winner1 = cleanValue(match["Winner Player 1"]);
        const winner2 = cleanValue(match["Winner Player 2"]);
        return winner1 === player2 || winner2 === player2;
    }).length;

    // Calculate win percentages
    const totalMatches = player1Wins + player2Wins;
    const player1WinPercentage = totalMatches > 0 ? ((player1Wins / totalMatches) * 100).toFixed(1) : 0;
    const player2WinPercentage = totalMatches > 0 ? ((player2Wins / totalMatches) * 100).toFixed(1) : 0;

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

    // Calculate win streak
    const calculateCurrentStreak = () => {
        if (sortedMatches.length === 0) return { player: null, streak: 0 };
        
        let streak = 1;
        const lastMatch = sortedMatches[0];
        const lastWinner = (cleanValue(lastMatch["Winner Player 1"]) === player1 || 
                          cleanValue(lastMatch["Winner Player 2"]) === player1) ? player1 : player2;
        
        for (let i = 1; i < sortedMatches.length; i++) {
            const currentMatch = sortedMatches[i];
            const currentWinner = (cleanValue(currentMatch["Winner Player 1"]) === player1 || 
                                 cleanValue(currentMatch["Winner Player 2"]) === player1) ? player1 : player2;
            
            if (currentWinner === lastWinner) {
                streak++;
            } else {
                break;
            }
        }
        return { player: lastWinner, streak };
    };

    const currentStreak = calculateCurrentStreak();

    // Determine the player with the most wins
    const player1IsLeading = player1Wins > player2Wins;
    const player2IsLeading = player2Wins > player1Wins;

    // Calculate last 5 matches (from most recent)
    const last5Matches = sortedMatches.slice(0, 5).map(match => {
        const winner1 = cleanValue(match["Winner Player 1"]);
        const winner2 = cleanValue(match["Winner Player 2"]);
        const winner = winner1 === player1 || winner2 === player1 ? player1 : player2;
        return winner === player1 ? 'W' : 'L';
    });

    return (
        <div className="mb-12">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                    Head to Head
                </h2>
                <p className="text-gray-300">
                    {gameType !== 'All' ? `Kategori: ${gameType}` : 'Alle kategorier'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Player 1 Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.02] ${
                        player1IsLeading ? 'ring-2 ring-blue-400/60' : ''
                    }`}
                >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className={`px-4 py-1 text-sm font-medium rounded-full ${
                            player1IsLeading 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white/15 text-gray-300'
                        }`}>
                            {player1IsLeading ? 'Leder' : 'Utfordrer'}
                        </span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-medium text-white mb-4">
                            {player1}
                        </h3>
                        <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                            {player1Wins}
                        </div>
                        <div className="text-sm text-gray-300 mb-4">
                            {player1WinPercentage}% seiersprosent
                        </div>
                        <div className="flex justify-center space-x-1 mb-4">
                            {last5Matches.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                        result === 'W' 
                                            ? 'bg-blue-400' 
                                            : 'bg-gray-600'
                                    }`}
                                    title={`Match ${idx + 1}: ${result === 'W' ? 'Vunnet' : 'Tapt'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Player 2 Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.02] ${
                        player2IsLeading ? 'ring-2 ring-pink-400/60' : ''
                    }`}
                >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className={`px-4 py-1 text-sm font-medium rounded-full ${
                            player2IsLeading 
                                ? 'bg-pink-600 text-white' 
                                : 'bg-white/15 text-gray-300'
                        }`}>
                            {player2IsLeading ? 'Leder' : 'Utfordrer'}
                        </span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-medium text-white mb-4">
                            {player2}
                        </h3>
                        <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                            {player2Wins}
                        </div>
                        <div className="text-sm text-gray-300 mb-4">
                            {player2WinPercentage}% seiersprosent
                        </div>
                        <div className="flex justify-center space-x-1 mb-4">
                            {last5Matches.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                        result === 'L' 
                                            ? 'bg-pink-400' 
                                            : 'bg-gray-600'
                                    }`}
                                    title={`Match ${idx + 1}: ${result === 'L' ? 'Vunnet' : 'Tapt'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Match Statistics */}
            <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-white/5 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm text-gray-300">
                            {currentStreak.streak > 0 && (
                                <span>
                                    {currentStreak.player} er på en {currentStreak.streak}-kamps seiersrekke
                                </span>
                            )}
                        </div>
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 text-gray-300 text-sm">
                            Totalt {totalMatches} kamper spilt
                        </span>
                    </div>
                    
                    {/* Head to head record bar */}
                    <div className="relative">
                        <div className="flex justify-between text-sm mb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                <span className="text-white">{player1Wins} seire</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-white">{player2Wins} seire</span>
                                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                            </div>
                        </div>
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${player1WinPercentage}%` }}
                            />
                            <div 
                                className="h-full bg-pink-500 transition-all duration-500"
                                style={{ width: `${player2WinPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Last matches timeline */}
                    {last5Matches.length > 0 && (
                        <div className="mt-6">
                            <div className="text-sm text-gray-300 mb-3">
                                {last5Matches.length === 1 
                                    ? 'Siste kamp:'
                                    : `Siste ${last5Matches.length} kamper:`
                                }
                            </div>
                            <div className={`grid gap-2 ${
                                last5Matches.length === 1 ? 'grid-cols-1 max-w-[200px] mx-auto' :
                                last5Matches.length === 2 ? 'grid-cols-2 max-w-[300px] mx-auto' :
                                last5Matches.length === 3 ? 'grid-cols-3 max-w-[400px] mx-auto' :
                                last5Matches.length === 4 ? 'grid-cols-4 max-w-[500px] mx-auto' :
                                'grid-cols-5'
                            }`}>
                                {last5Matches.map((result, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className={`w-full h-1 rounded-full ${
                                            result === 'W' 
                                                ? 'bg-blue-400' 
                                                : 'bg-pink-400'
                                        }`} />
                                        <div className="mt-2 text-center">
                                            <span className={`text-xs font-medium ${
                                                result === 'W'
                                                ? 'text-blue-300'
                                                : 'text-pink-300'
                                            }`}>
                                                {idx === 0 ? 'Siste' : `${idx + 1}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HeadToHeadStats;
