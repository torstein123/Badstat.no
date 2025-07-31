import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSkull, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';

const Nemesis = ({ data }) => {
  if (!data) return null;
  
  // Ensure all data values are valid to prevent NaN display
  const safeData = {
    name: data.name && typeof data.name === 'string' ? data.name : "Unknown",
    gamesPlayed: !isNaN(data.gamesPlayed) ? data.gamesPlayed : 0,
    lossRate: !isNaN(data.lossRate) ? data.lossRate : 0
  };
  
  return (
    <StatCard 
      title="Din Nemesis" 
      icon={faExclamationTriangle} 
      iconColor="text-red-400"
      delay={6}
    >
      <div className="text-center py-4">
        <motion.div 
          className="mb-6 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 2.4 }}
        >
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 p-1 shadow-lg shadow-red-500/20">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center">
                <span className="text-3xl">😈</span>
              </div>
            </div>
            
            <motion.div 
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                delay: 2.6 
              }}
            >
              <FontAwesomeIcon icon={faSkull} className="text-white text-sm" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7 }}
        >
          <Link to={`/player/${safeData.name}`}>
            <h4 className="text-2xl font-bold text-white hover:text-red-300 transition-colors mb-2">
              {safeData.name}
            </h4>
          </Link>
          
          <div className="flex flex-col items-center mb-4 space-y-1">
            <div className="flex items-center space-x-1">
              <span className="text-gray-300">{safeData.gamesPlayed} kamper</span>
            </div>
            
            <div className="w-full max-w-[180px] h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${safeData.lossRate}%` }}
                transition={{ duration: 1, delay: 2.8 }}
              />
            </div>
            
            <div className="text-sm font-bold text-red-400">{safeData.lossRate}% Taprate</div>
          </div>
          
          <motion.div 
            className="px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.0 }}
          >
            <p className="text-gray-300 text-sm italic">
              "Din ultimate rival. Blir neste sesong din oppreisningssaga?"
            </p>
            
            <motion.div 
              className="mt-4 inline-block px-4 py-2 rounded-full bg-red-500/20 text-red-300 text-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-bold">2025 Mål:</span> Beseir din nemesis!
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </StatCard>
  );
};

export default Nemesis; 