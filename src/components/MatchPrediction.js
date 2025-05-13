import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloating, useInteractions, useHover, offset, shift, FloatingPortal } from '@floating-ui/react';
import dataHS from '../combined_rankingsHS.json';  // Import men's singles rankings
import dataDS from '../combined_rankingsDS.json';  // Import women's singles rankings

// Add Heroicons imports for illustrations
import { ChartBarIcon, ScaleIcon, TrophyIcon, ChartPieIcon, SparklesIcon, FireIcon, StarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Helper function to get class level score (higher is better)
const getClassLevelScore = (className) => {
    if (!className) return 0;
    const classMap = {
        'Elite': 7,
        'X': 7,     // Elite level
        'E': 7,     // Elite level
        'SEN E': 7, // Elite/highest level
        'SEN A': 5,
        'A': 5,
        'SEN B': 4,
        'B': 4,
        'SEN C': 3,
        'C': 3,
        'SEN D': 2,
        'D': 2,
        'SEN F': 1, // Lowest level
        'F': 1
    };
    
    // First check for exact matches
    for (const [key, value] of Object.entries(classMap)) {
        if (className.toUpperCase() === key.toUpperCase()) return value;
    }
    
    // Then check for partial matches, prioritizing SEN classes
    for (const [key, value] of Object.entries(classMap)) {
        if (className.toUpperCase().includes(key.toUpperCase())) {
            // If it's an E-class match, ensure it's actually Elite level
            if (key === 'E' || key === 'SEN E') {
                if (className.toUpperCase().includes('ELITE') || 
                    className.toUpperCase().includes('SEN E')) {
                    return value;
                }
                continue; // Skip if it's not actually Elite level
            }
            return value;
        }
    }
    
    return 0;
};

// Helper function to find player's matches (including as partner)
const findPlayerMatches = (allMatches, playerName) => {
    return allMatches.filter(match => 
        match["Team 1 Player 1"] === playerName ||
        match["Team 1 Player 2"] === playerName ||
        match["Team 2 Player 1"] === playerName ||
        match["Team 2 Player 2"] === playerName
    );
};

// Helper function to determine player's current class level
const determinePlayerClass = (allMatches, playerName) => {
    try {
        // Get all matches involving the player
        const playerMatches = findPlayerMatches(allMatches, playerName);
        
        if (!playerMatches || playerMatches.length === 0) {
            console.log(`No matches found for player: ${playerName}`);
            return { level: 0, confidence: 0, averageClassValue: 0, pointDifferentials: {} };
        }

        // Sort matches by date (most recent first)
        const sortedMatches = playerMatches.sort((a, b) => {
            try {
                const dateA = new Date(a.Date.split('.').reverse().join('-'));
                const dateB = new Date(b.Date.split('.').reverse().join('-'));
                return dateB - dateA;
            } catch (err) {
                console.error('Error parsing date:', { dateA: a.Date, dateB: b.Date, error: err });
                return 0;
            }
        });

        // Get last 6 months of matches
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentMatches = sortedMatches.filter(match => {
            try {
                const matchDate = new Date(match.Date.split('.').reverse().join('-'));
                return matchDate >= sixMonthsAgo;
            } catch (err) {
                console.error('Error parsing match date:', { date: match.Date, error: err });
                return false;
            }
        });

        // If no recent matches but has older matches, use those with minimum 0.5 confidence
        if (recentMatches.length === 0) {
            const classLevel = calculateClassLevel(sortedMatches);
            // If they have a clear class level from older matches, maintain decent confidence
            const baseConfidence = Math.min(sortedMatches.length / 10, 0.8);
            return {
                ...classLevel,
                confidence: Math.max(baseConfidence, 0.5), // Never go below 0.5 confidence if they have an established class
                pointDifferentials: {}
            };
        }

        return {
            ...calculateClassLevel(recentMatches),
            pointDifferentials: {}
        };
    } catch (err) {
        console.error('Error determining player class:', err);
        return { level: 0, confidence: 0, averageClassValue: 0, pointDifferentials: {} };
    }
};

// Helper function to analyze if player belongs in their class
const analyzeClassSuitability = (classLevel) => {
    const { pointDifferentials } = classLevel;
    const results = [];
    
    Object.entries(pointDifferentials).forEach(([className, stats]) => {
        // Analyze point differential and win rate
        if (stats.matches >= 3) { // Only analyze if player has at least 3 matches in the class
            if (stats.avgDiff < -5 && stats.winRate < 0.3) {
                results.push(`For høyt nivå i ${className} (${Math.round(stats.winRate * 100)}% seire, ${Math.round(stats.avgDiff)} poeng diff)`);
            } else if (stats.avgDiff > 5 && stats.winRate > 0.7) {
                results.push(`For lavt nivå i ${className} (${Math.round(stats.winRate * 100)}% seire, +${Math.round(stats.avgDiff)} poeng diff)`);
            }
        }
    });
    
    return results;
};

// Helper function to calculate class level from a set of matches
const calculateClassLevel = (matches) => {
    if (matches.length === 0) {
        return { level: 0, confidence: 0, averageClassValue: 0 };
    }

    // Calculate weighted average (more recent matches count more)
    let totalWeight = 0;
    let weightedSum = 0;
    let classesPlayed = new Set();
    
    matches.forEach((match, index) => {
        const weight = matches.length - index; // More recent matches have higher weight
        const tournamentClass = match["Tournament Class"];
        if (tournamentClass) {
            const classScore = getClassLevelScore(tournamentClass);
            weightedSum += classScore * weight;
            totalWeight += weight;
            classesPlayed.add(tournamentClass);
        }
    });

    // Calculate average class value
    const averageClassValue = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Determine final class level
    let level;
    if (averageClassValue >= 6) {
        level = 7; // Elite (X/E class)
    } else if (averageClassValue >= 4.5) {
        level = 5; // A class
    } else if (averageClassValue >= 3.5) {
        level = 4; // B class
    } else if (averageClassValue >= 2.5) {
        level = 3; // C class
    } else if (averageClassValue >= 1.5) {
        level = 2; // D class
    } else if (averageClassValue > 0) {
        level = 1; // E class
    } else {
        level = 0; // Unknown
    }

    // Calculate confidence based on number of matches and consistency
    const confidence = Math.min(matches.length / 10, 1) * 
                      (1 - (classesPlayed.size - 1) / 5); // Lower confidence if player plays in many different classes

    return {
        level,
        confidence,
        averageClassValue
    };
};

// Helper function to calculate win probability based on various factors
const calculateWinProbability = (player1Stats, player2Stats, gameType, matches) => {
    // Helper function to normalize scores between two values
    const normalizeScore = (score1, score2) => {
        const total = Math.abs(score1) + Math.abs(score2);
        if (total === 0) return 0.5;
        return Math.abs(score1) / total;
    };

    // Check if we have any recent head-to-head matches
    const headToHeadMatches = matches.filter(match => {
        const team1HasPlayer = match["Team 1 Player 1"] === player1Stats.name || match["Team 1 Player 2"] === player1Stats.name;
        const team2HasPlayer = match["Team 2 Player 1"] === player1Stats.name || match["Team 2 Player 2"] === player1Stats.name;
        const team1HasOpponent = match["Team 1 Player 1"] === player2Stats.name || match["Team 1 Player 2"] === player2Stats.name;
        const team2HasOpponent = match["Team 2 Player 1"] === player2Stats.name || match["Team 2 Player 2"] === player2Stats.name;
        
        // Check if it's a singles match
        const isSingles = match["Match"] === "Herresingle" || 
                        match["Match"] === "Damesingle" ||
                        match["Category"] === "Herresingle" ||
                        match["Category"] === "Damesingle";
        
        // Check if match is within last 2 years
        let matchDate;
        try {
            const [day, month, year] = match.Date.split('.').map(num => parseInt(num, 10));
            matchDate = new Date(year, month - 1, day);
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            return (team1HasPlayer && team2HasOpponent || team2HasPlayer && team1HasOpponent) && 
                   isSingles && matchDate >= twoYearsAgo;
        } catch (err) {
            console.error('Error parsing match date:', { date: match.Date, error: err });
            return false;
        }
    });

    const headToHeadWins = headToHeadMatches.filter(match => {
        const playerInTeam1 = match["Team 1 Player 1"] === player1Stats.name || match["Team 1 Player 2"] === player1Stats.name;
        
        // Parse the match result to determine the winner
        if (match.Result) {
            const sets = match.Result.split(',').map(set => {
                const [score1, score2] = set.trim().split('-').map(Number);
                return score1 > score2 ? 1 : 2; // 1 if team1 won the set, 2 if team2 won
            });
            
            // Count sets won by each team
            const team1Sets = sets.filter(winner => winner === 1).length;
            const team2Sets = sets.filter(winner => winner === 2).length;
            
            // Determine match winner based on sets
            const team1Won = team1Sets > team2Sets;
            
            // If player1 is in team1, they win if team1 won. If they're in team2, they win if team2 won.
            return playerInTeam1 ? team1Won : !team1Won;
        }
        
        // Fallback to the Winner field if Result parsing fails
        return playerInTeam1 ? match["Winner"] === "1" : match["Winner"] === "2";
    }).length;

    const headToHeadLosses = headToHeadMatches.length - headToHeadWins;
    const headToHeadWinRate = headToHeadMatches.length > 0 ? headToHeadWins / headToHeadMatches.length : 0;

    // Check if we have any recent head-to-head matches
    const hasRecentMatches = headToHeadMatches.length > 0;

    // Start with base weights
    let weights;

    if (!hasRecentMatches) {
        // No head-to-head matches - use these weights with strong class level influence
        weights = {
            classLevel: 0.90,  // Very strong class level influence
            recentForm: 0.0,  // Minimal recent form influence
            headToHead: 0.0,   // No head-to-head influence
            pointDifferential: 0.0, // No point differential since no head-to-head
            tournamentPerformance: 0.0, // Slightly increased tournament influence
            ranking: 0.05 // Small ranking influence
        };
    } else {
        // Has head-to-head matches - use original weights
        weights = {
            classLevel: 0.08,
            recentForm: 0.02,
            headToHead: 0.75,
            pointDifferential: 0.10,
            tournamentPerformance: 0.02,
            ranking: gameType === 'Single' ? 0.03 : 0
        };

        // If matches were close, increase point differential weight
        if (headToHeadMatches.length > 0) {
            const extraWeight = 0.15;
            weights.headToHead -= extraWeight;
            weights.pointDifferential += extraWeight;
        }
    }

    // If players are in the same class, remove class weight and redistribute
    if (player1Stats.classLevel.level === player2Stats.classLevel.level) {
        console.log('Players in same class - removing class level weight');
        
        // Store the class level weight to redistribute
        const classWeight = weights.classLevel;
        weights.classLevel = 0;

        // Calculate total of remaining weights
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        // Redistribute class weight proportionally to other factors
        Object.keys(weights).forEach(factor => {
            if (factor !== 'classLevel' && weights[factor] > 0) {
                weights[factor] += (weights[factor] / totalWeight) * classWeight;
            }
        });
    }

    // Ensure weights sum to 1.0
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) { // Allow for small floating point differences
        // Normalize weights
        Object.keys(weights).forEach(factor => {
            weights[factor] = weights[factor] / totalWeight;
        });
    }

    // Log the final weights for debugging
    console.log('Weight distribution:', {
        hasRecentMatches,
        matchCount: headToHeadMatches.length,
        weights,
        totalWeight: Object.values(weights).reduce((a, b) => a + b, 0)
    });

    // Get player levels
    const p1Level = player1Stats.classLevel;
    const p2Level = player2Stats.classLevel;
    
    // Calculate class level score and adjust weights if players are in same class
    const classLevelScore = (() => {
        // If we're not using class level weight, return 0.5 (neutral)
        if (weights.classLevel === 0) {
            return 0.5;
        }

        if (!p1Level || !p2Level) {
            console.log('Invalid class levels:', { p1Level, p2Level });
            return 0.5;
        }

        // If players are in the same class, set class weight to 0 and redistribute
        if (p1Level.level === p2Level.level) {
            console.log('Players in same class - removing class level weight');
            
            // Store the class level weight to redistribute
            const classWeight = weights.classLevel;
            weights.classLevel = 0;

            // Calculate total of remaining weights
            const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
            
            // Redistribute class weight proportionally to other factors
            Object.keys(weights).forEach(factor => {
                if (factor !== 'classLevel' && weights[factor] > 0) {
                    weights[factor] += (weights[factor] / totalWeight) * classWeight;
                }
            });

            // Log the redistributed weights
            console.log('Redistributed weights after same class:', weights);
            
            return 0.5;
        }

        const levelDiff = p1Level.level - p2Level.level;
        // Use the higher of the two confidences if one player has established class
        const confidenceWeight = Math.max(p1Level.confidence || 0, p2Level.confidence || 0);
        
        // Helper function to get class text from level
        const getClassText = (level) => {
            const classMap = {
                7: 'Elite/SEN E',
                5: 'SEN A',
                4: 'SEN B',
                3: 'SEN C',
                2: 'SEN D',
                1: 'SEN F',
                0: 'Ukjent'
            };
            return classMap[level] || 'Ukjent';
        };

        console.log('Class level calculation:', {
            player1: {
                level: p1Level.level,
                className: getClassText(p1Level.level)
            },
            player2: {
                level: p2Level.level,
                className: getClassText(p2Level.level)
            },
            levelDiff,
            confidenceWeight
        });
        
        // Special case for Elite vs non-Elite with good confidenc
        
        // If difference is 2 or more classes with high confidence
        if (Math.abs(levelDiff) >= 2 && confidenceWeight > 0.5) {
            const score = levelDiff > 0 ? 0.99 : 0.01;
            console.log('2+ class difference case:', { score, levelDiff });
            return score;
        }
        
        // For 1 class difference with good confidence
        if (Math.abs(levelDiff) === 1 && confidenceWeight > 0.5) {
            const score = levelDiff > 0 ? 0.80 : 0.20;
            console.log('1 class difference case:', { score, levelDiff });
            return score;
        }
        
        // For less confident cases
        const baseScore = normalizeScore(p1Level.level || 0, p2Level.level || 0);
        const finalScore = baseScore * confidenceWeight + 0.5 * (1 - confidenceWeight);
        console.log('Low confidence case:', { baseScore, confidenceWeight, finalScore });
        return finalScore;
    })();

    // Calculate ranking score with improved weighting based on point differences
    const rankingScore = (() => {
        const p1Points = player1Stats.rankingPoints || 0;
        const p2Points = player2Stats.rankingPoints || 0;
        
        console.log('Ranking score calculation:', {
            player1: {
                name: player1Stats.name,
                points: p1Points
            },
            player2: {
                name: player2Stats.name,
                points: p2Points
            }
        });

        // Ensure we have valid numbers
        if (isNaN(p1Points) || isNaN(p2Points)) {
            console.log('Invalid ranking points:', { p1Points, p2Points });
            return 0.5;
        }

        // If either player has no points, use 0.7/0.3 split
        if (p1Points === 0 || p2Points === 0) {
            if (p1Points > 0) return 0.7;  // Player 1 has points, player 2 doesn't
            if (p2Points > 0) return 0.3;  // Player 2 has points, player 1 doesn't
            return 0.5;  // Neither has points
        }

        // Calculate the absolute difference in points
        const pointDiff = Math.abs(p1Points - p2Points);
        
        // Define thresholds for point differences
        const SMALL_DIFF = 100;   // Less than 100 points difference
        const MEDIUM_DIFF = 300;  // Less than 300 points difference
        const LARGE_DIFF = 500;   // Less than 500 points difference
        
        // Calculate base probability based on point difference magnitude
        let baseProb;
        if (pointDiff < SMALL_DIFF) {
            // Small difference: 55/45 to 60/40 split
            baseProb = 0.55 + (pointDiff / SMALL_DIFF) * 0.05;
        } else if (pointDiff < MEDIUM_DIFF) {
            // Medium difference: 60/40 to 70/30 split
            baseProb = 0.60 + ((pointDiff - SMALL_DIFF) / (MEDIUM_DIFF - SMALL_DIFF)) * 0.10;
        } else if (pointDiff < LARGE_DIFF) {
            // Large difference: 70/30 to 85/15 split
            baseProb = 0.70 + ((pointDiff - MEDIUM_DIFF) / (LARGE_DIFF - MEDIUM_DIFF)) * 0.15;
        } else {
            // Huge difference: 85/15 to 95/5 split
            baseProb = Math.min(0.85 + (pointDiff - LARGE_DIFF) / 1000 * 0.10, 0.95);
        }
        
        // Determine final probability based on who has more points
        const finalProb = p1Points > p2Points ? baseProb : (1 - baseProb);
        
        console.log('Ranking probability calculation:', {
            pointDiff,
            baseProb,
            finalProb,
            p1HasMorePoints: p1Points > p2Points
        });
        
        return finalProb;
    })();

    const recentFormScore = normalizeScore(
        player1Stats.recentWeightedWins || 0,
        player2Stats.recentWeightedWins || 0
    );

    const headToHeadScore = hasRecentMatches ? 
        normalizeScore(player1Stats.weightedHeadToHeadWins || 0, player2Stats.weightedHeadToHeadWins || 0) : 
        0.5; // Neutral score when no head-to-head exists

    const pointDiffScore = normalizeScore(
        Math.max(0, (player1Stats.avgPointDiff || 0) + 21),
        Math.max(0, (player2Stats.avgPointDiff || 0) + 21)
    );

    const tournamentScore = normalizeScore(
        player1Stats.tournamentPerformance || 0,
        player2Stats.tournamentPerformance || 0
    );

    // Calculate weighted total score
    const totalScore = (
        weights.classLevel * classLevelScore +
        weights.recentForm * recentFormScore +
        weights.headToHead * headToHeadScore +
        weights.pointDifferential * pointDiffScore +
        weights.tournamentPerformance * tournamentScore +
        weights.ranking * rankingScore
    );

    console.log('Final score calculation:', {
        classLevel: { weight: weights.classLevel, score: classLevelScore, contribution: weights.classLevel * classLevelScore },
        recentForm: { weight: weights.recentForm, score: recentFormScore, contribution: weights.recentForm * recentFormScore },
        headToHead: { weight: weights.headToHead, score: headToHeadScore, contribution: weights.headToHead * headToHeadScore },
        pointDiff: { weight: weights.pointDifferential, score: pointDiffScore, contribution: weights.pointDifferential * pointDiffScore },
        tournament: { weight: weights.tournamentPerformance, score: tournamentScore, contribution: weights.tournamentPerformance * tournamentScore },
        ranking: { weight: weights.ranking, score: rankingScore, contribution: weights.ranking * rankingScore },
        totalScore,
        finalProbability: Math.min(Math.max(totalScore, 0.0001), 0.9999)
    });

    // Ensure the result is a valid probability
    if (isNaN(totalScore)) {
        console.log('Invalid total score:', {
            classLevelScore,
            recentFormScore,
            headToHeadScore,
            pointDiffScore,
            tournamentScore,
            rankingScore
        });
        return 0.5;
    }

    // Allow super extreme probabilities (0.01% to 99.99%)
    return Math.min(Math.max(totalScore, 0.0001), 0.9999);
};

