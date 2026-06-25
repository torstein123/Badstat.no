import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloating, useInteractions, useHover, offset, shift, FloatingPortal } from '@floating-ui/react';
import { getPlayerRankings } from '../services/databaseService';

// Add Heroicons imports for illustrations
import { ChartBarIcon, ScaleIcon, TrophyIcon, ChartPieIcon, SparklesIcon, FireIcon, StarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Class-letter ordinal scale (higher is better). In Norwegian badminton the
// senior order is X (Elite, top) > A > B > C > D > E > F (bottom). Tournament
// Class values are prefixed by cohort, e.g. "SEN A", "U15 A", "U17 X",
// "V45+ A" — so we parse the trailing letter token rather than substring-match
// (which previously mapped "U15 A" -> A via includes and "SEN E" -> Elite).
// In Norwegian badminton "E" (Senior E) is the ELITE / top class, and "X" is
// likewise a top tier; the amateur ladder A > B > C > D > F sits below them.
// Scores step by 2 between each class so every class gap is weighted evenly.
// 0 stays reserved for "unknown" (no class data).
const LETTER_SCORE = {
    'E': 11,    // Elite / top tier
    'X': 11,    // top tier
    'ELITE': 11,
    'A': 9,
    'B': 7,
    'C': 5,
    'D': 3,
    'F': 1
};

// Helper function to get class level score (higher is better)
const getClassLevelScore = (className) => {
    if (!className) return 0;
    const s = className.trim().toUpperCase();
    if (s.includes('ELITE')) return 11;
    // Class letter is the last whitespace-separated token: "SEN E" -> "E",
    // "U15 A" -> "A", "V45+ A" -> "A". Unknown/malformed (e.g. "ÅPEN HC",
    // stray dates) -> 0 so they stay out of the class signal.
    const token = s.split(/\s+/).pop();
    return LETTER_SCORE[token] != null ? LETTER_SCORE[token] : 0;
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
        const sortedMatches = [...playerMatches].sort(
            (a, b) => parsePlayerDate(b.Date) - parsePlayerDate(a.Date)
        );

        // Class level should reflect the player's CURRENT level, so prefer this
        // season's matches (last 12 months). A player's early-career matches
        // (often in lower or letterless classes) must not drag it down. If they
        // haven't played in the last year, fall back to their 15 most recent
        // matches — still "latest", never the whole career.
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const thisYear = sortedMatches.filter(m => parsePlayerDate(m.Date) >= oneYearAgo);
        const recentMatches = thisYear.length > 0 ? thisYear : sortedMatches.slice(0, 15);

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
            // Skip classes we can't rank (bare "SEN", "U19", "U13", malformed).
            // Counting them as 0 would unfairly drag the average down.
            if (classScore > 0) {
                weightedSum += classScore * weight;
                totalWeight += weight;
                classesPlayed.add(tournamentClass);
            }
        }
    });

    // Calculate average class value
    const averageClassValue = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Snap the weighted average class score to the nearest class level (scale
    // steps by 2; midpoints at 10/8/6/4/2). 0 stays "unknown".
    let level;
    if (averageClassValue >= 10) level = 11;      // Elite (E / X)
    else if (averageClassValue >= 8) level = 9;   // SEN A
    else if (averageClassValue >= 6) level = 7;   // SEN B
    else if (averageClassValue >= 4) level = 5;   // SEN C
    else if (averageClassValue >= 2) level = 3;   // SEN D
    else if (averageClassValue > 0) level = 1;    // SEN F
    else level = 0;

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

    // `matches` here is already the mutual head-to-head set (both players, on
    // opposite teams) supplied by getHeadToHeadMatches. We no longer re-impose a
    // singles-only / 2-year cutoff that silently discarded valid rivalries and
    // forced the class-only fallback; recency is handled by time-weighting in
    // processPlayerData instead.
    const headToHeadMatches = matches;

    // Whether the players have ever met head-to-head decides the weight scheme.
    const hasRecentMatches = headToHeadMatches.length > 0;

    // Two weight templates: one when the players have no direct singles record
    // (lean on ranking + class), one when they have a solid record (the direct
    // result dominates). We BLEND between them by how much head-to-head data
    // exists, so a single meeting can't override a huge ranking/class gap — you
    // need ~3 meetings before the head-to-head term is fully trusted.
    const noH2HWeights = {
        classLevel: 0.45,
        recentForm: 0.0,
        headToHead: 0.0,
        pointDifferential: 0.0,
        tournamentPerformance: 0.10,
        ranking: 0.45
    };
    const fullH2HWeights = {
        classLevel: 0.08,
        recentForm: 0.05,
        headToHead: 0.60,
        pointDifferential: 0.17,
        tournamentPerformance: 0.02,
        ranking: 0.08
    };

    // Confidence in the head-to-head signal ramps 0 → 1 over the first 3 meetings.
    const h2hConfidence = Math.min(headToHeadMatches.length / 3, 1);
    const weights = {};
    Object.keys(noH2HWeights).forEach(factor => {
        weights[factor] = noH2HWeights[factor] * (1 - h2hConfidence) +
                          fullH2HWeights[factor] * h2hConfidence;
    });

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

        // Same class → no class edge (weight was already zeroed/redistributed
        // by the single same-class block above).
        if (p1Level.level === p2Level.level) {
            return 0.5;
        }

        const levelDiff = p1Level.level - p2Level.level;
        // Use the higher of the two confidences if one player has established class
        const confidenceWeight = Math.max(p1Level.confidence || 0, p2Level.confidence || 0);
        
        // Helper function to get class text from level
        const getClassText = (level) => {
            const classMap = {
                11: 'Elite (SEN E)',
                9: 'SEN A',
                7: 'SEN B',
                5: 'SEN C',
                3: 'SEN D',
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
        
        // Require solid confidence before emitting a class-dominance score, and
        // keep the caps short of certainty (class is a coarse signal). Levels
        // step by 2 per class, so 1 class apart = |levelDiff| 2, 2+ classes = 4+.
        // 2+ classes apart:
        if (Math.abs(levelDiff) >= 4 && confidenceWeight > 0.7) {
            const score = levelDiff > 0 ? 0.85 : 0.15;
            console.log('2+ class difference case:', { score, levelDiff });
            return score;
        }

        // 1 class apart:
        if (Math.abs(levelDiff) === 2 && confidenceWeight > 0.7) {
            const score = levelDiff > 0 ? 0.70 : 0.30;
            console.log('1 class difference case:', { score, levelDiff });
            return score;
        }

        // For less confident cases
        const baseScore = normalizeScore(p1Level.level || 0, p2Level.level || 0);
        const finalScore = baseScore * confidenceWeight + 0.5 * (1 - confidenceWeight);
        console.log('Low confidence case:', { baseScore, confidenceWeight, finalScore });
        return finalScore;
    })();

    // Ranking score from each player's official ranking points.
    //
    // Ranking points are heavily RIGHT-SKEWED (most senior singles players sit
    // under ~100 pts, the top tail reaches ~1200). An absolute point gap is
    // therefore misleading — a 244-pt gap is a chasm down in the crowded low end
    // (rank ~500 vs ~35) but trivial near the top (rank ~3 vs #1). So we compare
    // on a LOG-RATIO and squash it through a logistic, which reflects the real
    // skill gap at every part of the scale.
    const rankingScore = (() => {
        const p1Points = player1Stats.rankingPoints || 0;
        const p2Points = player2Stats.rankingPoints || 0;

        if (isNaN(p1Points) || isNaN(p2Points)) return 0.5;
        if (p1Points === 0 && p2Points === 0) return 0.5; // neither ranked → neutral

        // Soft floor: an unranked (0) or barely-ranked player slots smoothly into
        // the bottom of the curve instead of hitting a hard 70/30 cliff.
        const FLOOR = 10;
        const a = Math.max(p1Points, FLOOR);
        const b = Math.max(p2Points, FLOOR);

        // K tuned so ~2x points ≈ 60%, ~10x ≈ 80%, ~20x ≈ 86%. Capped to 0.05..0.95.
        const K = 0.6;
        const logGap = Math.log(a) - Math.log(b);
        const prob = 1 / (1 + Math.exp(-K * logGap));

        console.log('Ranking probability (log-ratio):', { p1Points, p2Points, logGap, prob });

        return Math.min(Math.max(prob, 0.05), 0.95);
    })();

    // Recent form: each player's recency-weighted win RATE (0..1). Combine
    // symmetrically so equal form → 0.5.
    const p1Form = player1Stats.recentFormRate != null ? player1Stats.recentFormRate : 0.5;
    const p2Form = player2Stats.recentFormRate != null ? player2Stats.recentFormRate : 0.5;
    const recentFormScore = (p1Form + (1 - p2Form)) / 2;

    const headToHeadScore = hasRecentMatches ?
        normalizeScore(player1Stats.weightedHeadToHeadWins || 0, player2Stats.weightedHeadToHeadWins || 0) :
        0.5; // Neutral score when no head-to-head exists

    // Point differential: logistic on the SIGNED gap of the two average per-set
    // margins. Centered at 0.5, saturates for large gaps. (The old +21 offset
    // through an abs-ratio compressed everything toward 0.5 and mishandled
    // negative margins.)
    const pointDiffGap = (player1Stats.avgPointDiff || 0) - (player2Stats.avgPointDiff || 0);
    const pointDiffScore = 1 / (1 + Math.exp(-0.25 * pointDiffGap));

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

// Year columns in the rankings table, newest first. We read the latest
// non-empty value so the signal isn't frozen to a hardcoded season.
const RANKING_YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013'];

const latestRankingPoints = (row) => {
    for (const y of RANKING_YEARS) {
        const v = parseFloat(row?.[y]);
        if (!isNaN(v) && v > 0) return v;
    }
    return 0;
};

// Get a player's ranking strength, looked up BY NAME across all categories and
// age groups (independent of the match data, so youth/veteran and never-met
// players resolve correctly). Prefers singles (HS/DS); falls back to the best
// available ranking row.
const getPlayerRankingPoints = async (playerName) => {
    try {
        const rows = await getPlayerRankings(playerName);
        if (!rows || rows.length === 0) return 0;
        const singles = rows.filter(r => r.category === 'HS' || r.category === 'DS');
        const pool = singles.length > 0 ? singles : rows;
        return pool.reduce((max, r) => Math.max(max, latestRankingPoints(r)), 0);
    } catch (err) {
        console.error('Error fetching ranking points for', playerName, err);
        return 0;
    }
};

// Canonical winner resolver. Returns true/false if the match is resolvable for
// playerName, or null if it cannot be decided (tie / no data) so callers can
// exclude it rather than silently scoring it as a loss.
//
// PRIMARY source of truth: the "Winner Player 1/2" columns, which hold the
// winning player's NAME (the losing slot is the string "NaN"). These are
// explicit and unambiguous. Set-score parsing is only a fallback, and scores
// use "/" as the set separator (e.g. "20/22,21/10,21/11"), with "-" tolerated.
const determineMatchWinner = (match, playerName) => {
    const isPlayerInTeam1 = match["Team 1 Player 1"] === playerName || match["Team 1 Player 2"] === playerName;

    // 1) Name-based winner columns (authoritative).
    const w1 = match["Winner Player 1"];
    const w2 = match["Winner Player 2"];
    const hasName = (v) => v && v !== 'NaN' && v !== 'undefined';
    if (hasName(w1) || hasName(w2)) {
        // Team 1 won iff playerName's-team winner column carries a real name.
        const team1Won = hasName(w1);
        return isPlayerInTeam1 ? team1Won : !team1Won;
    }

    // 2) Fallback: parse the set scores ("/" or "-" separated).
    if (match.Result) {
        const sets = match.Result.split(',').map(set => {
            const scores = set.trim().split(/[/-]/);
            const score1 = parseInt(scores[0], 10);
            const score2 = parseInt(scores[1], 10);
            if (isNaN(score1) || isNaN(score2)) return null;
            return score1 > score2 ? 1 : 2; // 1 = team1 took the set, 2 = team2
        }).filter(result => result !== null);

        if (sets.length === 0) return null; // unparseable

        const team1Sets = sets.filter(winner => winner === 1).length;
        const team2Sets = sets.filter(winner => winner === 2).length;
        if (team1Sets === team2Sets) return null; // tie / incomplete — exclude

        const team1Won = team1Sets > team2Sets;
        return isPlayerInTeam1 ? team1Won : !team1Won;
    }

    return null; // no resolvable result
};

// Parse a Norwegian DD.MM.YYYY date string into a Date for sorting/comparison.
const parsePlayerDate = (dateString) => {
    const parts = (dateString || '').split('.');
    if (parts.length === 3) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return new Date(0);
};

// Helper function to process player data.
//   fullMatches – the player's OWN full match history (getPlayerMatches), used
//                 for class level, recent form, point differential, tournament
//                 strength — i.e. everything that describes the player alone.
//   h2hMatches  – only the mutual matches vs the opponent, used for the
//                 head-to-head term.
const processPlayerData = async (fullMatches, h2hMatches, playerName, opponentName) => {
    let headToHeadWins = 0;
    let weightedHeadToHeadWins = 0;
    let totalPointDiff = 0;
    let matchesWithPoints = 0;
    let tournamentPoints = 0;
    let recentWeightSum = 0;
    let recentWinWeight = 0;

    // Get player's ranking points from the rankings table (by name, independent
    // of the match data).
    const playerRankingPoints = await getPlayerRankingPoints(playerName);

    // --- Head-to-head term: from the mutual matches only, time-weighted. ---
    const sortedHeadToHeadMatches = [...h2hMatches].sort(
        (a, b) => parsePlayerDate(b.Date) - parsePlayerDate(a.Date)
    );

    sortedHeadToHeadMatches.forEach((match, index) => {
        const playerWon = determineMatchWinner(match, playerName);
        const timeWeight = Math.pow(0.8, index); // 20% decay per older meeting
        if (playerWon === true) {
            headToHeadWins++;
            weightedHeadToHeadWins += timeWeight;
        }
    });

    // --- Per-player form / point-diff / tournament: from full history. ---
    // Sort the player's own matches most-recent-first, then take the last 10 so
    // "recent" is actually recent regardless of DB return order.
    const sortedFull = [...fullMatches].sort(
        (a, b) => parsePlayerDate(b.Date) - parsePlayerDate(a.Date)
    );
    const recentMatches = sortedFull.slice(0, 10);

    recentMatches.forEach((match, index) => {
        const recencyWeight = 1 - (index * 0.05); // 5% decay per match older
        const isWinner = determineMatchWinner(match, playerName);

        // Recency-weighted win RATE (replaces the old reset-on-loss streak).
        if (isWinner !== null) {
            recentWeightSum += recencyWeight;
            if (isWinner) recentWinWeight += recencyWeight;
        }

        // Point differential per set (scores are "/"- or "-"-separated).
        if (match.Result) {
            match.Result.split(',').forEach(set => {
                const [score1, score2] = set.trim().split(/[/-]/).map(Number);
                if (!isNaN(score1) && !isNaN(score2)) {
                    const diff = isWinner ? score1 - score2 : score2 - score1;
                    totalPointDiff += diff * recencyWeight;
                    matchesWithPoints++;
                }
            });
        }

        // Tournament performance (higher tier = more credit).
        const tournamentClass = match["Tournament Class"];
        if (tournamentClass) {
            let points = 1;
            if (getClassLevelScore(tournamentClass) >= 11) points = 3;     // Elite (E/X)
            else if (getClassLevelScore(tournamentClass) >= 9) points = 2;  // A or above
            tournamentPoints += points * recencyWeight;
        }
    });

    // 0.5 = neutral when there is no usable recent history.
    const recentFormRate = recentWeightSum > 0 ? recentWinWeight / recentWeightSum : 0.5;

    return {
        name: playerName,
        recentFormRate,
        headToHeadWins,
        weightedHeadToHeadWins,
        avgPointDiff: matchesWithPoints > 0 ? totalPointDiff / matchesWithPoints : 0,
        tournamentPerformance: tournamentPoints,
        rankingPoints: playerRankingPoints,
        classLevel: determinePlayerClass(fullMatches, playerName)
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
                                            // Determine winner via the canonical resolver.
                                            const player1Won = determineMatchWinner(match, player1) === true;

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
                                    <div className="text-xs text-gray-500 mt-1">2025-ranking</div>
                                </div>
                                <div className="bg-[#1e2435] p-4 rounded-xl border border-pink-500/20">
                                    <div className="text-sm text-gray-400 mb-2">Spiller 2</div>
                                    <div className="text-pink-400 font-medium text-lg">
                                        {prediction.player2RankingPoints || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">2025-ranking</div>
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

const MatchPrediction = ({ player1, player2, matchesP1 = [], matchesP2 = [], h2hMatches = [] }) => {
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
        const calculatePrediction = async () => {
            try {
                // Determine class levels from each player's OWN full history.
                const player1ClassLevel = determinePlayerClass(matchesP1, player1);
                const player2ClassLevel = determinePlayerClass(matchesP2, player2);

                // Analyze class suitability
                const player1ClassAnalysis = analyzeClassSuitability(player1ClassLevel);
                const player2ClassAnalysis = analyzeClassSuitability(player2ClassLevel);

                console.log('Player levels:', {
                    player1: player1ClassLevel,
                    player2: player2ClassLevel,
                    player1Analysis: player1ClassAnalysis,
                    player2Analysis: player2ClassAnalysis
                });

                // The prediction is for SINGLES, so the head-to-head term must
                // only count singles meetings. A doubles/mixed meeting (where the
                // two were never 1-on-1) says nothing about a singles matchup and
                // must not drive the prediction.
                const isSinglesMatch = (m) =>
                    m["Match"] === "Herresingle" || m["Match"] === "Damesingle" ||
                    m["Category"] === "Herresingle" || m["Category"] === "Damesingle";
                const h2hSingles = h2hMatches.filter(isSinglesMatch);

                // Per-player stats from full history; head-to-head term from the
                // mutual SINGLES matches only.
                const p1Stats = {
                    ...await processPlayerData(matchesP1, h2hSingles, player1, player2),
                    classLevel: player1ClassLevel
                };

                const p2Stats = {
                    ...await processPlayerData(matchesP2, h2hSingles, player2, player1),
                    classLevel: player2ClassLevel
                };

                // Calculate win probability (head-to-head term uses the singles set).
                const player1WinProb = calculateWinProbability(p1Stats, p2Stats, 'Single', h2hSingles);

                const filteredHeadToHeadMatches = h2hSingles;

                setHeadToHeadMatches(filteredHeadToHeadMatches);

                const headToHeadWins = filteredHeadToHeadMatches
                    .filter(match => determineMatchWinner(match, player1) === true).length;

                const headToHeadLosses = filteredHeadToHeadMatches
                    .filter(match => determineMatchWinner(match, player1) === false).length;
                const decidedHeadToHead = headToHeadWins + headToHeadLosses;
                const headToHeadWinRate = decidedHeadToHead > 0 ? headToHeadWins / decidedHeadToHead : 0;

                // Check if we have any head-to-head matches
                const hasRecentMatches = filteredHeadToHeadMatches.length > 0;

                // Calculate point differentials over each player's full history.
                const calculatePointDiff = (playerMatches, playerName) => {
                    let totalDiff = 0;
                    let totalSets = 0;

                    playerMatches.forEach(match => {
                        if (match.Result) {
                            const sets = match.Result.split(',');
                            sets.forEach(set => {
                                const [score1, score2] = set.trim().split(/[/-]/).map(Number);
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

                const player1AvgPointDiff = calculatePointDiff(matchesP1, player1);
                const player2AvgPointDiff = calculatePointDiff(matchesP2, player2);

                // Calculate tournament performance scores over full history.
                const calculateTournamentScore = (playerMatches, playerName) => {
                    let totalScore = 0;
                    let totalMatches = 0;

                    playerMatches.forEach(match => {
                        const isWinner = determineMatchWinner(match, playerName) === true;
                        const tournamentClass = match["Tournament Class"];
                        if (tournamentClass) {
                            const classScore = getClassLevelScore(tournamentClass);
                            totalScore += isWinner ? classScore : 0;
                            totalMatches++;
                        }
                    });

                    return totalMatches > 0 ? totalScore / totalMatches : 0;
                };

                const player1TournamentScore = calculateTournamentScore(matchesP1, player1);
                const player2TournamentScore = calculateTournamentScore(matchesP2, player2);
                
                // Generate reasoning text
                const getClassText = (level) => {
                    const classMap = {
                        11: 'Elite (SEN E)',
                        9: 'SEN A',
                        7: 'SEN B',
                        5: 'SEN C',
                        3: 'SEN D',
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

                // Count recent matches over each player's full history.
                const recentMatchesCount = (playerMatches) => {
                    return playerMatches.filter(m => {
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
                        player1: recentMatchesCount(matchesP1),
                        player2: recentMatchesCount(matchesP2)
                    }
                };

                console.log('Reasoning:', reasoningText);

                // Get ranking points (looked up by name from the rankings table)
                const player1RankingPoints = await getPlayerRankingPoints(player1);
                const player2RankingPoints = await getPlayerRankingPoints(player2);
                
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
        };

        calculatePrediction();
    }, [player1, player2, matchesP1, matchesP2, h2hMatches]);

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