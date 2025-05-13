import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faMedal, faAward, faStar, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import RankInfoModal from './RankInfoModal';
import AdSlot from './AdSlot';
import './RankingDisplay.css';

const RankingsDisplay = ({ singlesRank, doublesRank, mixedDoublesRank }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRankStyle = (rank) => {
    if (!rank) return 'standard';
    if (rank <= 3) return 'elite';
    if (rank <= 10) return 'premium';
    return 'standard';
  };

  const getRankIcon = (rank) => {
    if (!rank) return null;
    if (rank === 1) return <FontAwesomeIcon icon={faTrophy} className="text-yellow-300" />;
    if (rank === 2) return <FontAwesomeIcon icon={faMedal} className="text-gray-300" />;
    if (rank === 3) return <FontAwesomeIcon icon={faAward} className="text-amber-600" />;
    if (rank <= 10) return <FontAwesomeIcon icon={faStar} className="text-blue-300" />;
    return null;
  };

  const RankingCategory = ({ title, rank }) => {
    const style = getRankStyle(rank);
    const icon = getRankIcon(rank);

    return (
      <motion.div
        className={`ranking-category ${style}`}
        whileHover={{ scale: style !== 'standard' ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="ranking-header">
          <span className="category-title">{title}</span>
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rank-icon"
            >
              {icon}
            </motion.div>
          )}
        </div>
        <motion.div 
          className="ranking-value-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="ranking-value">{rank || '-'}</span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="info-button"
            aria-label="Om BadStat Ranking"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-indigo-300" />
          </button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="rankings-display">
        <RankingCategory title="Singles" rank={singlesRank} />
        <RankingCategory title="Doubles" rank={doublesRank} />
        <RankingCategory title="Mixed Doubles" rank={mixedDoublesRank} />
      </div>
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <AdSlot 
          adSlot="7152830155" 
          adClient="ca-pub-6338038731129939"
        />
      </div>
      <RankInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default RankingsDisplay;