// Helper function to calculate ranking based on tournament performance
const calculateRanking = (matches, playerName) => {
    const points = {
        'Elite': { win: 100, loss: 50 },
        'SEN A': { win: 80, loss: 40 },
        'SEN B': { win: 60, loss: 30 },
        'SEN C': { win: 40, loss: 20 },
        'default': { win: 20, loss: 10 }
    };

    return matches.reduce((total, match) => {
        const isWinner = match["Winner Player 1"] === playerName || match["Winner Player 2"] === playerName;
        const tournamentClass = match["Tournament Class"] || 'default';
        const classPoints = points[tournamentClass] || points.default;
        return total + (isWinner ? classPoints.win : classPoints.loss);
    }, 0);
};

// Helper function to get player's ranking points
const getPlayerRankingPoints = (playerName, matches) => {
    // Add debug logging
    console.log('Looking up ranking points for:', playerName);

    // Determine if player plays men's or women's singles
    const isMensPlayer = matches.some(match => 
        (match["Team 1 Player 1"] === playerName || 
         match["Team 1 Player 2"] === playerName ||
         match["Team 2 Player 1"] === playerName ||
         match["Team 2 Player 2"] === playerName) &&
        (match["Match"] === "Herresingle" || match["Category"] === "Herresingle")
    );

    const isWomensPlayer = matches.some(match => 
        (match["Team 1 Player 1"] === playerName || 
         match["Team 1 Player 2"] === playerName ||
         match["Team 2 Player 1"] === playerName ||
         match["Team 2 Player 2"] === playerName) &&
        (match["Match"] === "Damesingle" || match["Category"] === "Damesingle")
    );

    // Use appropriate rankings data based on player's category
    const rankingsData = isMensPlayer ? dataHS : (isWomensPlayer ? dataDS : null);
    
    if (!rankingsData) {
        console.log('Could not determine player category:', playerName);
        return 0;
    }

    const playerData = rankingsData.find(player => {
        const namesMatch = player.Navn.toLowerCase() === playerName.toLowerCase();
        if (namesMatch) {
            console.log('Found player data:', player);
        }
        return namesMatch;
    });

    if (!playerData) {
        console.log('No player data found for:', playerName);
        return 0;
    }

    // Convert string points to number
    const points = parseFloat(playerData["2024"]) || 0;
    console.log('Points found:', points);

    // Verify the conversion worked
    if (isNaN(points)) {
        console.log('Failed to convert points to number:', playerData["2024"]);
        return 0;
    }

    return points;
};

