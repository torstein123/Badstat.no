import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard';

const ClosestMatch = ({ data }) => {
  if (!data) return null;
  
  // Split the score to animate each set
  const scoreParts = data.score.split(', ');
  
  return (
    <StatCard 
      title="Neglebiterkamp" 
      icon={faBolt} 
      iconColor="text-amber-400"
      delay={7}
      className="col-span-1 md:col-span-2"
    >
      <div className="text-center py-4">
        <motion.h3 
          className="text-2xl text-white font-bold mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1 }}
        >
          Kampen som holdt alle på kanten av setene
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-8">
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <motion.div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 p-1 shadow-lg shadow-purple-500/20 mb-2"
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                delay: 3.2 
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
            </motion.div>
            
            <motion.span 
              className="text-xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.3 }}
            >
              Deg
            </motion.span>
          </div>
          
          <div className="md:col-span-1 py-6">
            <div className="flex items-center justify-center space-x-6">
              {scoreParts.map((score, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.4 + (index * 0.2) }}
                >
                  <div className="text-xl font-bold text-amber-400">{score}</div>
                  <div className="text-xs text-gray-400">Sett {index + 1}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <motion.div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 p-1 shadow-lg shadow-blue-500/20 mb-2"
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                delay: 3.2 
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
            </motion.div>
            
            <motion.span 
              className="text-xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.3 }}
            >
              {data.opponent}
            </motion.span>
          </div>
        </div>
        
        <motion.div 
          className="bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-blue-500/20 rounded-xl p-4 mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.0 }}
        >
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-amber-400 mr-2" />
            <span className="text-gray-300">{data.date} | {data.tournament}</span>
          </div>
          
          <p className="text-gray-300 text-sm">
            Denne episke kampen presset deg til dine grenser og viste din besluttsomhet.
            Hvert poeng ble omstridt, og atmosfæren var elektrisk da kampen gikk til wire!
          </p>
          
          <motion.div 
            className="mt-4 space-x-2 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.2 }}
          >
            {['Intens', 'Spennende', 'Episk'].map((tag, index) => (
              <span 
                key={index}
                className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </StatCard>
  );
};

export default ClosestMatch; 