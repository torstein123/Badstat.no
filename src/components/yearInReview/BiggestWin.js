import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faUser, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard';

const BiggestWin = ({ data }) => {
  if (!data) return null;
  
  return (
    <StatCard 
      title="Største Seier" 
      icon={faTrophy} 
      iconColor="text-yellow-400"
      delay={1}
    >
      <div className="text-center py-4">
        <motion.div 
          className="mb-6 transform"
          initial={{ scale: 0.9, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.4
          }}
        >
          <div className="inline-block relative">
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center p-1 shadow-lg shadow-yellow-500/30">
              <div className="w-full h-full rounded-full bg-yellow-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faTrophy} className="text-4xl md:text-5xl text-yellow-100" />
              </div>
            </div>
            <motion.div 
              className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-white font-bold">🔥</span>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-2xl font-bold text-white mb-1">Mot {data.opponent}</h4>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">{data.score}</p>
          
          <div className="flex items-center justify-center mb-1 text-gray-300">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-400" />
            <span>{data.date}</span>
          </div>
          
          <div className="flex items-center justify-center text-gray-300">
            <span className="px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-sm">
              {data.tournament}
            </span>
          </div>
        </motion.div>
      </div>
    </StatCard>
  );
};

export default BiggestWin; 