// Helper function to determine match winner based on result
const determineMatchWinner = (match, playerName) => {
    const isPlayerInTeam1 = match["Team 1 Player 1"] === playerName || match["Team 1 Player 2"] === playerName;
    
    // Parse the match result to determine the winner
    if (match.Result) {
        const sets = match.Result.split(',').map(set => {
            // Split on either '/' or '-'
            const scores = set.trim().split(/[/-]/);
            const score1 = parseInt(scores[0], 10);
            const score2 = parseInt(scores[1], 10);
            
            if (isNaN(score1) || isNaN(score2)) {
                console.error('Invalid score format:', set);
                return null;
            }
            
            return score1 > score2 ? 1 : 2; // 1 if team1 won the set, 2 if team2 won
        }).filter(result => result !== null);
        
        if (sets.length === 0) return false;
        
        // Count sets won by each team
        const team1Sets = sets.filter(winner => winner === 1).length;
        const team2Sets = sets.filter(winner => winner === 2).length;
        
        // Determine match winner based on sets
        const team1Won = team1Sets > team2Sets;
        
        // If player is in team1, they win if team1 won. If they're in team2, they win if team2 won.
        return isPlayerInTeam1 ? team1Won : !team1Won;
    }
    
    // Fallback to the Winner field if Result parsing fails
    return isPlayerInTeam1 ? match["Winner"] === "1" : match["Winner"] === "2";
};

