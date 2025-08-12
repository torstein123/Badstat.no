import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faUser, faUserFriends, faVenusMars } from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard';

const MatchTypeBreakdown = ({ data }) => {
  const [chartReady, setChartReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!data) return null;
  const total = data.singles + data.doubles + data.mixed;
  
  const singlesPercentage = Math.round((data.singles / total) * 100);
  const doublesPercentage = Math.round((data.doubles / total) * 100);
  const mixedPercentage = Math.round((data.mixed / total) * 100);
  
  // Calculate bubble size based on percentages but with improved scaling
  // Base size plus percentage-driven adjustment
  const baseBubbleSize = 60; // Minimum bubble size
  const maxBubbleSize = 130; // Maximum bubble size
  
  // Calculate size with a better formula for visual representation
  const calculateBubbleSize = (percentage) => {
    return baseBubbleSize + ((percentage / 100) * (maxBubbleSize - baseBubbleSize));
  };
  
  const singlesSize = calculateBubbleSize(singlesPercentage);
  const doublesSize = calculateBubbleSize(doublesPercentage);
  const mixedSize = calculateBubbleSize(mixedPercentage);
  
  // Pulse animation variants for bubbles
  const pulseAnimation = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      }
    }
  };
  
  return (
    <StatCard 
      title="Kampfordeling" 
      icon={faChartPie} 
      iconColor="text-blue-400"
      delay={4}
    >
      <div className="text-center py-6">
        <div className="relative h-72 mb-10">
          {/* Singles bubble */}
          <motion.div
            className="absolute bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 overflow-hidden"
            style={{ 
              left: '25%', 
              top: '30%', 
              transform: 'translate(-50%, -50%)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ 
              width: chartReady ? singlesSize : 0, 
              height: chartReady ? singlesSize : 0, 
              opacity: chartReady ? 1 : 0 
            }}
            transition={{ 
              duration: 1, 
              delay: 1.1,
              type: "spring",
              stiffness: 100
            }}
            variants={pulseAnimation}
            whileInView="pulse"
          >
            <div className="flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-blue-100 text-2xl" />
              <div className="text-lg font-bold text-white mt-1">
                {data.singles}
              </div>
            </div>
            
            {/* Shimmering effect */}
            <motion.div 
              className="absolute inset-0 bg-white opacity-10"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            />
          </motion.div>
          
          {/* Doubles bubble */}
          <motion.div
            className="absolute bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 overflow-hidden"
            style={{ 
              right: '20%', 
              top: '30%', 
              transform: 'translate(0%, -50%)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ 
              width: chartReady ? doublesSize : 0, 
              height: chartReady ? doublesSize : 0, 
              opacity: chartReady ? 1 : 0 
            }}
            transition={{ 
              duration: 1, 
              delay: 1.3,
              type: "spring",
              stiffness: 100
            }}
            variants={pulseAnimation}
            whileInView="pulse"
          >
            <div className="flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faUserFriends} className="text-green-100 text-2xl" />
              <div className="text-lg font-bold text-white mt-1">
                {data.doubles}
              </div>
            </div>
            
            {/* Shimmering effect */}
            <motion.div 
              className="absolute inset-0 bg-white opacity-10"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, delay: 1 }}
            />
          </motion.div>
          
          {/* Mixed bubble */}
          <motion.div
            className="absolute bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 overflow-hidden"
            style={{ 
              left: '50%', 
              top: '65%', 
              transform: 'translate(-50%, -50%)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ 
              width: chartReady ? mixedSize : 0, 
              height: chartReady ? mixedSize : 0, 
              opacity: chartReady ? 1 : 0 
            }}
            transition={{ 
              duration: 1, 
              delay: 1.5,
              type: "spring",
              stiffness: 100
            }}
            variants={pulseAnimation}
            whileInView="pulse"
          >
            <div className="flex flex-col items-center justify-center">
              <FontAwesomeIcon icon={faVenusMars} className="text-purple-100 text-2xl" />
              <div className="text-lg font-bold text-white mt-1">
                {data.mixed}
              </div>
            </div>
            
            {/* Shimmering effect */}
            <motion.div 
              className="absolute inset-0 bg-white opacity-10"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, delay: 2 }}
            />
          </motion.div>
        </div>
        
        {/* Bottom legends with improved styling */}
        <div className="grid grid-cols-3 gap-4 text-center mx-auto max-w-md">
          <motion.div 
            className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-500/10 to-blue-700/10 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-blue-400">{data.singles}</div>
            <div className="text-gray-300 font-medium">Singles</div>
            <div className="text-sm mt-1 bg-blue-500/20 rounded-full px-3 py-1 text-blue-300">{singlesPercentage}%</div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 bg-gradient-to-br from-green-500/10 to-green-700/10 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-green-400">{data.doubles}</div>
            <div className="text-gray-300 font-medium">Doubles</div>
            <div className="text-sm mt-1 bg-green-500/20 rounded-full px-3 py-1 text-green-300">{doublesPercentage}%</div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-3 bg-gradient-to-br from-purple-500/10 to-purple-700/10 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-purple-400">{data.mixed}</div>
            <div className="text-gray-300 font-medium">Mixed</div>
            <div className="text-sm mt-1 bg-purple-500/20 rounded-full px-3 py-1 text-purple-300">{mixedPercentage}%</div>
          </motion.div>
        </div>
        
        {/* Total matches indicator */}
        <motion.div
          className="mt-4 text-center opacity-60 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
        >
          Total: {total} matches
        </motion.div>
      </div>
    </StatCard>
  );
};

export default MatchTypeBreakdown; 