import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatCard = ({ 
  title, 
  icon, 
  iconColor = "text-purple-400", 
  children, 
  className = "", 
  delay = 0 
}) => {
  return (
    <motion.div 
      className={`w-full max-w-md md:max-w-2xl mx-auto bg-gradient-to-br from-gray-900/90 to-purple-900/50 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-purple-500/30 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      <div className="relative h-full">
        {/* Background patterns for visual interest */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent"></div>
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-tl from-indigo-500/5 to-transparent rounded-tl-3xl"></div>
        
        {/* Enhanced animated particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                backgroundColor: `rgba(${
                  Math.floor(Math.random() * 100) + 100
                }, ${
                  Math.floor(Math.random() * 50) + 100
                }, ${
                  Math.floor(Math.random() * 200) + 50
                }, ${
                  Math.random() * 0.3 + 0.1
                })`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5 + delay * 0.1,
              }}
            />
          ))}
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 rounded-full bg-purple-500/5 blur-3xl"></div>
        
        <div className="p-6 md:p-8 h-full flex flex-col">
          {/* Header with animated gradient border */}
          <div className="flex items-center mb-5 pb-4 border-b border-white/10 relative">
            <motion.div 
              className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: delay * 0.1 + 0.5 }}
            />
            
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${iconColor} bg-gradient-to-br from-white/20 to-white/5 shadow-lg border border-white/10`}>
              <FontAwesomeIcon icon={icon} className="text-2xl md:text-3xl" />
            </div>
            <h3 className="ml-4 text-xl md:text-2xl font-bold text-white tracking-wide">{title}</h3>
          </div>
          
          {/* Content with more space */}
          <div className="flex-grow overflow-y-auto px-2 pb-2">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 