// Helper function to process player data
const processPlayerData = (matches, playerName, opponentName) => {
    const recentMatches = matches.slice(0, 10); // Last 10 matches
    let recentWeightedWins = 0;
    let headToHeadWins = 0;
    let weightedHeadToHeadWins = 0;
    let totalPointDiff = 0;
    let matchesWithPoints = 0;
    let tournamentPoints = 0;
    let recentClassLevels = [];

    // Get player's ranking points from combined rankings
    const playerRankingPoints = getPlayerRankingPoints(playerName, matches);

    // Calculate head-to-head record with improved logic and time-based weighting
    const headToHeadMatches = matches.filter(match => {
        try {
            // Check if both players are in the match
            const playerInMatch = match["Team 1 Player 1"] === playerName || 
                                match["Team 1 Player 2"] === playerName ||
                                match["Team 2 Player 1"] === playerName || 
                                match["Team 2 Player 2"] === playerName;
            
            const opponentInMatch = match["Team 1 Player 1"] === opponentName || 
                                  match["Team 1 Player 2"] === opponentName ||
                                  match["Team 2 Player 1"] === opponentName || 
                                  match["Team 2 Player 2"] === opponentName;

            if (!playerInMatch || !opponentInMatch) {
                return false;
            }

            // Check if it's a singles match
            const isSingles = match["Match"] === "Herresingle" || 
                            match["Match"] === "Damesingle" ||
                            match["Category"] === "Herresingle" ||
                            match["Category"] === "Damesingle";
            
            // Check if match is within last 2 years
            let matchDate;
            try {
                const [day, month, year] = match.Date.split('.').map(num => parseInt(num, 10));
                matchDate = new Date(year, month - 1, day);
            } catch (err) {
                console.error('Error parsing match date:', { date: match.Date, error: err });
                return false;
            }
            
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            const isWithinTwoYears = matchDate >= twoYearsAgo;

            return isSingles && isWithinTwoYears;
        } catch (err) {
            console.error('Error processing match:', { match, error: err });
            return false;
        }
    });

    // Sort head-to-head matches by date (most recent first)
    const sortedHeadToHeadMatches = headToHeadMatches.sort((a, b) => {
        try {
            const dateA = new Date(a.Date.split('.').reverse().join('-'));
            const dateB = new Date(b.Date.split('.').reverse().join('-'));
            return dateB - dateA;
        } catch (err) {
            console.error('Error sorting matches:', { error: err });
            return 0;
        }
    });

    // Process head-to-head matches with time-based weighting
    sortedHeadToHeadMatches.forEach((match, index) => {
        try {
            const playerWon = determineMatchWinner(match, playerName);
            
            // Calculate time-based weight (more recent matches count more)
            // Weight decreases by 20% for each older match
            const timeWeight = Math.pow(0.8, index);
            
            if (playerWon) {
                headToHeadWins++; // Keep track of raw wins
                weightedHeadToHeadWins += timeWeight; // Add weighted win
            }
        } catch (err) {
            console.error('Error processing head-to-head match result:', { match, error: err });
        }
    });

    // Process recent matches with recency weighting
    recentMatches.forEach((match, index) => {
        const recencyWeight = 1 - (index * 0.05); // 5% decay per match older
        
        // Track class levels from recent matches
        if (match["Tournament Class"]) {
            recentClassLevels.push({
                class: match["Tournament Class"],
                weight: recencyWeight
            });
        }

        // Calculate win streak and weighted recent form
        const isWinner = determineMatchWinner(match, playerName);
        
        // For win streak, we only care about consecutive wins
        if (index === 0 && isWinner) {
            recentWeightedWins = 1; // Start streak
        } else if (index > 0 && isWinner && recentWeightedWins > 0) {
            recentWeightedWins += 1; // Continue streak
        } else {
            recentWeightedWins = 0; // Break streak
        }

        // Calculate point differential
        if (match.Result) {
            const sets = match.Result.split(',');
            sets.forEach(set => {
                const [score1, score2] = set.trim().split('-').map(Number);
                if (!isNaN(score1) && !isNaN(score2)) {
                    const diff = isWinner ? score1 - score2 : score2 - score1;
                    totalPointDiff += diff * recencyWeight;
                    matchesWithPoints++;
                }
            });
        }

        // Calculate tournament performance
        const tournamentClass = match["Tournament Class"];
        if (tournamentClass) {
            let points = 1;
            if (tournamentClass.includes('Elite')) points = 3;
            else if (tournamentClass.includes('A')) points = 2;
            tournamentPoints += points * recencyWeight;
        }
    });

    return {
        name: playerName,
        recentWeightedWins,
        headToHeadWins,
        weightedHeadToHeadWins,
        avgPointDiff: matchesWithPoints > 0 ? totalPointDiff / matchesWithPoints : 0,
        tournamentPerformance: tournamentPoints,
        ranking: calculateRanking(matches, playerName),
        rankingPoints: playerRankingPoints,
        classLevel: determinePlayerClass(matches, playerName)
    };
};

