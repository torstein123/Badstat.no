import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';

const TopPartner = ({ data }) => {
  if (!data) return null;
  
  // Ensure all data values are valid to prevent NaN display
  const safeData = {
    name: data.name && typeof data.name === 'string' ? data.name : "Unknown",
    gamesPlayed: !isNaN(data.gamesPlayed) ? data.gamesPlayed : 0,
    winRate: !isNaN(data.winRate) ? data.winRate : 0
  };
  
  return (
    <StatCard 
      title="Dream Team Partner" 
      icon={faHandshake} 
      iconColor="text-green-400"
      delay={5}
    >
      <div className="text-center py-4">
        <motion.div 
          className="mb-6 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.9 }}
        >
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-500 p-1 shadow-lg shadow-green-500/20">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
            </div>
            
            <motion.div 
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                delay: 2.1 
              }}
            >
              <span className="text-white font-bold text-lg">♥️</span>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
        >
          <Link to={`/player/${safeData.name}`}>
            <h4 className="text-2xl font-bold text-white hover:text-green-300 transition-colors mb-2">
              {safeData.name}
            </h4>
          </Link>
          
          <div className="flex flex-col items-center mb-4 space-y-1">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faUserFriends} className="text-green-400" />
              <span className="text-gray-300">{safeData.gamesPlayed} games together</span>
            </div>
            
            <div className="w-full max-w-[180px] h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${safeData.winRate}%` }}
                transition={{ duration: 1, delay: 2.3 }}
              />
            </div>
            
            <div className="text-sm font-bold text-green-400">{safeData.winRate}% Win Rate</div>
          </div>
          
          <div className="px-4">
            <p className="text-gray-300 text-sm italic">
              "Your go-to partner for dominating the court and crushing opponents!"
            </p>
          </div>
        </motion.div>
      </div>
    </StatCard>
  );
};

export default TopPartner; 