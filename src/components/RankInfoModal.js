import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './RankInfoModal.css';

const RankInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
        >
          <button className="close-button" onClick={onClose}>×</button>
          <div className="rank-info">
            <h2 className="flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="text-indigo-400" />
              Om BadStat Ranking
            </h2>
            <p>
              Dette er ikke din offisielle rank, men BadStat's vurdering av din spillstyrke basert på:
            </p>
            <ul>
              <li>Turneringsresultater</li>
              <li>Spillernivå i kamper</li>
              <li>Historisk ytelse</li>
              <li>Head-to-head statistikk</li>
            </ul>
            <p>
              <strong>Merk:</strong> BadStat's ranking er en indikator på spillstyrke og kan variere fra offisiell ranking.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RankInfoModal; 