// Detailed Breakdown Component
const DetailedBreakdown = ({ isOpen, onClose, prediction, player1, player2, reasoning, headToHeadMatches }) => {
    if (!isOpen) return null;

    // Calculate factor weights based on head-to-head matches
    const getWeights = () => {
        // Check if we have any recent head-to-head matches
        const hasRecentMatches = prediction.headToHeadWins + prediction.headToHeadLosses > 0;
        const gameType = 'Single'; // Since we're only dealing with singles matches
        let baseWeights;

        if (!hasRecentMatches) {
            // No head-to-head matches - use these weights with strong class level influence
            baseWeights = {
                classLevel: 0.90,  // Very strong class level influence
                recentForm: 0.02,  // Minimal recent form influence
                headToHead: 0.0,   // No head-to-head influence
                pointDifferential: 0.0, // No point differential since no head-to-head
                tournamentPerformance: 0.03, // Slightly increased tournament influence
                ranking: 0.05 // Small ranking influence
            };
        } else {
            // Has head-to-head matches - use original weights
            baseWeights = {
                classLevel: 0.08,
                recentForm: 0.02,
                headToHead: 0.75,
                pointDifferential: 0.10,
                tournamentPerformance: 0.02,
                ranking: gameType === 'Single' ? 0.03 : 0
            };

            // If matches were close, increase point differential weight
            if (prediction.player1AvgPointDiff < 5 && prediction.player2AvgPointDiff < 5) {
                const extraWeight = 0.15;
                baseWeights.headToHead -= extraWeight;
                baseWeights.pointDifferential += extraWeight;
            }
        }

        // If players are in the same class, remove class weight and redistribute
        if (reasoning.player1Class === reasoning.player2Class) {
            const classWeight = baseWeights.classLevel;
            baseWeights.classLevel = 0;

            // Calculate total of remaining weights
            const totalWeight = Object.values(baseWeights).reduce((sum, weight) => sum + weight, 0);
            
            // Redistribute class weight proportionally to other factors
            Object.keys(baseWeights).forEach(factor => {
                if (factor !== 'classLevel' && baseWeights[factor] > 0) {
                    baseWeights[factor] += (baseWeights[factor] / totalWeight) * classWeight;
                }
            });
        }

        // Special case: If one player is Elite and the other is much lower class
        const isEliteVsLower = (reasoning.player1Class.includes('Elite') && !reasoning.player2Class.includes('Elite')) ||
                              (reasoning.player2Class.includes('Elite') && !reasoning.player1Class.includes('Elite'));
        
        if (isEliteVsLower) {
            // Heavily weight class level for Elite vs non-Elite matchups
            const eliteWeight = 0.95;
            const remainingWeight = 1 - eliteWeight;
            
            // Store original proportions of other weights
            const oldWeights = { ...baseWeights };
            const totalOtherWeight = Object.values(oldWeights).reduce((sum, w) => sum + (w === baseWeights.classLevel ? 0 : w), 0);
            
            // Reset weights
            baseWeights.classLevel = eliteWeight;
            
            // Distribute remaining weight proportionally
            Object.keys(baseWeights).forEach(factor => {
                if (factor !== 'classLevel') {
                    baseWeights[factor] = (oldWeights[factor] / totalOtherWeight) * remainingWeight;
                }
            });
        }

        // Ensure weights sum to 1.0
        const totalWeight = Object.values(baseWeights).reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(totalWeight - 1.0) > 0.001) {
            Object.keys(baseWeights).forEach(factor => {
                baseWeights[factor] = baseWeights[factor] / totalWeight;
            });
        }

        return baseWeights;
    };

    const weights = getWeights();

    return (
        <FloatingPortal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative bg-[#1a1f2e]/95 backdrop-blur-xl text-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-800/50 overflow-hidden max-h-[600px]"
                    style={{ zIndex: 10000 }}
                >
                    {/* Header - Fixed */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-b border-gray-800/50 flex items-center justify-between sticky top-0 z-[10001]">
                        <div className="flex items-center space-x-3">
                            <ChartPieIcon className="w-6 h-6 text-yellow-500" />
                            <h4 className="text-xl font-semibold text-yellow-500">Detaljert Beregning</h4>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800/50 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(600px - 73px)' }}>
                        {/* Factor Weights */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <ChartPieIcon className="w-5 h-5 text-yellow-500" />
                                <span>Vekting av Faktorer</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-[#1e2435] p-4 rounded-xl border border-yellow-500/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Klassenivå</span>
                                    <span className="text-yellow-500 font-medium">{(weights.classLevel * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Poengforskjell i kamper</span>
                                    <span className="text-yellow-500 font-medium">{(weights.pointDifferential * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Seiersrekke</span>
                                    <span className="text-yellow-500 font-medium">{(weights.recentForm * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Turneringsresultater</span>
                                    <span className="text-yellow-500 font-medium">{(weights.tournamentPerformance * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Innbyrdes oppgjør</span>
                                    <span className="text-yellow-500 font-medium">{(weights.headToHead * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Rankingpoeng</span>
                                    <span className="text-yellow-500 font-medium">{(weights.ranking * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                {prediction.headToHeadWins + prediction.headToHeadLosses > 0 ? (
                                    <>
                                        {prediction.player1AvgPointDiff < 5 && prediction.player2AvgPointDiff < 5 ? (
                                            "Siden innbyrdes kamper har vært jevne, vektlegges poengforskjell i kampene mer."
                                        ) : (
                                            "Innbyrdes oppgjør vektlegges høyt siden spillerne har møtt hverandre før."
                                        )}
                                    </>
                                ) : (
                                    "Ingen innbyrdes kamper, så klassenivå vektlegges høyere."
                                )}
                                {reasoning.player1Class === reasoning.player2Class && (
                                    " Klassenivå-vekt er omfordelt siden spillerne er i samme klasse."
                                )}
                            </div>
                        </div>

                        {/* Class Level Analysis */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <SparklesIcon className="w-5 h-5 text-yellow-500" />
                                <span>Klasseforskjell</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-blue-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 1</div>
                                    <div className="text-blue-400 font-medium text-lg">{reasoning.player1Class}</div>
                                    <div className="text-xs text-gray-500 mt-1">Grunnlag: {reasoning.player1Confidence}</div>
                                </div>
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-pink-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 2</div>
                                    <div className="text-pink-400 font-medium text-lg">{reasoning.player2Class}</div>
                                    <div className="text-xs text-gray-500 mt-1">Grunnlag: {reasoning.player2Confidence}</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Form */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <FireIcon className="w-5 h-5 text-yellow-500" />
                                <span>Vinnende Rekke</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-blue-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 1</div>
                                    <div className="text-blue-400 font-medium text-lg">
                                        {prediction.player1WinStreak || 0} kamper på rad
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Siste {reasoning.recentMatches.player1} kamper</div>
                                </div>
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-pink-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 2</div>
                                    <div className="text-pink-400 font-medium text-lg">
                                        {prediction.player2WinStreak || 0} kamper på rad
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Siste {reasoning.recentMatches.player2} kamper</div>
                                </div>
                            </div>
                        </div>

                        {/* Head-to-Head Analysis */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <ScaleIcon className="w-5 h-5 text-yellow-500" />
                                <span>Innbyrdes Oppgjør</span>
                            </h5>
                            {prediction.headToHeadWins + prediction.headToHeadLosses > 0 ? (
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-yellow-500/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-blue-400 font-medium">{player1}</div>
                                        <div className="text-xl font-bold text-yellow-500">
                                            {prediction.headToHeadWins} - {prediction.headToHeadLosses}
                                        </div>
                                        <div className="text-pink-400 font-medium">{player2}</div>
                                    </div>
                                    
                                    {/* Match History List */}
                                    <div className="mt-4 space-y-2">
                                        {headToHeadMatches.sort((a, b) => {
                                            // Sort by date, most recent first
                                            const dateA = new Date(a.Date.split('.').reverse().join('-'));
                                            const dateB = new Date(b.Date.split('.').reverse().join('-'));
                                            return dateB - dateA;
                                        }).map((match, index) => {
                                            const isPlayer1InTeam1 = match["Team 1 Player 1"] === player1 || match["Team 1 Player 2"] === player1;
                                            
                                            // Determine winner based on match result
                                            const player1Won = (() => {
                                                if (match.Result) {
                                                    const sets = match.Result.split(',').map(set => {
                                                        const [score1, score2] = set.trim().split('-').map(Number);
                                                        return score1 > score2 ? 1 : 2; // 1 if team1 won the set, 2 if team2 won
                                                    });
                                                    
                                                    // Count sets won by each team
                                                    const team1Sets = sets.filter(winner => winner === 1).length;
                                                    const team2Sets = sets.filter(winner => winner === 2).length;
                                                    
                                                    // Determine match winner based on sets
                                                    const team1Won = team1Sets > team2Sets;
                                                    
                                                    // If player1 is in team1, they win if team1 won. If they're in team2, they win if team2 won.
                                                    return isPlayer1InTeam1 ? team1Won : !team1Won;
                                                }
                                                
                                                // Fallback to the Winner field if Result parsing fails
                                                return isPlayer1InTeam1 ? match["Winner"] === "1" : match["Winner"] === "2";
                                            })();
                                            
                                            return (
                                                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-800/30">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`w-2 h-2 rounded-full ${player1Won ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                                                        <span className="text-gray-400">{match.Date}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className={player1Won ? 'text-blue-400 font-medium' : 'text-gray-400'}>
                                                            {player1}
                                                        </span>
                                                        <span className="text-yellow-500 font-medium">
                                                            {match.Result}
                                                        </span>
                                                        <span className={!player1Won ? 'text-pink-400 font-medium' : 'text-gray-400'}>
                                                            {player2}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-500 text-xs">
                                                        {match["Tournament Class"]}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mt-3">
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-yellow-500"
                                            style={{ width: `${prediction.headToHeadWinRate * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 text-center">
                                        Siste 2 år (kun single)
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-yellow-500/20">
                                    <div className="text-center text-gray-400">
                                        Ingen innbyrdes kamper siste 2 år (single)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Point Differential */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <ChartBarIcon className="w-5 h-5 text-yellow-500" />
                                <span>Poengforskjell per Sett</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-blue-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 1</div>
                                    <div className="text-blue-400 font-medium text-lg">
                                        {prediction.player1AvgPointDiff > 0 ? '+' : ''}{prediction.player1AvgPointDiff.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Gjennomsnitt</div>
                                </div>
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-pink-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 2</div>
                                    <div className="text-pink-400 font-medium text-lg">
                                        {prediction.player2AvgPointDiff > 0 ? '+' : ''}{prediction.player2AvgPointDiff.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Gjennomsnitt</div>
                                </div>
                            </div>
                        </div>

                        {/* Tournament Performance */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                                <span>Turneringsprestasjoner</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-blue-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 1</div>
                                    <div className="text-blue-400 font-medium text-lg flex items-baseline">
                                        {Math.round(prediction.player1TournamentScore * 100)}%
                                        {prediction.player1TournamentScore > 1 && 
                                            <span className="text-green-400 text-sm ml-2">(Over snitt)</span>
                                        }
                                        {prediction.player1TournamentScore < 1 && 
                                            <span className="text-red-400 text-sm ml-2">(Under snitt)</span>
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Turneringsprestasjon (100% er snitt)</div>
                                </div>
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-pink-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 2</div>
                                    <div className="text-pink-400 font-medium text-lg flex items-baseline">
                                        {Math.round(prediction.player2TournamentScore * 100)}%
                                        {prediction.player2TournamentScore > 1 && 
                                            <span className="text-green-400 text-sm ml-2">(Over snitt)</span>
                                        }
                                        {prediction.player2TournamentScore < 1 && 
                                            <span className="text-red-400 text-sm ml-2">(Under snitt)</span>
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Turneringsprestasjon (100% er snitt)</div>
                                </div>
                            </div>
                        </div>

                        {/* Ranking Points */}
                        <div className="space-y-3">
                            <h5 className="text-lg font-medium text-gray-300 flex items-center space-x-2">
                                <StarIcon className="w-5 h-5 text-yellow-500" />
                                <span>Rankingpoeng</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-blue-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 1</div>
                                    <div className="text-blue-400 font-medium text-lg">
                                        {prediction.player1RankingPoints || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">2024-ranking</div>
                                </div>
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-pink-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 2</div>
                                    <div className="text-pink-400 font-medium text-lg">
                                        {prediction.player2RankingPoints || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">2024-ranking</div>
                                </div>
                            </div>
                        </div>

                        {/* Final Calculation */}
                        <div className="mt-8 bg-[#1e2435] p-4 rounded-xl border border-yellow-500/20">
                            <h5 className="text-lg font-medium text-yellow-500 mb-4">Sluttresultat</h5>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-blue-400">{player1}</div>
                                    <div className="text-xl font-bold text-yellow-500">
                                        {Math.round(prediction.player1Probability * 100)}%
                                    </div>
                                    <div className="text-pink-400">{player2}</div>
                                </div>
                                <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-pink-500"
                                        style={{ width: `${prediction.player1Probability * 100}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 text-center mt-2">
                                    Basert på vektet gjennomsnitt av alle faktorer
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </FloatingPortal>
    );
};

const MatchPrediction = ({ player1, player2, matches }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [headToHeadMatches, setHeadToHeadMatches] = useState([]); // Add this line
    const [reasoning, setReasoning] = useState({
        player1Class: 'Ukjent',
        player1Confidence: 'Hører ikke til i klasen',
        player2Class: 'Ukjent',
        player2Confidence: 'svært lav',
        recentMatches: { player1: 0, player2: 0 }
    });

    const { refs, floatingStyles, context } = useFloating({
        open: isModalOpen,
        onOpenChange: setIsModalOpen,
        middleware: [offset(10), shift()],
        placement: 'top'
    });

    const hover = useHover(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    useEffect(() => {
        try {
            // Determine current class levels for both players
            const player1ClassLevel = determinePlayerClass(matches, player1);
            const player2ClassLevel = determinePlayerClass(matches, player2);

            // Analyze class suitability
            const player1ClassAnalysis = analyzeClassSuitability(player1ClassLevel);
            const player2ClassAnalysis = analyzeClassSuitability(player2ClassLevel);

            console.log('Player levels:', {
                player1: player1ClassLevel,
                player2: player2ClassLevel,
                player1Analysis: player1ClassAnalysis,
                player2Analysis: player2ClassAnalysis
            });

            // Process player statistics
            const p1Stats = {
                ...processPlayerData(matches, player1, player2),
                classLevel: player1ClassLevel
            };
            
            const p2Stats = {
                ...processPlayerData(matches, player2, player1),
                classLevel: player2ClassLevel
            };

            // Calculate win probability
            const player1WinProb = calculateWinProbability(p1Stats, p2Stats, 'Single', matches);
            
            // Calculate head-to-head statistics
            const filteredHeadToHeadMatches = matches.filter(match => {
                const team1HasPlayer = match["Team 1 Player 1"] === player1 || match["Team 1 Player 2"] === player1;
                const team2HasPlayer = match["Team 2 Player 1"] === player1 || match["Team 2 Player 2"] === player1;
                const team1HasOpponent = match["Team 1 Player 1"] === player2 || match["Team 1 Player 2"] === player2;
                const team2HasOpponent = match["Team 2 Player 1"] === player2 || match["Team 2 Player 2"] === player2;
                
                // Check if it's a singles match
                const isSingles = match["Match"] === "Herresingle" || 
                                match["Match"] === "Damesingle" ||
                                match["Category"] === "Herresingle" ||
                                match["Category"] === "Damesingle";
                
                // Check if match is within last 2 years
                let matchDate;
                try {
                    const [day, month, year] = match.Date.split('.').map(num => parseInt(num, 10));
                    matchDate = new Date(year, month - 1, day);
                    const twoYearsAgo = new Date();
                    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                    return (team1HasPlayer && team2HasOpponent || team2HasPlayer && team1HasOpponent) && 
                           isSingles && matchDate >= twoYearsAgo;
                } catch (err) {
                    console.error('Error parsing match date:', { date: match.Date, error: err });
                    return false;
                }
            });

            setHeadToHeadMatches(filteredHeadToHeadMatches); // Add this line

            const headToHeadWins = filteredHeadToHeadMatches.filter(match => {
                const playerInTeam1 = match["Team 1 Player 1"] === player1 || match["Team 1 Player 2"] === player1;
                
                // Parse the match result to determine the winner
                if (match.Result) {
                    const sets = match.Result.split(',').map(set => {
                        const [score1, score2] = set.trim().split('-').map(Number);
                        return score1 > score2 ? 1 : 2; // 1 if team1 won the set, 2 if team2 won
                    });
                    
                    // Count sets won by each team
                    const team1Sets = sets.filter(winner => winner === 1).length;
                    const team2Sets = sets.filter(winner => winner === 2).length;
                    
                    // Determine match winner based on sets
                    const team1Won = team1Sets > team2Sets;
                    
                    // If player1 is in team1, they win if team1 won. If they're in team2, they win if team2 won.
                    return playerInTeam1 ? team1Won : !team1Won;
                }
                
                // Fallback to the Winner field if Result parsing fails
                return playerInTeam1 ? match["Winner"] === "1" : match["Winner"] === "2";
            }).length;

            const headToHeadLosses = filteredHeadToHeadMatches.length - headToHeadWins;
            const headToHeadWinRate = filteredHeadToHeadMatches.length > 0 ? headToHeadWins / filteredHeadToHeadMatches.length : 0;

            // Check if we have any recent head-to-head matches
            const hasRecentMatches = filteredHeadToHeadMatches.length > 0;

            // Calculate point differentials
            const calculatePointDiff = (playerName) => {
                const playerMatches = matches.filter(match => 
                    match["Team 1 Player 1"] === playerName || 
                    match["Team 1 Player 2"] === playerName || 
                    match["Team 2 Player 1"] === playerName || 
                    match["Team 2 Player 2"] === playerName
                );

                let totalDiff = 0;
                let totalSets = 0;

                playerMatches.forEach(match => {
                    if (match.Result) {
                        const sets = match.Result.split(',');
                        sets.forEach(set => {
                            const [score1, score2] = set.trim().split('-').map(Number);
                            if (!isNaN(score1) && !isNaN(score2)) {
                                const isPlayerInTeam1 = match["Team 1 Player 1"] === playerName || match["Team 1 Player 2"] === playerName;
                                const diff = isPlayerInTeam1 ? score1 - score2 : score2 - score1;
                                totalDiff += diff;
                                totalSets++;
                            }
                        });
                    }
                });

                return totalSets > 0 ? totalDiff / totalSets : 0;
            };

            const player1AvgPointDiff = calculatePointDiff(player1);
            const player2AvgPointDiff = calculatePointDiff(player2);

            // Calculate tournament performance scores
            const calculateTournamentScore = (playerName) => {
                const playerMatches = matches.filter(match => 
                    match["Team 1 Player 1"] === playerName || 
                    match["Team 1 Player 2"] === playerName || 
                    match["Team 2 Player 1"] === playerName || 
                    match["Team 2 Player 2"] === playerName
                );

                let totalScore = 0;
                let totalMatches = 0;

                playerMatches.forEach(match => {
                    const isWinner = match["Winner Player 1"] === playerName || match["Winner Player 2"] === playerName;
                    const tournamentClass = match["Tournament Class"];
                    if (tournamentClass) {
                        const classScore = getClassLevelScore(tournamentClass);
                        totalScore += isWinner ? classScore : 0;
                        totalMatches++;
                    }
                });

                return totalMatches > 0 ? totalScore / totalMatches : 0;
            };

            const player1TournamentScore = calculateTournamentScore(player1);
            const player2TournamentScore = calculateTournamentScore(player2);
            
            // Generate reasoning text
            const getClassText = (level) => {
                const classMap = {
                    7: 'Elite/SEN E',
                    5: 'SEN A',
                    4: 'SEN B',
                    3: 'SEN C',
                    2: 'SEN D',
                    1: 'SEN F',
                    0: 'Ukjent'
                };
                return classMap[level] || 'Ukjent';
            };

            const getConfidenceText = (confidence) => {
                if (confidence >= 0.8) return 'svært høy';
                if (confidence >= 0.6) return 'høy';
                if (confidence >= 0.4) return 'moderat';
                if (confidence >= 0.2) return 'lav';
                return 'svært lav';
            };

            // Count recent matches
            const recentMatchesCount = (playerName) => {
                return findPlayerMatches(matches, playerName).filter(m => {
                    const matchDate = new Date(m.Date.split('.').reverse().join('-'));
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                    return matchDate >= sixMonthsAgo;
                }).length;
            };

            const reasoningText = {
                player1Class: getClassText(player1ClassLevel.level),
                player1Confidence: getConfidenceText(player1ClassLevel.confidence),
                player2Class: getClassText(player2ClassLevel.level),
                player2Confidence: getConfidenceText(player2ClassLevel.confidence),
                recentMatches: {
                    player1: recentMatchesCount(player1),
                    player2: recentMatchesCount(player2)
                }
            };

            console.log('Reasoning:', reasoningText);
            
            // Get ranking points
            const player1RankingPoints = getPlayerRankingPoints(player1, matches);
            const player2RankingPoints = getPlayerRankingPoints(player2, matches);
            
            setPrediction({
                player1Probability: player1WinProb,
                player2Probability: 1 - player1WinProb,
                odds: {
                    player1: (1 / player1WinProb).toFixed(2),
                    player2: (1 / (1 - player1WinProb)).toFixed(2)
                },
                headToHeadWins,
                headToHeadLosses,
                headToHeadWinRate,
                player1AvgPointDiff,
                player2AvgPointDiff,
                player1TournamentScore,
                player2TournamentScore,
                player1RankingPoints,
                player2RankingPoints
            });
            
            setReasoning(reasoningText);
        } catch (err) {
            console.error('Prediction error:', err);
            setError("Kunne ikke beregne prediksjon");
        } finally {
            setLoading(false);
        }
    }, [player1, player2, matches]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 py-4">
                {error}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-8 mt-8 shadow-2xl border border-white/10"
        >
            <div className="space-y-6 sm:space-y-8">
                {prediction && (
                    <>
                        {/* Premium Title with Trophy Icon and Info Button */}
                        <div className="relative flex justify-center items-center mb-6 sm:mb-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
                            </div>
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="relative flex flex-col items-center"
                            >
                                <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-yellow-500/20 mb-3">
                                    <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">
                                        Vinnersannsynlighet
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-gray-800/50 hover:bg-gray-800 text-yellow-500/70 hover:text-yellow-400 p-1.5 rounded-lg border border-yellow-500/20 transition-all duration-200 transform hover:scale-105"
                                    >
                                        <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                                <div className="mt-2 flex items-center space-x-1">
                                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500/70" />
                                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500/70" />
                                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500/70" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Enhanced Player Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
                            {[
                                { name: player1, prob: prediction.player1Probability, color: 'blue', side: 'left' },
                                { name: player2, prob: 1 - prediction.player1Probability, color: 'pink', side: 'right' }
                            ].map((player, index) => (
                                <motion.div
                                    key={player.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className={`bg-gradient-to-br from-${player.color}-500/10 to-transparent p-3 sm:p-4 rounded-xl border border-${player.color}-500/20 backdrop-blur-sm`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`text-${player.color}-400 text-base sm:text-lg font-medium truncate mr-2`}>
                                            {player.name}
                                        </div>
                                        <div className={`text-${player.color}-400 text-base sm:text-lg font-bold`}>
                                            {Math.round(player.prob * 100)}%
                                        </div>
                                    </div>
                                    <div className={`mt-2 h-1.5 bg-${player.color}-400/20 rounded-full overflow-hidden`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${player.prob * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`h-full bg-${player.color}-400`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Enhanced Probability Bar */}
                        <div className="relative">
                            <motion.div 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.4, duration: 0.7 }}
                                className="h-3 sm:h-4 bg-gray-700/30 rounded-full overflow-hidden shadow-lg border border-white/5"
                            >
                                <div className="absolute inset-0 flex">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${prediction.player1Probability * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-blue-600/80 to-blue-400/80 backdrop-blur-sm"
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(1 - prediction.player1Probability) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-pink-400/80 to-pink-600/80 backdrop-blur-sm"
                                    />
                                </div>
                            </motion.div>
                            
                            {/* Floating Markers */}
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-white/20 rounded-full"></div>
                            </div>
                        </div>

                        {/* Enhanced Odds Display */}
                        <div className="flex justify-between items-center gap-3 sm:gap-6 mt-6 sm:mt-10 mb-6 sm:mb-10">
                            {[
                                { odds: prediction.odds.player1, color: 'blue' },
                                { odds: prediction.odds.player2, color: 'pink' }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className={`flex-1 bg-gradient-to-br from-${item.color}-500/10 to-transparent p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-${item.color}-500/20 backdrop-blur-sm`}
                                >
                                    <div className={`text-2xl sm:text-4xl font-bold text-${item.color}-400 text-center mb-1 sm:mb-2`}>
                                        {item.odds}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-400 flex items-center justify-center">
                                        <ScaleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        odds
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats Section */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <ChartPieIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                                <h4 className="text-lg sm:text-xl font-semibold text-gray-200">Detaljert Statistikk</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                {[
                                    { player: 'player1', color: 'blue', data: reasoning.player1Class, confidence: reasoning.player1Confidence, matches: reasoning.recentMatches.player1 },
                                    { player: 'player2', color: 'pink', data: reasoning.player2Class, confidence: reasoning.player2Confidence, matches: reasoning.recentMatches.player2 }
                                ].map((stats, index) => (
                                    <div
                                        key={stats.player}
                                        className={`bg-gradient-to-br from-${stats.color}-500/5 via-transparent to-transparent p-3 sm:p-6 rounded-xl border border-${stats.color}-500/10 space-y-3 sm:space-y-4`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`text-${stats.color}-400 font-medium flex items-center text-sm sm:text-base`}>
                                                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                Klasse
                                            </div>
                                            <div className={`text-${stats.color}-400 font-bold text-sm sm:text-base`}>{stats.data}</div>
                                        </div>
                                        <div className="space-y-2">
                                            
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span className="text-gray-400">Kamper (6 mnd)</span>
                                                <span className="text-gray-300">{stats.matches}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Replace InfoModal with DetailedBreakdown */}
                        <DetailedBreakdown 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)}
                            prediction={prediction}
                            player1={player1}
                            player2={player2}
                            reasoning={reasoning}
                            headToHeadMatches={headToHeadMatches}  // Add this line
                        />
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default MatchPrediction;