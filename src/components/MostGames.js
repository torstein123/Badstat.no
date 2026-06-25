import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRankingsByCategory, getTopPlayersByMatches } from '../services/databaseService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faAward, faChartLine, faStar } from '@fortawesome/free-solid-svg-icons';

const CURRENT_SEASON = '2025/2026';

const Leaderboard = () => {
    const [category, setCategory] = useState('Sammenlagt');
    const [topPlayers, setTopPlayers] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const categoryMap = {
            'Sammenlagt': 'HS',
            'Herresingle': 'HS',
            'Herredouble': 'HD',
            'Damesingle': 'DS',
            'Damedouble': 'DD',
            'Mixed Double': 'MIX'
        };

        const fetchData = async () => {
            try {
                setLoading(true);
                const [topPlayersData, rankingsData] = await Promise.all([
                    getTopPlayersByMatches(CURRENT_SEASON, category, 10),
                    getRankingsByCategory(categoryMap[category])
                ]);

                setTopPlayers(topPlayersData);
                setRankings(rankingsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [category]);

    const categories = [
        { value: 'Sammenlagt', label: 'Sammenlagt', icon: faChartLine },
        { value: 'Herresingle', label: 'Herresingle', icon: faChartLine },
        { value: 'Herredouble', label: 'Herredouble', icon: faChartLine },
        { value: 'Damesingle', label: 'Damesingle', icon: faChartLine },
        { value: 'Damedouble', label: 'Damedouble', icon: faChartLine },
        { value: 'Mixed Double', label: 'Mixed Double', icon: faChartLine }
    ];

    const calculateRankingPoints = (rankings) => {
        const rankingPoints = {};
        
        // Safety check to ensure rankings is an array
        if (Array.isArray(rankings)) {
            rankings.forEach(player => {
                const playerName = player.Navn;
                const totalPoints = parseFloat(player['2025'] || 0);
                rankingPoints[playerName] = totalPoints;
            });
        }

        return rankingPoints;
    };

    const navigateToPlayerProfile = (playerName) => {
        navigate(`/player/${encodeURIComponent(playerName)}`);
    };

    const sortedPlayers = topPlayers.map(({ player, match_count }) => [player, Number(match_count)]);

    const rankingPoints = calculateRankingPoints(rankings);
    const sortedPlayersByRankingPoints = Object.entries(rankingPoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const getMedalIcon = (index) => {
        switch(index) {
            case 0: return <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />;
            case 1: return <FontAwesomeIcon icon={faMedal} className="text-gray-400" />;
            case 2: return <FontAwesomeIcon icon={faAward} className="text-amber-700" />;
            default: return <FontAwesomeIcon icon={faStar} className="text-blue-400" />;
        }
    };

    const getProgressWidth = (value, maxValue) => {
        return `${(value / maxValue) * 100}%`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-gray-400">Laster topplister...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Topplisten 🏆
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Utforsk de beste spillerne i norsk badminton basert på kamper og rankingpoeng
                    </p>
                </div>

                {/* Category Selection */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                                category === cat.value
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            <FontAwesomeIcon icon={cat.icon} className="mr-2" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Most Games Section */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <FontAwesomeIcon icon={faChartLine} className="mr-3 text-blue-400" />
                            Flest Kamper (2025/2026 sesong)
                        </h3>
                        <div className="space-y-4">
                            {sortedPlayers.map(([player, count], index) => (
                                <div
                                    key={player}
                                    className="relative bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                                    onClick={() => navigateToPlayerProfile(player)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{getMedalIcon(index)}</span>
                                            <span className="text-white font-medium">{player}</span>
                                        </div>
                                        <span className="text-blue-400 font-bold">{count}</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: getProgressWidth(count, sortedPlayers[0][1]) }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ranking Points Section */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <FontAwesomeIcon icon={faChartLine} className="mr-3 text-pink-400" />
                            Rankingpoeng (2025)
                        </h3>
                        <div className="space-y-4">
                            {sortedPlayersByRankingPoints.map(([player, points], index) => (
                                <div
                                    key={player}
                                    className="relative bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                                    onClick={() => navigateToPlayerProfile(player)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{getMedalIcon(index)}</span>
                                            <span className="text-white font-medium">{player}</span>
                                        </div>
                                        <span className="text-pink-400 font-bold">{points.toFixed(1)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-pink-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: getProgressWidth(points, sortedPlayersByRankingPoints[0][1]) }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
