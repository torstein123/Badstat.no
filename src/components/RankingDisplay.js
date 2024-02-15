import React from 'react';

const RankingsDisplay = ({ singlesRank, doublesRank, mixedDoublesRank }) => (
  <div className="rankings-display">
    <div className="ranking-category singles">
      <span className="category-title">Singles</span>
      <span className="ranking-value">{singlesRank}</span>
    </div>
    <div className="ranking-category doubles">
      <span className="category-title">Doubles</span>
      <span className="ranking-value">{doublesRank}</span>
    </div>
    <div className="ranking-category mixed-doubles">
      <span className="category-title">Mixed Doubles</span>
      <span className="ranking-value">{mixedDoublesRank}</span>
    </div>
  </div>
);

export default RankingsDisplay;
