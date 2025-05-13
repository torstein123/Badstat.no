import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faFire, faTableTennis, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard';

const MostGames = ({ data }) => {
  if (!data) return null;
  
  // Ensure data is valid
  const safeData = {
    tournament: data.tournament && typeof data.tournament === 'string' ? data.tournament : "Unknown Tournament",
    date: data.date && typeof data.date === 'string' ? data.date : "",
    gamesPlayed: !isNaN(data.gamesPlayed) ? data.gamesPlayed : 0,
    breakdown: data.breakdown || { singles: 0, doubles: 0, mixed: 0, other: 0 }
  };
  
  // Calculate totals to ensure we have matches
  const totalBreakdown = 
    safeData.breakdown.singles + 
    safeData.breakdown.doubles + 
    safeData.breakdown.mixed + 
    safeData.breakdown.other;
  
  // Use breakdown if available, otherwise just show total
  const hasBreakdown = totalBreakdown > 0;
  
  return (
    <StatCard 
      title="Tournament Warrior" 
      icon={faFire} 
      iconColor="text-orange-400"
      delay={3}
    >
      <div className="text-center py-4">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background circle */}
                <circle cx="50" cy="50" r="45" fill="rgba(249, 115, 22, 0.1)" />
                
                {/* Animated progress circle */}
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none"
                  stroke="rgba(249, 115, 22, 0.6)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold text-orange-400">{safeData.gamesPlayed}</span>
                <span className="text-sm text-orange-300">Matches</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-2">
            {safeData.tournament}
          </h4>
          
          <div className="flex items-center justify-center space-x-1 mb-4">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-400" />
            <span className="text-gray-300">{safeData.date}</span>
          </div>
          
          {/* Match type breakdown */}
          {hasBreakdown && (
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-2 mb-4"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              {safeData.breakdown.singles > 0 && (
                <div className="px-3 py-1 bg-orange-500/20 rounded-full flex items-center">
                  <FontAwesomeIcon icon={faUser} className="text-orange-400 mr-1" />
                  <span className="text-sm text-orange-300">{safeData.breakdown.singles} Singles</span>
                </div>
              )}
              
              {safeData.breakdown.doubles > 0 && (
                <div className="px-3 py-1 bg-orange-500/20 rounded-full flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="text-orange-400 mr-1" />
                  <span className="text-sm text-orange-300">{safeData.breakdown.doubles} Doubles</span>
                </div>
              )}
              
              {safeData.breakdown.mixed > 0 && (
                <div className="px-3 py-1 bg-orange-500/20 rounded-full flex items-center">
                  <FontAwesomeIcon icon={faTableTennis} className="text-orange-400 mr-1" />
                  <span className="text-sm text-orange-300">{safeData.breakdown.mixed} Mixed</span>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Generic badge if no breakdown */}
          {!hasBreakdown && (
            <motion.div 
              className="flex justify-center items-center space-x-2 mb-4"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div className="px-3 py-1 bg-orange-500/20 rounded-full flex items-center">
                <FontAwesomeIcon icon={faTableTennis} className="text-orange-400 mr-1" />
                <span className="text-sm text-orange-300">All Match Types</span>
              </div>
            </motion.div>
          )}
          
          <div className="px-4">
            <p className="text-gray-300 text-sm">
              You played an impressive {safeData.gamesPlayed} matches at this tournament, 
              including {hasBreakdown ? `${safeData.breakdown.singles} singles, ${safeData.breakdown.doubles} doubles, and ${safeData.breakdown.mixed} mixed` : 'singles, doubles, and mixed'} games. True endurance!
            </p>
          </div>
        </motion.div>
      </div>
    </StatCard>
  );
};

export default MostGames; 