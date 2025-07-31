import React, { useState, useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faTrophy, faMedal, faArrowUp, faArrowDown, faFilter, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { getRankingsByCategory } from '../services/databaseService';

const RankingHistoryGraph = ({ playerName }) => {
  const [selectedCategory, setSelectedCategory] = useState('HS');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const categories = ['HS', 'DS', 'HD', 'DD', 'MIX'];
        const categoryNames = {
          'HS': 'Herresingle',
          'DS': 'Damesingle', 
          'HD': 'Herredouble',
          'DD': 'Damedouble',
          'MIX': 'Mixed Double'
        };

        const data = {};
        for (const category of categories) {
          data[category] = {
            data: await getRankingsByCategory(category),
            name: categoryNames[category]
          };
        }
        setCategoryData(data);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  // Memoize current data and player data
  const currentData = useMemo(() => categoryData[selectedCategory]?.data || [], [selectedCategory, categoryData]);
  const playerData = useMemo(() => currentData.find(player => player.Navn === playerName), [currentData, playerName]);

  // Memoize years and ranking calculations
  const { validYears, rankData, bestRank, worstRank, bestYear, worstYear, currentRank, previousRank, rankChange } = useMemo(() => {
    if (!playerData) {
      return {
        validYears: [],
        rankData: [],
        bestRank: 0,
        worstRank: 0,
        bestYear: '',
        worstYear: '',
        currentRank: 0,
        previousRank: 0,
        rankChange: 0
      };
    }

    // Get all years and create a map of year -> player points
    const yearPointsMap = new Map();
    const years = Object.keys(playerData)
      .filter(key => /^\d{4}$/.test(key))
      .sort((a, b) => parseInt(a) - parseInt(b));

    // Pre-calculate all valid years and their points
    years.forEach(year => {
      const points = parseFloat(playerData[year]);
      if (points > 0) {
        yearPointsMap.set(year, points);
      }
    });

    // Calculate rankings for all years in a single pass
    const rankings = new Map();
    const validYears = [];
    const rankData = [];

    // Sort players by points for each year only once
    years.forEach(year => {
      if (!yearPointsMap.has(year)) return;

      // Get all players with points for this year
      const playersWithPoints = currentData
        .filter(p => parseFloat(p[year] || 0) > 0)
        .map(p => ({
          name: p.Navn,
          points: parseFloat(p[year])
        }))
        .sort((a, b) => b.points - a.points);

      // Find player's rank
      const playerIndex = playersWithPoints.findIndex(p => p.name === playerName);
      if (playerIndex !== -1) {
        validYears.push(year);
        rankData.push(playerIndex + 1);
      }
    });

    // Calculate stats from the collected data
    const bestRank = Math.min(...rankData);
    const worstRank = Math.max(...rankData);
    const bestYearIndex = rankData.indexOf(bestRank);
    const worstYearIndex = rankData.indexOf(worstRank);
    const bestYear = validYears[bestYearIndex];
    const worstYear = validYears[worstYearIndex];

    const currentYearIndex = validYears.length - 1;
    const previousYearIndex = validYears.length - 2;
    const currentRank = currentYearIndex >= 0 ? rankData[currentYearIndex] : 0;
    const previousRank = previousYearIndex >= 0 ? rankData[previousYearIndex] : currentRank;
    const rankChange = previousRank - currentRank;

    return {
      validYears,
      rankData,
      bestRank,
      worstRank,
      bestYear,
      worstYear,
      currentRank,
      previousRank,
      rankChange
    };
  }, [playerData, currentData, playerName]);

  // Memoize chart data
  const chartData = useMemo(() => ({
    labels: validYears,
    datasets: [{
      label: 'Rank',
      data: rankData,
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#4f46e5',
      tension: 0.3,
      pointBackgroundColor: '#4f46e5',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
    }],
  }), [validYears, rankData]);

  // Chart options can be memoized as they rarely change
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        reverse: true,
        min: 1,
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#e5e7eb',
          font: {
            weight: 'bold',
          },
          callback: function(value) {
            return value + '.';
          }
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#e5e7eb',
          font: {
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4f46e5',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Rank: ${context.raw}.`;
          },
          title: function(context) {
            return `År ${context[0].label}`;
          }
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  }), []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 mt-4 sm:mt-8"
      >
        <div className="text-center py-6 sm:py-8 text-gray-300 text-sm sm:text-base">
          Laster rankingdata...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 mt-4 sm:mt-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center mb-3 sm:mb-4 md:mb-0">
          <FontAwesomeIcon icon={faChartLine} className="text-xl sm:text-2xl text-indigo-500 mr-2 sm:mr-3" />
          <h3 className="text-lg sm:text-xl font-medium text-white">Rankinghistorikk</h3>
        </div>

        {/* Mobile Filter Dropdown */}
        <div className="relative md:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white/10 rounded-lg text-gray-200 hover:bg-white/20 transition-all"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2 text-sm" />
              <span className="text-sm">{categoryData[selectedCategory]?.name || 'Laster...'}</span>
            </div>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
            />
          </button>
          
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1"
            >
              {Object.entries(categoryData).map(([code, { name }]) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedCategory(code);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    selectedCategory === code
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  {name}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Desktop Category Buttons */}
        <div className="hidden md:flex flex-wrap gap-2">
          {Object.entries(categoryData).map(([code, { name }]) => (
            <button
              key={code}
              onClick={() => setSelectedCategory(code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                selectedCategory === code
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {!playerData ? (
        <div className="text-center py-6 sm:py-8 text-gray-300 text-sm sm:text-base">
          Ingen rankingdata tilgjengelig for {playerName} i {categoryData[selectedCategory]?.name || 'valgt kategori'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-200 text-xs sm:text-sm">Beste rank</span>
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-sm sm:text-base" />
              </div>
              <div className="mt-1.5 sm:mt-2">
                <span className="text-xl sm:text-2xl font-bold text-white">{bestRank}.</span>
                <span className="text-gray-300 ml-2 text-sm">i {bestYear}</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-200 text-xs sm:text-sm">Nåværende rank</span>
                <FontAwesomeIcon icon={faMedal} className="text-indigo-400 text-sm sm:text-base" />
              </div>
              <div className="mt-1.5 sm:mt-2">
                <span className="text-xl sm:text-2xl font-bold text-white">{currentRank}.</span>
                <span className={`ml-2 text-xs sm:text-sm ${rankChange > 0 ? 'text-green-400' : rankChange < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {rankChange > 0 ? `+${rankChange}` : rankChange < 0 ? rankChange : 'Stabil'}
                </span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-200 text-xs sm:text-sm">Dårligste rank</span>
                <FontAwesomeIcon icon={faArrowDown} className="text-red-400 text-sm sm:text-base" />
              </div>
              <div className="mt-1.5 sm:mt-2">
                <span className="text-xl sm:text-2xl font-bold text-white">{worstRank}.</span>
                <span className="text-gray-300 ml-2 text-sm">i {worstYear}</span>
              </div>
            </div>
          </div>

          <div className="h-48 sm:h-56 md:h-64">
            <Line data={chartData} options={options} />
          </div>
        </>
      )}
    </motion.div>
  );
};

export default RankingHistoryGraph; 