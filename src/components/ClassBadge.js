import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import RankInfoModal from './RankInfoModal';
import './ClassBadge.css';

const ClassBadge = ({ playerClass }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div 
        className={`class-badge ${playerClass.toLowerCase()} px-6 py-2.5 rounded-xl inline-flex items-center gap-3 transform hover:scale-105 transition-all duration-300 cursor-pointer relative group`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsModalOpen(true)}
      >
        <span className="text-sm text-gray-300 uppercase tracking-wider">Klasse</span>
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${
            playerClass === 'Elite' 
              ? 'animate-rainbow-text' 
              : playerClass === 'A'
              ? 'text-blue-300'
              : playerClass === 'B'
              ? 'text-yellow-300'
              : 'text-gray-300'
          }`}>
            {playerClass}
            {playerClass === 'Elite' && (
              <span className="ml-2 inline-block animate-bounce-subtle">👑</span>
            )}
            {playerClass === 'A' && (
              <span className="ml-2 inline-block">⭐</span>
            )}
          </span>
          <motion.div 
            className="info-icon-wrapper opacity-60 group-hover:opacity-100 transition-opacity duration-200 ml-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon 
              icon={faInfoCircle} 
              className="text-indigo-300 text-base"
            />
          </motion.div>
        </div>
      </motion.div>
      <RankInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default ClassBadge; 