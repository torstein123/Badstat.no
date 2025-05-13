import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faBrain } from '@fortawesome/free-solid-svg-icons';
import achievementsConfig from '../config/achievementsConfig';
import processPlayerData from '../utils/processPlayerData';

const AchievementsDisplay = ({ playerName, milestones }) => {
  const playerData = processPlayerData(playerName);
  
  // Extract gameplay milestones and other achievements from the config
  const { gameplayMilestones, otherAchievements } = achievementsConfig;

  // Find the current gameplay milestone for the player
  const currentGameplayMilestoneIndex = gameplayMilestones.findIndex(milestone => playerData.gamesPlayed < milestone.gamesRequired);
  const currentGameplayMilestone = currentGameplayMilestoneIndex !== -1
    ? gameplayMilestones[currentGameplayMilestoneIndex]
    : gameplayMilestones[gameplayMilestones.length - 1];

  return (
    <div className="space-y-8">
      {/* Key Stats Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Nøkkelstatistikk</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white/5 rounded-xl p-4 border border-indigo-500/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/20">
                <FontAwesomeIcon 
                  icon={faBrain}
                  className="text-lg text-indigo-400"
                />
              </div>
              <div>
                <h4 className="font-medium text-white">3. sett seiersprosent</h4>
                <p className="text-2xl font-bold text-indigo-400">
                  {playerData.deciderWinRate.toFixed(1)}%
                </p>
                <p className="text-sm text-white/40">
                  {playerData.deciderWins} av {playerData.deciderMatches} kamper
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gameplay Milestones Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Spillermilestener</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameplayMilestones.map((milestone, index) => {
            const isAchieved = playerData.gamesPlayed >= milestone.gamesRequired;
            const isCurrent = milestone === currentGameplayMilestone;
            const progress = isCurrent ? (playerData.gamesPlayed / milestone.gamesRequired) * 100 : 100;

            return (
              <motion.div
                key={milestone.gamesRequired}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative bg-white/5 rounded-xl p-4 border ${
                  isAchieved ? 'border-indigo-500/50' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isAchieved ? 'bg-indigo-500/20' : 'bg-white/10'
                  }`}>
                    <FontAwesomeIcon 
                      icon={isAchieved ? milestone.icon : faLock} 
                      className={`text-lg ${isAchieved ? 'text-indigo-400' : 'text-white/40'}`} 
                    />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isAchieved ? 'text-white' : 'text-white/60'}`}>
                      {milestone.header}
                    </h4>
                    <p className="text-sm text-white/40">
                      {milestone.gamesRequired} kamper
                    </p>
                  </div>
                </div>
                
                {isCurrent && (
                  <div className="space-y-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-white/60">
                      {playerData.gamesPlayed} av {milestone.gamesRequired} kamper
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Other Achievements Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Spesielle Prestasjoner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherAchievements.map((achievement, index) => {
            const isAchieved = achievement.criteria ? achievement.criteria(playerData) : false;

            return (
              <motion.div
                key={achievement.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative bg-white/5 rounded-xl p-4 border ${
                  isAchieved ? 'border-indigo-500/50' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isAchieved ? 'bg-indigo-500/20' : 'bg-white/10'
                  }`}>
                    <FontAwesomeIcon 
                      icon={isAchieved ? achievement.icon : faLock} 
                      className={`text-lg ${isAchieved ? 'text-indigo-400' : 'text-white/40'}`} 
                    />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isAchieved ? 'text-white' : 'text-white/60'}`}>
                      {achievement.header}
                    </h4>
                    <p className="text-sm text-white/40">
                      {isAchieved ? 'Oppnådd' : 'Ikke oppnådd'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsDisplay;
