// PlayerDetail.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { 
  faTrophy, 
  faMedal, 
  faArrowUp, 
  faArrowDown, 
  faEquals, 
  faChartLine, 
  faTable, 
  faHistory, 
  faStar,
  faAward,
  faUserFriends,
  faHome,
  faTableTennis,
  faSearch,
  faSpinner,
  faBrain,
  faCalendarAlt,
  faArrowRight,
  faHeart
} from '@fortawesome/free-solid-svg-icons';

// ----- Chart.js-related imports -----
import 'chart.js/auto';             // <--- auto build that registers all core components
import { Chart } from 'chart.js';   // used only if you need to manually register plugins
import ChartDataLabels from 'chartjs-plugin-datalabels';

import PlayerRecentMatches from './components/PlayerRecentMatches';
import RankingsDisplay from './components/RankingDisplay';
import AchievementsDisplay from './components/achievementsDisplay';
import ClassBadge from './components/ClassBadge';
import SEO from './components/SEO';
import RankingHistoryGraph from './components/RankingHistoryGraph';
import ShuttlecockIcon from './components/ShuttlecockIcon';
import processPlayerData from './utils/processPlayerData';
import AdSlot from './components/AdSlot'; // Import AdSlot
import { getPlayerAllRankings, getPlayerMatches, getRankingsByCategory } from './services/databaseService';

// ----- Local data imports -----
import clubLogos from './clubLogos.js';      
import playerImages from './playerImages.js'; 
import achievementsConfig from './config/achievementsConfig';

// Register the datalabels plugin (Chart.js v4+ requires manual plugin registration)
Chart.register(ChartDataLabels);

// Add these CSS keyframes at the top of the file, after the imports
const pulseAnimation = `
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
`;

const shimmerAnimation = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

const rainbowTextAnimation = `
@keyframes rainbow-text {
  0% { color: #ff0000; }
  20% { color: #ffa500; }
  40% { color: #ffff00; }
  60% { color: #00ff00; }
  80% { color: #0000ff; }
  100% { color: #ff0000; }
}
`;

const bounceAnimation = `
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
`;

