import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaTrophy, 
  FaMedal, 
  FaCalendarAlt, 
  FaUsers, 
  FaTable, 
  FaThLarge, 
  FaSort, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaInbox,
  FaUserCircle
} from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import AdSlot from './AdSlot'; // Import AdSlot
import { getPlayerMatches } from '../services/databaseService';

const convertDateString = (dateString) => {
    const parts = dateString.split('.');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const formatSets = (result) => {
    if (!result) return [];
    return result.split(',').map(set => {
        const [score1, score2] = set.includes('/') 
            ? set.split('/').map(Number)
            : set.split('-').map(Number);
        return { playerScore: score1, opponentScore: score2 };
    });
};

// PlayerLink component for consistent player link styling
const PlayerLink = ({ playerName, currentPlayer }) => {
    const navigate = useNavigate();
    
    if (!playerName) return null;
    
    const handlePlayerClick = (e) => {
        e.preventDefault();
        navigate(`/player/${encodeURIComponent(playerName)}`);
    };
    
    // Don't make current player clickable
    if (playerName === currentPlayer) {
        return (
            <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold tracking-wide">
                <FaUserCircle />
                {playerName}
            </span>
        );
    }
    
    return (
        <a 
            href={`/player/${encodeURIComponent(playerName)}`}
            onClick={handlePlayerClick}
            className="inline-flex items-center gap-1 text-white font-semibold tracking-wide hover:text-indigo-400 transition-colors duration-200"
        >
            <FaUserCircle className="text-indigo-400" />
            {playerName}
        </a>
    );
};

function PlayerRecentMatches({ playerName }) {
    const [allMatches, setAllMatches] = useState([]);
    const [seasonOptions, setSeasonOptions] = useState(['Alle sesonger']);
    const [classOptions, setClassOptions] = useState(['Alle klasser']);
    const [matchOptions, setMatchOptions] = useState(['Alle kategorier']);
    const [seasonFilter, setSeasonFilter] = useState('Alle sesonger');
    const [outcomeFilter, setOutcomeFilter] = useState('Alle');
    const [tournamentClassFilter, setTournamentClassFilter] = useState('Alle klasser');
    const [matchFilter, setMatchFilter] = useState('Alle kategorier');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [viewMode, setViewMode] = useState('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const matchesPerPage = 12; // Reduced from previous value for better mobile performance
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const matchesRef = useRef(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState(0);

    // Add resize listener for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset filters and pagination when player changes
    useEffect(() => {
        setSeasonFilter('Alle sesonger');
        setOutcomeFilter('Alle');
        setTournamentClassFilter('Alle klasser');
        setMatchFilter('Alle kategorier');
        setSearchTerm('');
        setCurrentPage(1);
        setIsLoading(true);
    }, [playerName]);

    // Optimize match loading with chunking
    useEffect(() => {
        async function fetchMatches() {
            try {
                setIsLoading(true);
                const playerMatches = await getPlayerMatches(playerName);
                setAllMatches(playerMatches);
            } catch (error) {
                console.error("Error fetching the matches:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMatches();
    }, [playerName]);

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
    
        // Filter out NaN values and check if it's a single game
        opponents = opponents.filter(opponent => opponent !== "NaN");
        const isSingleGame = teamPartner === "NaN" || !teamPartner;
    
        return {
            teamPartner: isSingleGame ? null : teamPartner,
            opponents: opponents.join(' & '),
            isSingleGame
        };
    };

    // Optimize filtering and sorting with pagination
    const filteredAndSortedMatches = useMemo(() => {
        let matches = allMatches
            .filter(match => {
                const seasonMatch = seasonFilter === 'Alle sesonger' || match["Season"] === seasonFilter;
                const classMatch = tournamentClassFilter === 'Alle klasser' || match["Tournament Class"] === tournamentClassFilter;
                const matchTypeMatch = matchFilter === 'Alle kategorier' || match["Match"] === matchFilter;
                const searchMatch = !searchTerm || 
                    match["Tournament Name"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    match["Match"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    match["Tournament Class"]?.toLowerCase().includes(searchTerm.toLowerCase());
                
                return seasonMatch && classMatch && matchTypeMatch && searchMatch;
            })
            .map(match => {
                const isWin = match["Winner Player 1"] === playerName || match["Winner Player 2"] === playerName;
                const { teamPartner, opponents, isSingleGame } = findTeamAndOpponents(match);
                const scoreDiff = getScoreDifference(match);
                
                return {
                    ...match,
                    isWin,
                    teamPartner,
                    opponents: opponents || '',
                    isSingleGame,
                    scoreDifference: isWin ? scoreDiff : -scoreDiff,
                    formattedDate: format(parseISO(convertDateString(match.Date)), 'dd. MMMM yyyy', { locale: nb })
                };
            });

        // Apply sorting
        if (sortOrder) {
            matches.sort((a, b) => {
                switch (sortOrder) {
                    case 'biggest-wins':
                        return b.scoreDifference - a.scoreDifference;
                    case 'biggest-losses':
                        return a.scoreDifference - b.scoreDifference;
                    case 'date-desc':
                        const datePartsA = a.Date.split('.');
                        const datePartsB = b.Date.split('.');
                        const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
                        const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
                        return dateB - dateA;
                    case 'date-asc':
                        const datePartsAscA = a.Date.split('.');
                        const datePartsAscB = b.Date.split('.');
                        const dateAscA = new Date(datePartsAscA[2], datePartsAscA[1] - 1, datePartsAscA[0]);
                        const dateAscB = new Date(datePartsAscB[2], datePartsAscB[1] - 1, datePartsAscB[0]);
                        return dateAscA - dateAscB;
                    default:
                        return 0;
                }
            });
        }

        return matches;
    }, [allMatches, seasonFilter, tournamentClassFilter, matchFilter, searchTerm, sortOrder, playerName]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredAndSortedMatches.length / matchesPerPage);
    const paginatedMatches = filteredAndSortedMatches.slice(
        (currentPage - 1) * matchesPerPage,
        currentPage * matchesPerPage
    );

    // Count total wins and losses from all filtered matches
    const totalWins = filteredAndSortedMatches.filter(match => match.isWin).length;
    const totalLosses = filteredAndSortedMatches.filter(match => !match.isWin).length;
    const winRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;

    // Calculate active filters
    useEffect(() => {
        let count = 0;
        if (seasonFilter !== 'Alle sesonger') count++;
        if (outcomeFilter !== 'Alle') count++;
        if (tournamentClassFilter !== 'Alle klasser') count++;
        if (matchFilter !== 'Alle kategorier') count++;
        setActiveFilters(count);
    }, [seasonFilter, outcomeFilter, tournamentClassFilter, matchFilter]);

    // Reset all filters
    const resetFilters = () => {
        setSeasonFilter('Alle sesonger');
        setOutcomeFilter('Alle');
        setTournamentClassFilter('Alle klasser');
        setMatchFilter('Alle kategorier');
        setIsFilterOpen(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Smooth scroll to matches section
        matchesRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-300">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Laster kamper...</p>
            </div>
        );
    }

    // Empty state
    if (paginatedMatches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-300">
                <FaInbox size={48} className="mb-4 text-gray-400" />
                <p>Ingen kamper funnet med de valgte filtrene</p>
                <button 
                    className="mt-4 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                        setSeasonFilter('Alle sesonger');
                        setOutcomeFilter('Alle');
                        setTournamentClassFilter('Alle klasser');
                        setMatchFilter('Alle kategorier');
                        setSearchTerm('');
                    }}
                >
                    Tilbakestill filtre
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search bar */}
            <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="Søk etter turnering, kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                    />
                    <FaSearch className="absolute left-4 top-4 text-gray-400" />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between transform hover:scale-105 transition-all duration-300">
                    <div>
                        <p className="text-gray-400 text-sm">Totale seiere</p>
                        <p className="text-2xl font-bold text-white">{totalWins}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <FaTrophy className="text-green-400" />
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between transform hover:scale-105 transition-all duration-300">
                    <div>
                        <p className="text-gray-400 text-sm">Totale tap</p>
                        <p className="text-2xl font-bold text-white">{totalLosses}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <FaMedal className="text-red-400" />
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center justify-between transform hover:scale-105 transition-all duration-300">
                    <div>
                        <p className="text-gray-400 text-sm">Vinnprosent</p>
                        <p className="text-2xl font-bold text-white">{winRate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <FaChartLine className="text-indigo-400" />
                    </div>
                </div>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden mb-8">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white"
                >
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="text-indigo-400" />
                        <span>Filtrer kamper</span>
                        {activeFilters > 0 && (
                            <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                                {activeFilters}
                            </span>
                        )}
                    </div>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`transform transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {isFilterOpen && (
                    <div className="mt-2 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white font-medium">Filtrer</h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                    Nullstill
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">Sesong</label>
                                    <select 
                                        value={seasonFilter} 
                                        onChange={(e) => setSeasonFilter(e.target.value)}
                                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                                    >
                                        {seasonOptions.map(season => (
                                            <option key={season} value={season} className="bg-gray-800">{season}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">Utfall</label>
                                    <select 
                                        value={outcomeFilter} 
                                        onChange={(e) => setOutcomeFilter(e.target.value)}
                                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                                    >
                                        <option value="Alle" className="bg-gray-800">Alle</option>
                                        <option value="Vunnet" className="bg-gray-800">Vunnet</option>
                                        <option value="Tapt" className="bg-gray-800">Tapt</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">Klasse</label>
                                    <select 
                                        value={tournamentClassFilter} 
                                        onChange={(e) => setTournamentClassFilter(e.target.value)}
                                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                                    >
                                        {classOptions.map(option => (
                                            <option key={option} value={option} className="bg-gray-800">{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">Kategori</label>
                                    <select 
                                        value={matchFilter} 
                                        onChange={(e) => setMatchFilter(e.target.value)}
                                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                                    >
                                        {matchOptions.map(option => (
                                            <option key={option} value={option} className="bg-gray-800">{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Sesong</label>
                    <select 
                        value={seasonFilter} 
                        onChange={(e) => setSeasonFilter(e.target.value)}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                    >
                        {seasonOptions.map(season => (
                            <option key={season} value={season} className="bg-gray-800">{season}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Utfall</label>
                    <select 
                        value={outcomeFilter} 
                        onChange={(e) => setOutcomeFilter(e.target.value)}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                    >
                        <option value="Alle" className="bg-gray-800">Alle</option>
                        <option value="Vunnet" className="bg-gray-800">Vunnet</option>
                        <option value="Tapt" className="bg-gray-800">Tapt</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Klasse</label>
                    <select 
                        value={tournamentClassFilter} 
                        onChange={(e) => setTournamentClassFilter(e.target.value)}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                    >
                        {classOptions.map(option => (
                            <option key={option} value={option} className="bg-gray-800">{option}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-300 mb-2">Kategori</label>
                    <select 
                        value={matchFilter} 
                        onChange={(e) => setMatchFilter(e.target.value)}
                        className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-300"
                    >
                        {matchOptions.map(option => (
                            <option key={option} value={option} className="bg-gray-800">{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* View Toggle and Sort Options */}
            <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                            viewMode === 'cards' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        <FaThLarge className="text-sm" />
                        Kort
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                            viewMode === 'table' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        <FaTable className="text-sm" />
                        Tabell
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setSortOrder('date-desc')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                            sortOrder === 'date-desc'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        <FaSortAmountDown className="text-sm" />
                        Nyeste
                    </button>
                    <button
                        onClick={() => setSortOrder('biggest-wins')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                            sortOrder === 'biggest-wins'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        <FaTrophy className="text-sm" />
                        Største seiere
                    </button>
                </div>
            </div>

            {/* Matches Display */}
            <div ref={matchesRef}>
                <AnimatePresence>
                    {viewMode === 'cards' ? (
                        <>
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                layout="position"
                                transition={{ duration: 0.2 }}
                            >
                                {paginatedMatches.map((match, index) => (
                                    <React.Fragment key={`${match.Date}-${match["Tournament Name"]}-${index}-frag`}>
                                        <motion.div
                                            key={`${match.Date}-${match["Tournament Name"]}-${index}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ 
                                                duration: 0.2,
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 25
                                            }}
                                            className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 transform transition-all duration-300 ${
                                                match.isWin ? 'hover:border-green-500/50' : 'hover:border-red-500/50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-1">{match["Tournament Name"]}</h3>
                                                    <p className="text-sm text-gray-400">{match.formattedDate}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    match.isWin 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {match.isWin ? 'Seier' : 'Tap'}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {!match.isSingleGame && match.teamPartner && (
                                                    <div className="flex items-center text-gray-300">
                                                        <FaUsers className="mr-2 text-gray-400" />
                                                        <span className="text-sm font-medium">
                                                            Med <PlayerLink playerName={match.teamPartner} currentPlayer={playerName} />
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center text-gray-300">
                                                    <FaUsers className="mr-2 text-gray-400" />
                                                    <span className="text-sm font-medium">
                                                        Mot {match.opponents && match.opponents.split(' & ').map((opponent, idx, array) => (
                                                            <React.Fragment key={opponent}>
                                                                <PlayerLink playerName={opponent} currentPlayer={playerName} />
                                                                {idx < array.length - 1 && ' & '}
                                                            </React.Fragment>
                                                        ))}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-300">
                                                    <FaTrophy className="mr-2 text-gray-400" />
                                                    <span className="text-sm">{match["Tournament Class"]}</span>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <div className="flex justify-center space-x-4">
                                                        {formatSets(match.Result).map((set, idx) => (
                                                            <div 
                                                                key={idx}
                                                                className={`px-4 py-2 rounded-lg font-mono text-base font-bold tracking-wider ${
                                                                    match.isWin
                                                                        ? (set.playerScore > set.opponentScore ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')
                                                                        : (set.playerScore > set.opponentScore ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400')
                                                                }`}
                                                            >
                                                                {set.playerScore}-{set.opponentScore}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </React.Fragment>
                                ))}
                            </motion.div> 

                            {/* Ad Slot below the card grid */}
                            <motion.div 
                                key="ad-slot-below-cards"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }} 
                                style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}
                            >
                                <AdSlot 
                                    adSlot="7152830155" 
                                    adClient="ca-pub-6338038731129939"
                                />
                            </motion.div>
                        </>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dato</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Turnering</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Klasse</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Motstander</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Resultat</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {paginatedMatches.map((match, index) => (
                                            <tr 
                                                key={`${match.Date}-${match["Tournament Name"]}-${index}`}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {match.formattedDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                    {match["Tournament Name"]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {match["Tournament Class"]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm">
                                                        {match.opponents && match.opponents.split(' & ').map((opponent, index, array) => (
                                                            <React.Fragment key={opponent}>
                                                                <PlayerLink playerName={opponent} currentPlayer={playerName} />
                                                                {index < array.length - 1 && ' & '}
                                                            </React.Fragment>
                                                        ))}
                                                    </span>
                                                    {!match.isSingleGame && match.teamPartner && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Med <PlayerLink playerName={match.teamPartner} currentPlayer={playerName} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {formatSets(match.Result).map((set, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className={`inline-block px-3 py-1.5 rounded mr-2 font-mono text-base font-bold tracking-wider ${
                                                                match.isWin
                                                                    ? (set.playerScore > set.opponentScore ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')
                                                                    : (set.playerScore < set.opponentScore ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400')
                                                            }`}
                                                        >
                                                            {set.playerScore}-{set.opponentScore}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        match.isWin 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {match.isWin ? 'Seier' : 'Tap'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Forrige
                    </button>
                    <span className="text-white px-4">
                        Side {currentPage} av {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Neste
                    </button>
                </div>
            )}
        </div>
    );
}

export default PlayerRecentMatches;