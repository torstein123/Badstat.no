import React from 'react';
import achievementsConfig from '../config/achievementsConfig';
import AchievementBadge from './achievementBadge'; // Ensure this path is correct
import processPlayerData from '../utils/processPlayerData'; // Adjust the import path as necessary

const AchievementsDisplay = ({ playerName, milestones }) => {
  const playerData = processPlayerData(playerName);
  
  // Extract gameplay milestones and other achievements from the config
  const { gameplayMilestones, otherAchievements } = achievementsConfig;

  // Find the current gameplay milestone for the player
  const currentGameplayMilestoneIndex = gameplayMilestones.findIndex(milestone => playerData.gamesPlayed < milestone.gamesRequired);
  const currentGameplayMilestone = currentGameplayMilestoneIndex !== -1
    ? gameplayMilestones[currentGameplayMilestoneIndex]
    : gameplayMilestones[gameplayMilestones.length - 1]; // Last milestone if all are achieved

    return (
      <div className="achievements-container">
        {/* Display dynamic gameplay achievement */}
        {milestones && (
          <AchievementBadge
            milestones={gameplayMilestones}
            playerData={playerData}
          />
        )}
        
        {/* Display other achievements */}
        {achievementsConfig.otherAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            playerData={playerData}
          />
        ))}
      </div>
    );
  };

export default AchievementsDisplay;