// Add the styles to the document
const style = document.createElement('style');
style.textContent = `
  ${pulseAnimation}
  ${shimmerAnimation}
  ${rainbowTextAnimation}
  ${bounceAnimation}

  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  .animate-rainbow-text {
    animation: rainbow-text 5s linear infinite;
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }

  .class-badge {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .class-badge.elite {
    background: linear-gradient(145deg, #4a1c40, #7c2855);
    border: 2px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  }

  .class-badge.elite::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.2), transparent);
    animation: shimmer 2s infinite;
  }

  .class-badge.a {
    background: linear-gradient(145deg, #1a365d, #2c5282);
    border: 2px solid rgba(66, 153, 225, 0.5);
    box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
  }

  .class-badge.b {
    background: linear-gradient(145deg, #2d3748, #4a5568);
    border: 2px solid rgba(160, 174, 192, 0.5);
    box-shadow: 0 4px 10px rgba(160, 174, 192, 0.3);
  }

  .class-badge.c {
    background: linear-gradient(145deg, #1a202c, #2d3748);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .class-badge.d {
    background: linear-gradient(145deg, #1a202c, #2d3748);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

document.head.appendChild(style);

// Move these calculations outside the component
const calculateRankInfo = (rank, totalPlayers) => {
  const percentile = ((rank / totalPlayers) * 100).toFixed(1);
  const topPercentile = percentile;
  
  let color, bgColor;
  if (topPercentile <= 2) {
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/20';
  } else if (topPercentile <= 5) {
    color = 'text-green-400';
    bgColor = 'bg-green-500/20';
  } else if (topPercentile <= 10) {
    color = 'text-blue-400';
    bgColor = 'bg-blue-500/20';
  } else if (topPercentile <= 20) {
    color = 'text-yellow-400';
    bgColor = 'bg-yellow-500/20';
  } else {
    color = 'text-indigo-400';
    bgColor = 'bg-indigo-500/20';
  }

  return {
    color,
    bgColor,
    message: `Topp ${topPercentile}% i Norge`,
    icon: faChartLine,
    percentile: 100 - topPercentile
  };
};

const calculatePointsInfo = (currentPoints, previousPoints) => {
  const change = currentPoints - previousPoints;
  const percentChange = previousPoints ? ((change / previousPoints) * 100).toFixed(1) : 0;
  
  let message, color, bgColor;
  if (change > 50) {
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/20';
    message = `+${percentChange}% fra i fjor`;
  } else if (change > 20) {
    color = 'text-green-400';
    bgColor = 'bg-green-500/20';
    message = `+${percentChange}% fra i fjor`;
  } else if (change > 0) {
    color = 'text-blue-400';
    bgColor = 'bg-blue-500/20';
    message = `+${percentChange}% fra i fjor`;
  } else if (change === 0) {
    color = 'text-gray-400';
    bgColor = 'bg-gray-500/20';
    message = 'Uendret fra i fjor';
  } else {
    color = 'text-yellow-400';
    bgColor = 'bg-yellow-500/20';
    message = `${percentChange}% fra i fjor`;
  }

  return {
    color,
    bgColor,
    message,
    icon: faStar,
    previousPoints
  };
};

const calculateWinRateInfo = (winRate) => {
  if (winRate >= 70) {
    return {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      message: 'Sinnsyk i 3.sett',
      icon: faBrain
    };
  } else if (winRate >= 60) {
    return {
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      message: 'Sterk i 3.sett',
      icon: faBrain
    };
  } else if (winRate >= 50) {
    return {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      message: 'God i 3.sett',
      icon: faBrain
    };
  } else if (winRate >= 40) {
    return {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      message: 'Gjennomsnittlig i 3.sett',
      icon: faBrain
    };
  } else {
    return {
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      message: 'Svak i 3.sett',
      icon: faBrain
    };
  }
};

// Add back the getPlayerClass function
const getPlayerClass = (matches) => {
  if (!matches || matches.length === 0) {
    return { class: 'D', color: 'text-blue-400' };
  }

  // Sort matches by date (most recent first)
  const sortedMatches = [...matches].sort((a, b) => {
    const datePartsA = a.Date.split('.');
    const datePartsB = b.Date.split('.');
    const dateA = new Date(datePartsA[2], datePartsA[1] - 1, datePartsA[0]);
    const dateB = new Date(datePartsB[2], datePartsB[1] - 1, datePartsB[0]);
    return dateB - dateA;
  });

  // Get the last 10 matches or all matches if less than 10
  const recentMatches = sortedMatches.slice(0, 10);
  
  // Helper function to get class level score (higher is better)
  const getClassLevelScore = (className) => {
    if (!className) return 0;
    const classMap = {
      'Elite': 7,
      'X': 7,     // Elite level
      'E': 7,     // Elite level
      'SEN E': 7, // Elite level
      'SEN A': 5,
      'A': 5,
      'SEN B': 4,
      'B': 4,
      'SEN C': 3,
      'C': 3,
      'SEN D': 2,
      'D': 2,
      'SEN F': 1,
      'F': 1
    };
    
    // First check for exact matches
    for (const [key, value] of Object.entries(classMap)) {
      if (className === key) return value;
    }
    
    // Then check for partial matches, but be careful with overlapping names
    for (const [key, value] of Object.entries(classMap)) {
      // Special case for SEN E to ensure it matches as Elite
      if (className === 'SEN E') return 7;
      if (className.includes(key)) return value;
    }
    
    return 0;
  };

  // Calculate weighted average (more recent matches count more)
  let totalWeight = 0;
  let weightedSum = 0;
  let classesPlayed = new Set();
  
  recentMatches.forEach((match, index) => {
    const weight = recentMatches.length - index; // More recent matches have higher weight
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

  // Determine final class based on average
  let finalClass;
  let color;
  if (averageClassValue >= 6) {
    finalClass = 'Elite';
    color = 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-pink-500 hover:via-purple-600 hover:to-pink-500 transition-all duration-1000 text-transparent bg-clip-text';
  } else if (averageClassValue >= 4.5) {
    finalClass = 'A';
    color = 'bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text';
  } else if (averageClassValue >= 3.5) {
    finalClass = 'B';
    color = 'bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text';
  } else if (averageClassValue >= 2.5) {
    finalClass = 'C';
    color = 'bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text';
  } else if (averageClassValue >= 1.5) {
    finalClass = 'D';
    color = 'bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text';
  } else {
    finalClass = 'F';
    color = 'text-gray-400';
  }

  return { class: finalClass, color };
};

const PlayerDetail = () => {
  const { name } = useParams();
  const playerName = decodeURIComponent(name);
  const [category, setCategory] = useState('sammenlagt');
  const [activeTab, setActiveTab] = useState('rankings');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [recentMatches, setRecentMatches] = useState([]);

  // Add state for ranking data
  const [dataHS, setDataHS] = useState([]);
  const [dataDS, setDataDS] = useState([]);
  const [dataHD, setDataHD] = useState([]);
  const [dataDD, setDataDD] = useState([]);
  const [dataMIX, setDataMIX] = useState([]);
  
  // Add state for third set stats
  const [thirdSetStats, setThirdSetStats] = useState({
    winRate: '0.0',
    matches: 0,
    wins: 0
  });

  // Define years at the top
  const previousYear = '2023';
  const currentYear = '2024';

  // Consolidate data processing into a single useMemo
  const {
    categoryData,
    playerData,
    currentRankInCategory,
    currentPointsInCategory,
    previousPointsInCategory,
    totalActivePlayers,
    rankData,
    validYears,
    bestRank,
    worstRank,
    bestYear,
    worstYear,
    currentRank,
    previousRank,
    rankChange,
    pointsChange,
    playerClass,
    seoDescription
  } = useMemo(() => {
    // Get points for both singles categories
    const mensSinglesPoints = dataHS.find(player => player.Navn === playerName)?.[currentYear] || 0;
    const womensSinglesPoints = dataDS.find(player => player.Navn === playerName)?.[currentYear] || 0;

    // Get points for both doubles categories
    const mensDoublesPoints = dataHD.find(player => player.Navn === playerName)?.[currentYear] || 0;
    const womensDoublesPoints = dataDD.find(player => player.Navn === playerName)?.[currentYear] || 0;

    // Determine which category to use based on points
    const useMensCategory = parseFloat(mensSinglesPoints) > parseFloat(womensSinglesPoints);
    const useWomensCategory = parseFloat(womensSinglesPoints) > parseFloat(mensSinglesPoints);

    // Determine which doubles category to use based on points
    const useMensDoubles = parseFloat(mensDoublesPoints) > parseFloat(womensDoublesPoints);
    const useWomensDoubles = parseFloat(womensDoublesPoints) > parseFloat(mensDoublesPoints);

    // Get category-specific data
    const categoryData = (() => {
      switch (category) {
        case 'single':
          if (useMensCategory) {
            return dataHS.sort((a, b) => parseFloat(b[currentYear]) - parseFloat(a[currentYear]));
          } else if (useWomensCategory) {
            return dataDS.sort((a, b) => parseFloat(b[currentYear]) - parseFloat(a[currentYear]));
          } else {
            // If points are equal or player not found in either category, return empty array
            return [];
          }
        case 'double':
          if (useMensDoubles) {
            return dataHD.sort((a, b) => parseFloat(b[currentYear]) - parseFloat(a[currentYear]));
          } else if (useWomensDoubles) {
            return dataDD.sort((a, b) => parseFloat(b[currentYear]) - parseFloat(a[currentYear]));
          } else {
            // If points are equal or player not found in either category, return empty array
            return [];
          }
        case 'mix':
          return dataMIX.sort((a, b) => parseFloat(b[currentYear]) - parseFloat(a[currentYear]));
        default: // sammenlagt
          // Create a map of all players with their combined points
          const playerPointsMap = new Map();
          
          // Helper function to add points to a player
          const addPlayerPoints = (player, source) => {
            if (!player) return;
            const existing = playerPointsMap.get(player.Navn) || {
              Navn: player.Navn,
              'Current Club': player['Current Club'] || '',
              'All Clubs': player['All Clubs'] || '',
              'Spiller-Id': player['Spiller-Id'] || '',
              points: {}
            };
            
            // Add points for each year
            Object.keys(player).forEach(year => {
              if (/^\d{4}$/.test(year)) {
                const points = parseFloat(player[year] || 0);
                if (points > 0) {
                  existing.points[year] = (existing.points[year] || 0) + points;
                }
              }
            });
            
            playerPointsMap.set(player.Navn, existing);
          };
          
          // Process all data sources
          [...dataDS, ...dataHS, ...dataDD, ...dataHD, ...dataMIX].forEach(player => {
            addPlayerPoints(player);
          });
          
          // Convert map to array and sort by current year points
          return Array.from(playerPointsMap.values())
            .map(player => ({
              ...player,
              ...player.points
            }))
            .sort((a, b) => parseFloat(b[currentYear] || 0) - parseFloat(a[currentYear] || 0));
      }
    })();

    const playerData = categoryData.find((player) => player.Navn === playerName);
    const totalActivePlayers = (() => {
      switch (category) {
        case 'single':
          if (useMensCategory) {
            return dataHS.filter(player => parseFloat(player[currentYear]) > 0).length;
          } else if (useWomensCategory) {
            return dataDS.filter(player => parseFloat(player[currentYear]) > 0).length;
          }
          return 0;
        case 'double':
          if (useMensDoubles) {
            return dataHD.filter(player => parseFloat(player[currentYear]) > 0).length;
          } else if (useWomensDoubles) {
            return dataDD.filter(player => parseFloat(player[currentYear]) > 0).length;
          }
          return 0;
        case 'mix':
          return dataMIX.filter(player => parseFloat(player[currentYear]) > 0).length;
        default: // sammenlagt
          return categoryData.filter(player => parseFloat(player[currentYear]) > 0).length;
      }
    })();
    const currentRankInCategory = categoryData.findIndex(player => player.Navn === playerName) + 1;
    const currentPointsInCategory = playerData ? parseFloat(playerData[currentYear] || 0) : 0;
    const previousPointsInCategory = playerData ? parseFloat(playerData[previousYear] || 0) : 0;

    // Process years and ranks
    const years = Object.keys(playerData || {})
      .filter((key) => key.match(/^\d{4}$/))
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    // Get all years where the player has participated (has points > 0)
    const validYears = years.filter((year) => {
      const points = parseFloat(playerData?.[year] || 0);
      return points > 0;
    });
    
    // Calculate rank for each valid year
    const rankData = validYears.map(year => {
      const playersInYear = categoryData.filter(p => p[year] !== undefined);
      const sortedPlayers = playersInYear
        .filter(p => parseFloat(p[year]) > 0)
        .sort((a, b) => parseFloat(b[year]) - parseFloat(a[year]));
      const playerRank = sortedPlayers.findIndex(p => p.Navn === playerName);
      return playerRank === -1 ? null : playerRank + 1;
    }).filter(rank => rank !== null);

    const bestRank = Math.min(...rankData);
    const worstRank = Math.max(...rankData);
    const bestYearIndex = rankData.indexOf(bestRank);
    const worstYearIndex = rankData.indexOf(worstRank);
    const bestYear = validYears[bestYearIndex];
    const worstYear = validYears[worstYearIndex];

    const currentYearIndex = validYears.indexOf(currentYear);
    const previousYearIndex = validYears.indexOf(previousYear);
    const currentRank = currentYearIndex !== -1 ? rankData[currentYearIndex] : null;
    const previousRank = previousYearIndex !== -1 ? rankData[previousYearIndex] : null;
    const rankChange = previousRank && currentRank ? previousRank - currentRank : 0;
    const pointsChange = currentPointsInCategory - previousPointsInCategory;



    const playerClass = getPlayerClass(recentMatches);

    // Generate SEO description
    const seoDescription = `${playerName} er en badmintonspiller fra ${playerData?.['Current Club']}. 
    Nåværende ranking: ${currentRank}. 
    ${playerClass.class} klasse spiller med ${currentPointsInCategory} poeng. 
    ${pointsChange > 0 ? 'Fremgang' : pointsChange < 0 ? 'Tilbakegang' : 'Stabil'} i ranking siden forrige sesong. 
    Se alle kamper, rankinghistorikk og mer statistikk på Badstat.`;

    return {
      categoryData,
      playerData,
      currentRankInCategory,
      currentPointsInCategory,
      previousPointsInCategory,
      totalActivePlayers,
      rankData,
      validYears,
      bestRank,
      worstRank,
      bestYear,
      worstYear,
      currentRank,
      previousRank,
      rankChange,
      pointsChange,
      playerClass,
      seoDescription
    };
  }, [category, playerName, currentYear, previousYear, recentMatches, dataHS, dataDS, dataHD, dataDD, dataMIX]);

  // Add effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [playerName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, isMobile ? 300 : 500);
    return () => clearTimeout(timer);
  }, [isMobile]);

  // Fetch recent matches
  useEffect(() => {
    async function fetchMatches() {
      try {
        const playerMatches = await getPlayerMatches(playerName);
        setRecentMatches(playerMatches.slice(0, 10)); // Only get first 10 matches
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    }
    fetchMatches();
  }, [playerName]);

  // Fetch ranking data
  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const [hsData, dsData, hdData, ddData, mixData] = await Promise.all([
          getRankingsByCategory('HS'),
          getRankingsByCategory('DS'),
          getRankingsByCategory('HD'),
          getRankingsByCategory('DD'),
          getRankingsByCategory('MIX')
        ]);
        
        setDataHS(hsData || []);
        setDataDS(dsData || []);
        setDataHD(hdData || []);
        setDataDD(ddData || []);
        setDataMIX(mixData || []);
      } catch (error) {
        console.error('Error fetching ranking data:', error);
        setDataHS([]);
        setDataDS([]);
        setDataHD([]);
        setDataDD([]);
        setDataMIX([]);
      }
    };

    fetchRankingData();
  }, []);

  // Fetch third set stats
  useEffect(() => {
    const fetchThirdSetStats = async () => {
      try {
        const stats = await processPlayerData(playerName);
        let newThirdSetStats;
        
        if (category === 'single') {
          newThirdSetStats = {
            winRate: stats?.singleDeciderWinRate?.toFixed(1) || '0.0',
            matches: stats?.singleDeciderMatches || 0,
            wins: stats?.singleDeciderWins || 0
          };
        } else if (category === 'double') {
          newThirdSetStats = {
            winRate: stats?.doubleDeciderWinRate?.toFixed(1) || '0.0',
            matches: stats?.doubleDeciderMatches || 0,
            wins: stats?.doubleDeciderWins || 0
          };
        } else if (category === 'mix') {
          newThirdSetStats = {
            winRate: stats?.mixDeciderWinRate?.toFixed(1) || '0.0',
            matches: stats?.mixDeciderMatches || 0,
            wins: stats?.mixDeciderWins || 0
          };
        } else {
          newThirdSetStats = {
            winRate: stats?.deciderWinRate?.toFixed(1) || '0.0',
            matches: stats?.deciderMatches || 0,
            wins: stats?.deciderWins || 0
          };
        }
        
        setThirdSetStats(newThirdSetStats);
      } catch (error) {
        console.error('Error fetching third set stats:', error);
        setThirdSetStats({
          winRate: '0.0',
          matches: 0,
          wins: 0
        });
      }
    };

    fetchThirdSetStats();
  }, [playerName, category]);



  // Handle Clubs with memoization
  const { currentClub, allClubsExceptCurrent, logoComponents, clubsDisplayString } = useMemo(() => {
    if (!playerData) {
      return {
        currentClub: '',
        allClubsExceptCurrent: [],
        logoComponents: [],
        clubsDisplayString: ''
      };
    }
    
    const allClubsArray = playerData['All Clubs'] ? playerData['All Clubs'].split('|') : [];
    const currentClub = playerData['Current Club'] || '';
    const allClubsExceptCurrent = allClubsArray.filter(club => club !== currentClub);

    const logoComponents = allClubsExceptCurrent
      .map(club => {
        const logoPath = clubLogos[club];
        return logoPath ? (
          <img
            key={club}
            src={logoPath}
            alt={`${club} logo`}
            className="w-12 h-12 sm:w-10 sm:h-10 object-contain rounded-full bg-gray-700/50 p-1"
          />
        ) : null;
      })
      .filter(component => component !== null);

    return {
      currentClub,
      allClubsExceptCurrent,
      logoComponents,
      clubsDisplayString: allClubsExceptCurrent.join(', ')
    };
  }, [playerData]);

  // Prepare chart data with correct year order
  const chartData = useMemo(() => ({
    labels: validYears,
    datasets: [
      {
        label: 'Rank',
        data: rankData.map(rank => totalActivePlayers - rank + 1),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: '#818cf8',
        tension: 0.3,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#1f2937',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }), [validYears, rankData, totalActivePlayers]);

  // Quick calculations that depend on the memoized values
  const totalPoints = useMemo(() => {
    if (!playerData) return 0;
    return validYears.reduce(
      (acc, year) => acc + parseFloat(playerData[year] || 0),
      0
    );
  }, [validYears, playerData]);

  const averageRank = useMemo(() => 
    rankData.reduce((acc, rank) => acc + rank, 0) / rankData.length,
    [rankData]
  );

  const pointsChangeMessage = useMemo(() => 
    pointsChange !== 0 ? `${Math.abs(pointsChange)} poeng` : '',
    [pointsChange]
  );

  // Determine improvement arrow / message
  const { improvementArrow, improvementMessage, improvementColor } = useMemo(() => {
    if (currentPointsInCategory > previousPointsInCategory) {
      return {
        improvementArrow: faArrowUp,
        improvementMessage: 'Fremgang',
        improvementColor: 'text-green-500'
      };
    } else if (currentPointsInCategory < previousPointsInCategory) {
      return {
        improvementArrow: faArrowDown,
        improvementMessage: 'Tilbakegang',
        improvementColor: 'text-red-500'
      };
    } else {
      return {
        improvementArrow: faEquals,
        improvementMessage: 'Stabil',
        improvementColor: 'text-gray-500'
      };
    }
  }, [currentPointsInCategory, previousPointsInCategory]);

  const currentClubLogo = useMemo(() => {
    if (!playerData) return null;
    return clubLogos[playerData['Current Club']] || null;
  }, [playerData]);

  // Calculate win rate info from third set stats
  const winRateInfo = useMemo(() => 
    calculateWinRateInfo(parseFloat(thirdSetStats.winRate)),
    [thirdSetStats.winRate]
  );
  
  const playerImage = useMemo(() => {
    if (!playerData) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="M12 13.5c2.3 0 4.2-1.9 4.2-4.2S14.3 5.1 12 5.1 7.8 7 7.8 9.3s1.9 4.2 4.2 4.2zm0-7c1.5 0 2.8 1.2 2.8 2.8s-1.2 2.8-2.8 2.8S9.2 10.8 9.2 9.3s1.3-2.8 2.8-2.8zm5.6 8.4c-.3-.2-.7-.2-1 0-1.2.7-2.9 1.1-4.6 1.1s-3.4-.4-4.6-1.1c-.3-.2-.7-.2-1 0-2.2 1.4-3.5 3-3.8 4.8-.1.5.3 1 .8 1h17.2c.5 0 .9-.5.8-1-.3-1.8-1.6-3.4-3.8-4.8z" fill="%236366f1" /%3E%3C/svg%3E';
    }
    return playerImages[playerData['Spiller-Id']] ||
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="M12 13.5c2.3 0 4.2-1.9 4.2-4.2S14.3 5.1 12 5.1 7.8 7 7.8 9.3s1.9 4.2 4.2 4.2zm0-7c1.5 0 2.8 1.2 2.8 2.8s-1.2 2.8-2.8 2.8S9.2 10.8 9.2 9.3s1.3-2.8 2.8-2.8zm5.6 8.4c-.3-.2-.7-.2-1 0-1.2.7-2.9 1.1-4.6 1.1s-3.4-.4-4.6-1.1c-.3-.2-.7-.2-1 0-2.2 1.4-3.5 3-3.8 4.8-.1.5.3 1 .8 1h17.2c.5 0 .9-.5.8-1-.3-1.8-1.6-3.4-3.8-4.8z" fill="%236366f1" /%3E%3C/svg%3E';
  }, [playerData, playerImages]);

  // Helper function to format rank display
  const formatRankDisplay = useCallback((rank, total) => {
    if (rank === null || total === 0) {
      return { rank: 'N/A', percentile: 'Ingen ranking' };
    }
    const percentile = ((rank / total) * 100).toFixed(1);
    return { rank: `#${rank}`, percentile: `Topp ${percentile}% i Norge` };
  }, []);

  const rankDisplay = useMemo(() => 
    formatRankDisplay(currentRankInCategory, totalActivePlayers),
    [formatRankDisplay, currentRankInCategory, totalActivePlayers]
  );

  // Loading state with mobile optimization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-8"
        >
          <ShuttlecockIcon className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" color="currentColor" />
          <p className="text-gray-300">Laster spillerdata...</p>
        </motion.div>
      </div>
    );
  }

  // Check for player data after all hooks have been called
  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.6 }}
          className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg"
        >
          <h1 className="text-2xl font-bold text-white mb-4">Spiller ikke funnet</h1>
          <p className="text-gray-300 mb-6">Vi kunne ikke finne informasjon om denne spilleren.</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105">
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            Gå til forsiden
          </Link>
        </motion.div>
      </div>
    );
  }

  const year = 2024; // Year for the review

  return (
    <>
      <SEO
        title={`${playerName} - Badminton Statistikk | Badstat`}
        description={seoDescription}
        playerName={playerName}
        currentClub={playerData['Current Club']}
        currentRank={currentRank}
        currentPoints={currentPointsInCategory}
        playerClass={playerClass.class}
        playerImage={playerImage}
        thirdSetWinRate={category === 'sammenlagt' ? thirdSetStats.winRate : null}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-16 md:pt-32 px-3 md:px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.3 : 0.6 }}
            className="relative z-10 space-y-6"
          >
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-overlay"></div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}></div>
              </div>

              <div className="relative px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
                {/* Club Logo and Name - Top Section */}
                {playerData['Current Club'] && (
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {clubLogos[playerData['Current Club']] && (
                      <img
                        src={clubLogos[playerData['Current Club']]}
                        alt={`${playerData['Current Club']} logo`}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain p-2 bg-gray-800/80 rounded-xl shadow-lg"
                      />
                    )}
                    <h2 className="text-xl sm:text-2xl text-gray-300 font-medium">{playerData['Current Club']}</h2>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12">
                  {/* Left Column - Player Image */}
                  <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 relative flex-shrink-0 mx-auto sm:mx-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl transform rotate-3"></div>
                    <img
                      src={playerImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="M12 13.5c2.3 0 4.2-1.9 4.2-4.2S14.3 5.1 12 5.1 7.8 7 7.8 9.3s1.9 4.2 4.2 4.2zm0-7c1.5 0 2.8 1.2 2.8 2.8s-1.2 2.8-2.8 2.8S9.2 10.8 9.2 9.3s1.3-2.8 2.8-2.8zm5.6 8.4c-.3-.2-.7-.2-1 0-1.2.7-2.9 1.1-4.6 1.1s-3.4-.4-4.6-1.1c-.3-.2-.7-.2-1 0-2.2 1.4-3.5 3-3.8 4.8-.1.5.3 1 .8 1h17.2c.5 0 .9-.5.8-1-.3-1.8-1.6-3.4-3.8-4.8z" fill="%236366f1" /%3E%3C/svg%3E'}
                      alt={playerName}
                      className="relative w-full h-full object-cover rounded-2xl shadow-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="M12 13.5c2.3 0 4.2-1.9 4.2-4.2S14.3 5.1 12 5.1 7.8 7 7.8 9.3s1.9 4.2 4.2 4.2zm0-7c1.5 0 2.8 1.2 2.8 2.8s-1.2 2.8-2.8 2.8S9.2 10.8 9.2 9.3s1.3-2.8 2.8-2.8zm5.6 8.4c-.3-.2-.7-.2-1 0-1.2.7-2.9 1.1-4.6 1.1s-3.4-.4-4.6-1.1c-.3-.2-.7-.2-1 0-2.2 1.4-3.5 3-3.8 4.8-.1.5.3 1 .8 1h17.2c.5 0 .9-.5.8-1-.3-1.8-1.6-3.4-3.8-4.8z" fill="%236366f1" /%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Right Column - Player Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col gap-4 sm:gap-6">
                      {/* Player Name and Class */}
                      <div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-3">
                          <span className="block sm:inline text-white/90 mb-2 sm:mb-0">{playerName.split(' ')[0]}</span>
                          <span className="hidden sm:inline"> </span>
                          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                            {playerName.split(' ').slice(1).join(' ')}
                          </span>
                        </h1>
                        {/* <div className="flex items-center justify-center sm:justify-start gap-3">
                          <ClassBadge playerClass={playerClass.class} />
                        </div> */}
                      </div>

                      {/* Navigation */}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                        <a 
                          href="#matches"
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById('matches');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="inline-flex items-center px-3 sm:px-4 py-2 text-sm bg-gray-800/50 rounded-xl text-white hover:bg-gray-700/70 transition-all duration-300"
                        >
                          <ShuttlecockIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" color="currentColor" />
                          <span className="whitespace-nowrap">Se kamper</span>
                        </a>
                        <a 
                          href="#ranking"
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab('rankings');
                            setTimeout(() => {
                              const element = document.getElementById('rankings-content');
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }, 100);
                          }}
                          className="inline-flex items-center px-3 sm:px-4 py-2 text-sm bg-gray-800/50 rounded-xl text-white hover:bg-gray-700/70 transition-all duration-300"
                        >
                          <FontAwesomeIcon icon={faChartLine} className="mr-1 sm:mr-2" />
                          <span className="whitespace-nowrap">Ranking</span>
                        </a>
                        <a 
                          href="#achievements"
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab('achievements');
                            setTimeout(() => {
                              const element = document.getElementById('achievements-content');
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }, 100);
                          }}
                          className="inline-flex items-center px-3 sm:px-4 py-2 text-sm bg-gray-800/50 rounded-xl text-white hover:bg-gray-700/70 transition-all duration-300"
                        >
                          <FontAwesomeIcon icon={faTrophy} className="mr-1 sm:mr-2" />
                          <span className="whitespace-nowrap">Prestasjoner</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Year in Review Announcement Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.3 : 0.6, delay: 0.1 }}
              className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-2xl shadow-2xl border border-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 mix-blend-overlay"></div>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}></div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-4 right-4 w-16 h-16 text-purple-400 opacity-30 animate-bounce">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -5, 0],
                    y: [0, -5, 5, 0] 
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    repeatType: "mirror" 
                  }}
                  className="text-4xl"
                >
                  🏸
                </motion.div>
              </div>

              <div className="relative px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                  {/* Left Side - Icon and Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-xl" />
                      </div>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-semibold rounded-full border border-purple-500/30">
                        ✨ NYHET!
                      </span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                        {playerName}s "Badminton Wrapped"
                      </span>
                    </h2>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Få en oversikt over dine beste øyeblikk, største seire og mest interessante statistikker fra 2024/2025-sesongen – presentert på en enkel og visuell måte.
                    </p>

                    {/* Feature highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-purple-300">
                        <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
                        <span className="text-sm">Beste seire</span>
                      </div>
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-purple-300">
                        <FontAwesomeIcon icon={faChartLine} className="text-blue-400" />
                        <span className="text-sm">Statistikk</span>
                      </div>
                      <div className="flex items-center justify-center lg:justify-start gap-2 text-purple-300">
                        <FontAwesomeIcon icon={faHeart} className="text-red-400" />
                        <span className="text-sm">Morsomme fakta</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - CTA Button */}
                  <div className="flex-shrink-0">
                    <Link
                      to={`/player/${encodeURIComponent(playerName)}/year-in-review`}
                      className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-500 hover:to-pink-500 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
                        Se mitt 2024/2025
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FontAwesomeIcon icon={faArrowRight} />
                        </motion.div>
                      </span>
                    </Link>
                    
                    {/* Small description */}
                    <p className="text-xs text-purple-300 mt-2 text-center opacity-80">
                      Interaktiv opplevelse • 2-3 minutter
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Section with Integrated Tabs */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
              {/* Category Filter Tabs */}
              <div className="border-b border-gray-700/50">
                <div className="flex">
                  {['Sammenlagt', 'Single', 'Double', 'Mix'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat.toLowerCase())}
                      className={`px-6 py-3 text-sm font-medium transition-all relative ${
                        category === cat.toLowerCase()
                          ? 'text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {cat}
                      {category === cat.toLowerCase() && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                          initial={false}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-700/50">
                {/* Ranking Card */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-400">Ranking</h3>
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faChartLine} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold text-indigo-400 mb-1">
                      {currentRank ? `#${currentRank}` : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentRank ? `Topp ${((currentRank / totalActivePlayers) * 100).toFixed(1)}% i Norge` : 'Ingen ranking'}
                    </span>
                    {currentRank && (
                      <div className="mt-4">
                        <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - ((currentRank / totalActivePlayers) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-indigo-500/20"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Av {totalActivePlayers} rangerte spillere
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Points Card */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-400">Poeng</h3>
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faStar} className="text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold text-emerald-400 mb-1">
                      {currentPointsInCategory || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentPointsInCategory !== null ? (
                        `${currentPointsInCategory > previousPointsInCategory ? '+' : ''}${currentPointsInCategory - previousPointsInCategory} poeng fra i fjor`
                      ) : (
                        'Ingen poeng denne sesongen'
                      )}
                    </span>
                    <div className="mt-4">
                      <div className="relative h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (previousPointsInCategory / 5))}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gray-600/50"
                        />
                        {currentPointsInCategory !== null && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (currentPointsInCategory / 5))}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full bg-emerald-500/20 absolute top-0 left-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third Set Card */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-400">3. sett</h3>
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faBrain} className="text-yellow-400" />
                    </div>
                  </div>
                  {category === 'sammenlagt' ? (
                    <div className="flex flex-col">
                      <span className="text-4xl font-bold text-yellow-400 mb-1">
                        {thirdSetStats.winRate}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {winRateInfo.message}
                      </span>
                      <div className="mt-4">
                        <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${thirdSetStats.winRate}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-yellow-500/20"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {thirdSetStats.wins} av {thirdSetStats.matches} kamper
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start">
                      <span className="text-lg text-gray-400 mb-1">Under utvikling</span>
                      <span className="text-sm text-gray-500">
                        Kommer snart for {category === 'single' ? 'single' : category === 'double' ? 'double' : 'mix'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Matches Section with mobile optimization */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.3 : 0.6, delay: 0.2 }}
            className="mb-12"
            id="matches"
          >
            {/* Ad Slot inserted before the "Siste kamper" heading */}
            <div style={{ marginBottom: '24px', marginTop: '24px' }}> {/* Add some spacing */}
                <AdSlot 
                    adSlot="7152830155" 
                    adClient="ca-pub-6338038731129939"
                />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">Siste Kamper</h2>
            <PlayerRecentMatches key={playerName} playerName={playerName} />
          </motion.div>

          {/* Tab Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.3 : 0.6, delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            id="rankings-content"
          >
            {/* Rankings Tab */}
            {activeTab === 'rankings' && (
              <>
                <RankingHistoryGraph playerName={playerName} />
                <div className="overflow-x-auto mt-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">År</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Poeng</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {validYears.map((year, index) => {
                        const rank = rankData[index];
                        const points = parseFloat(playerData[year]);
                        const isCurrentYear = year === currentYear;
                        const isBestYear = year === bestYear;
                        const isPreviousYear = year === previousYear;
                        
                        return (
                          <tr key={year} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {year}
                              {isCurrentYear && (
                                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300">
                                  Nåværende
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-bold ${isBestYear ? 'text-indigo-400' : 'text-white'}`}>
                                {rank}
                                {isBestYear && <FontAwesomeIcon icon={faStar} className="ml-1 text-yellow-400" />}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{points}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {isCurrentYear && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  rankChange > 0
                                    ? 'bg-green-500/20 text-green-400'
                                    : rankChange < 0
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {rankChange > 0 ? 'Opp' : rankChange < 0 ? 'Ned' : 'Stabil'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="text-white" id="achievements-content">
                <AchievementsDisplay
                  playerName={playerName}
                  milestones={achievementsConfig.gameplayMilestones}
                />
              </div>
            )}
          </motion.div>

          {/* Previous Clubs Section */}
          {playerData['All Clubs'] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isMobile ? 0.3 : 0.6, delay: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-12"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Tidligere Klubber</h3>
              <div className="flex flex-wrap gap-4">
                {logoComponents}
              </div>
            </motion.div>
          )}

          {/* Back Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isMobile ? 0.3 : 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Tilbake til søk
              
            </Link>
          </motion.div>

          {/* Year in Review Button */}
        </div>
      </div>
    </>
  );
};

export default PlayerDetail;
