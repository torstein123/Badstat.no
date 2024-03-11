import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import './achievementBadge.css';

const AchievementBadge = ({ achievement, milestones, playerData }) => {
  const [showModal, setShowModal] = useState(false);

  let animationClass = '';

if (achievement && achievement.animation && achievement.animation !== 'none') {
  animationClass = achievement.animation === 'burning-flames' ? 'burning-flames-animation' : 'shining-stars-animation';
}


  if (milestones && milestones.length > 0) {
    let currentMilestone = null;
    let nextMilestone = null;

    for (let i = 0; i < milestones.length; i++) {
      if (playerData.gamesPlayed < milestones[i].gamesRequired) {
        nextMilestone = milestones[i];
        break;
      }
      currentMilestone = milestones[i];
    }

    let progressToNextMilestone = 0;

    if (currentMilestone) {
      if (nextMilestone) {
        progressToNextMilestone = ((playerData.gamesPlayed - currentMilestone.gamesRequired) / (nextMilestone.gamesRequired - currentMilestone.gamesRequired)) * 100;
        if (progressToNextMilestone < 0) {
          progressToNextMilestone = 0;
        }
      } else {
        progressToNextMilestone = 100; // Player has reached the maximum milestone
      }
    }

    return (
      <>
        <div className={`achievement-badge ${!currentMilestone ? 'locked' : ''} ${animationClass}`} style={{ backgroundColor: currentMilestone ? currentMilestone.badgeColor : '#ccc' }} onClick={() => setShowModal(true)}>
          <div className="badge-header">{currentMilestone ? currentMilestone.header : "Locked"}</div>
          <FontAwesomeIcon icon={currentMilestone ? currentMilestone.icon : faLock} size="2x" />
          {currentMilestone && nextMilestone && (
            <>
              <div className="progress-bar-container">
                <ProgressBar now={Math.min(progressToNextMilestone, 100)} variant="info" label={`${Math.round(progressToNextMilestone)}%`} />
              </div>
              <div className="next-milestone">
                Neste: {nextMilestone ? nextMilestone.header : "Max Level"}
              </div>
            </>
          )}
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{currentMilestone ? currentMilestone.description : "Locked"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Additional details about the milestone */}
          </Modal.Body>
        </Modal>
      </>
    );
  } else if (achievement) {
    const isAchieved = achievement.criteria ? achievement.criteria(playerData) : false;
    const gamesAffected = playerData.comebackGames; // Assuming this property exists in playerData

    return (
      <>
        <div className={`achievement-badge ${isAchieved ? '' : 'locked'} ${animationClass}`} style={{ backgroundColor: isAchieved ? achievement.badgeColor : '#ccc' }} onClick={() => setShowModal(true)}>
          <div className="badge-header">{achievement.header}</div>
          <FontAwesomeIcon icon={isAchieved ? achievement.icon : faLock} size="2x" />
          {!isAchieved && <div className="achievement-locked">Låst</div>}
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{achievement.header}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{achievement.description}</p>
            {isAchieved && achievement.header === "Tidenes comeback" && (
              <p>Har blitt oppnådd {playerData.comebackGames}, {comebackWin},
              {comebackWinScores}, gang(er).</p>
            )}
            {isAchieved && achievement.header === "Sterk i 3.sett" && (
              <p>Kamper vunnet i 3. sett: {playerData.strongThirdSetPercentage}%</p>
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }

  return <div>Invalid Achievement Data</div>;
};

export default AchievementBadge;
