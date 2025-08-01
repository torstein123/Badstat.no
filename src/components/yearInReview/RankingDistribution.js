import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faUser, 
  faUserFriends, 
  faVenusMars,
  faMedal,
  faArrowUp,
  faArrowDown,
  faEquals
} from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard';
import { getPlayerRankingsByCategory } from '../../services/databaseService';

const RankingDistribution = ({ playerName, year }) => {
  const [animateChart, setAnimateChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerData, setPlayerData] = useState({
    playerHS: null,
    playerDS: null,
    playerHD: null,
    playerDD: null,
    playerMIX: null
  });
  
  const currentYear = year || '2024';
  const previousYear = (parseInt(currentYear) - 1).toString();
  
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const [playerHS, playerDS, playerHD, playerDD, playerMIX] = await Promise.all([
          getPlayerRankingsByCategory(playerName, 'HS'),
          getPlayerRankingsByCategory(playerName, 'DS'),
          getPlayerRankingsByCategory(playerName, 'HD'),
          getPlayerRankingsByCategory(playerName, 'DD'),
          getPlayerRankingsByCategory(playerName, 'MIX')
        ]);
        
        setPlayerData({
          playerHS,
          playerDS,
          playerHD,
          playerDD,
          playerMIX
        });
      } catch (error) {
        console.error('Error fetching player data:', error);
        setError('Failed to load player data');
      } finally {
        setLoading(false);
      }
    };
    
    if (playerName) {
      fetchPlayerData();
    }
  }, [playerName]);
  
  // Get player data from each category
  const { playerHS, playerDS, playerHD, playerDD, playerMIX } = playerData;
  
  // Check if player has any ranking data
  const hasRankingData = playerHS || playerDS || playerHD || playerDD || playerMIX;
  
  // Get points for current year in each category
  const hsPoints = playerHS ? parseFloat(playerHS[currentYear] || 0) : 0;
  const dsPoints = playerDS ? parseFloat(playerDS[currentYear] || 0) : 0;
  const hdPoints = playerHD ? parseFloat(playerHD[currentYear] || 0) : 0;
  const ddPoints = playerDD ? parseFloat(playerDD[currentYear] || 0) : 0;
  const mixPoints = playerMIX ? parseFloat(playerMIX[currentYear] || 0) : 0;
  
  // Get points for previous year in each category
  const hsPointsPrev = playerHS ? parseFloat(playerHS[previousYear] || 0) : 0;
  const dsPointsPrev = playerDS ? parseFloat(playerDS[previousYear] || 0) : 0;
  const hdPointsPrev = playerHD ? parseFloat(playerHD[previousYear] || 0) : 0;
  const ddPointsPrev = playerDD ? parseFloat(playerDD[previousYear] || 0) : 0;
  const mixPointsPrev = playerMIX ? parseFloat(playerMIX[previousYear] || 0) : 0;
  
  // Calculate changes
  const hsChange = hsPoints - hsPointsPrev;
  const dsChange = dsPoints - dsPointsPrev;
  const hdChange = hdPoints - hdPointsPrev;
  const ddChange = ddPoints - ddPointsPrev;
  const mixChange = mixPoints - mixPointsPrev;
  
  // Determine which categories to show based on gender
  const isMale = hsPoints > dsPoints;
  const singlesPoints = isMale ? hsPoints : dsPoints;
  const singlesPointsPrev = isMale ? hsPointsPrev : dsPointsPrev;
  const singlesChange = isMale ? hsChange : dsChange;
  const singlesLabel = isMale ? 'Herresingle' : 'Damesingle';
  
  const doublesPoints = isMale ? hdPoints : ddPoints;
  const doublesPointsPrev = isMale ? hdPointsPrev : ddPointsPrev;
  const doublesChange = isMale ? hdChange : ddChange;
  const doublesLabel = isMale ? 'Herredouble' : 'Damedouble';
  
  // Calculate total points
  const totalPoints = singlesPoints + doublesPoints + mixPoints;
  const totalPointsPrev = singlesPointsPrev + doublesPointsPrev + mixPointsPrev;
  const totalChange = totalPoints - totalPointsPrev;
  
  // Calculate percentages
  const singlesPercentage = totalPoints > 0 ? Math.round((singlesPoints / totalPoints) * 100) : 0;
  const doublesPercentage = totalPoints > 0 ? Math.round((doublesPoints / totalPoints) * 100) : 0;
  const mixedPercentage = totalPoints > 0 ? Math.round((mixPoints / totalPoints) * 100) : 0;
  
  // Determine main category
  let mainCategory = 'Potet';
  let mainCategoryIcon = faChartLine;
  
  if (singlesPercentage > 60) {
    mainCategory = 'Singles Spesialist';
    mainCategoryIcon = faUser;
  } else if (doublesPercentage > 60) {
    mainCategory = 'Doubles Spesialist';
    mainCategoryIcon = faUserFriends;
  } else if (mixedPercentage > 60) {
    mainCategory = 'Mixed Spesialist';
    mainCategoryIcon = faVenusMars;
  }
  
  // Animation delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateChart(true);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If no ranking data is found, show a fallback message
  if (!hasRankingData && !loading) {
    return (
      <StatCard 
        title="Rankingpoeng" 
        icon={faChartLine} 
        iconColor="text-indigo-400"
        delay={8}
      >
        <div className="py-4 flex flex-col items-center justify-center h-64">
          <FontAwesomeIcon icon={faChartLine} className="text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Ingen Rangeringspoeng</h3>
          <p className="text-gray-300 text-center max-w-xs">
            Vi fant ingen rankingpoeng for {playerName} i sesongen 2024/2025. 
            Spill flere turneringer for å ta flere rankingpoeng!
          </p>
        </div>
      </StatCard>
    );
  }
  
  // If total points is zero, show a message about no points this year
  if ((hsPoints + dsPoints + hdPoints + ddPoints + mixPoints) === 0 && !loading) {
    return (
      <StatCard 
        title="Rankingpoeng" 
        icon={faChartLine} 
        iconColor="text-indigo-400"
        delay={8}
      >
        <div className="py-4 flex flex-col items-center justify-center h-64">
          <FontAwesomeIcon icon={faMedal} className="text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Ingen Rankingpoeng</h3>
          <p className="text-gray-300 text-center max-w-xs">
            {playerName} har ingen rankingpoeng i sesongen 2024/2025 enda. 
            Spill flere turneringer for å ta flere rankingpoeng!
          </p>
          {(hsPointsPrev + dsPointsPrev + hdPointsPrev + ddPointsPrev + mixPointsPrev) > 0 && (
            <p className="text-gray-400 text-sm mt-4">
              Du hadde {hsPointsPrev + dsPointsPrev + hdPointsPrev + ddPointsPrev + mixPointsPrev} poeng denne sesongen.
            </p>
          )}
        </div>
      </StatCard>
    );
  }
  
  // Helper function to get status icon
  const getStatusIcon = (change) => {
    if (change > 0) return { icon: faArrowUp, color: 'text-green-400' };
    if (change < 0) return { icon: faArrowDown, color: 'text-red-400' };
    return { icon: faEquals, color: 'text-gray-400' };
  };
  
  const singlesStatus = getStatusIcon(singlesChange);
  const doublesStatus = getStatusIcon(doublesChange);
  const mixedStatus = getStatusIcon(mixChange);
  const totalStatus = getStatusIcon(totalChange);
  
  return (
    <StatCard 
      title="Rankingpoeng" 
      icon={faChartLine} 
      iconColor="text-indigo-400"
      delay={8}
    >
      <div className="py-4">
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
        >
          <span className="text-xl text-white font-semibold">
            Du er en <span className="text-indigo-400 font-bold">{mainCategory}</span>
          </span>
          <div className="text-sm text-gray-300 mt-1">2024/2025 Sesong</div>
          <motion.div
            className="w-16 h-16 mx-auto mt-2 bg-indigo-500/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.2, type: "spring" }}
          >
            <FontAwesomeIcon icon={mainCategoryIcon} className="text-indigo-400 text-2xl" />
          </motion.div>
        </motion.div>
        
        {/* Bar chart visualization */}
        <div className="space-y-4 mb-6">
          {/* Singles Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="text-blue-400 mr-2" />
                <span className="text-sm text-gray-300">{singlesLabel}</span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-bold">{singlesPoints}</span>
                <FontAwesomeIcon 
                  icon={singlesStatus.icon} 
                  className={`ml-2 ${singlesStatus.color} text-xs`} 
                />
              </div>
            </div>
            <div className="h-6 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: animateChart ? `${singlesPercentage}%` : 0 }}
                transition={{ duration: 1, delay: 2.3 }}
              >
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{singlesPercentage}%</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Doubles Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserFriends} className="text-green-400 mr-2" />
                <span className="text-sm text-gray-300">{doublesLabel}</span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-bold">{doublesPoints}</span>
                <FontAwesomeIcon 
                  icon={doublesStatus.icon} 
                  className={`ml-2 ${doublesStatus.color} text-xs`} 
                />
              </div>
            </div>
            <div className="h-6 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-green-500/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: animateChart ? `${doublesPercentage}%` : 0 }}
                transition={{ duration: 1, delay: 2.4 }}
              >
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{doublesPercentage}%</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Mixed Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faVenusMars} className="text-purple-400 mr-2" />
                <span className="text-sm text-gray-300">Mixed Double</span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-bold">{mixPoints}</span>
                <FontAwesomeIcon 
                  icon={mixedStatus.icon} 
                  className={`ml-2 ${mixedStatus.color} text-xs`} 
                />
              </div>
            </div>
            <div className="h-6 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-purple-500/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: animateChart ? `${mixedPercentage}%` : 0 }}
                transition={{ duration: 1, delay: 2.5 }}
              >
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{mixedPercentage}%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Total points card */}
        <motion.div 
          className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faMedal} className="text-indigo-300" />
              </div>
              <div>
                <div className="text-gray-300 text-sm">Totale Rangeringspoeng</div>
                <div className="text-2xl font-bold text-white">{totalPoints}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center justify-end ${totalStatus.color}`}>
                <FontAwesomeIcon icon={totalStatus.icon} className="mr-1" />
                <span className="font-bold">
                  {totalChange > 0 ? `+${totalChange}` : totalChange}
                </span>
              </div>
              <div className="text-gray-400 text-xs">fra fjoråret</div>
            </div>
          </div>
        </motion.div>
        
        {/* Fun fact */}
        <motion.div 
          className="mt-5 text-center text-sm text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
        >
          {singlesPercentage > doublesPercentage && singlesPercentage > mixedPercentage && (
            <span>Du fokuserer på single! Kanskje det er på tide å finne en doublepartner? 😉</span>
          )}
          {doublesPercentage > singlesPercentage && doublesPercentage > mixedPercentage && (
            <span>Du elsker double! Bedre å vinne som lag, ikke sant? 🤝</span>
          )}
          {mixedPercentage > singlesPercentage && mixedPercentage > doublesPercentage && (
            <span>Mixed double-fan! Du nyter det beste fra begge verdener! 💫</span>
          )}
          {singlesPercentage === doublesPercentage && singlesPercentage === mixedPercentage && (
            <span>Balansert, som alle ting bør være! 🧘</span>
          )}
        </motion.div>
      </div>
    </StatCard>
  );
};

export default RankingDistribution; 