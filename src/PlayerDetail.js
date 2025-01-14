import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import data from './combined_rankings.json';
import dataDD from './combined_rankingsDD.json';
import dataDS from './combined_rankingsDS.json';
import dataHS from './combined_rankingsHS.json';
import dataHD from './combined_rankingsHD.json';
import dataMIX from './combined_rankingsMIX.json';
import clubLogos from './clubLogos.js'; // Adjust the path as necessary
import playerImages from './playerImages.js'; // Adjust the path as necessary

import { Line } from 'react-chartjs-2';
import PlayerRecentMatches from './components/PlayerRecentMatches';
import RankingsDisplay from './components/RankingDisplay'; // Adjust the path as necessary
import './PlayerDetail.css';
import AchievementsDisplay from './components/achievementsDisplay';
import achievementsConfig from './config/achievementsConfig';

const PlayerDetail = () => {
  const { name } = useParams();
  const playerName = decodeURIComponent(name);
  const [category, setCategory] = useState('Sammenlagt');

  // Define data based on selected category
  let categoryData = [];
  switch (category) {
    case 'Sammenlagt':
      categoryData = data;
      break;
    case 'single':
      categoryData = [...dataDS, ...dataHS];
      break;
    case 'double':
      categoryData = [...dataDD, ...dataHD];
      break;
    case 'mix':
      categoryData = dataMIX;
      break;
    default:
      categoryData = [...dataDS, ...dataHS]; // Default to single category
  }

  const playerData = categoryData.find((player) => player.Navn === playerName);

  if (!playerData) {
    return <p>Player not found</p>;
  }

  const allClubsArray = playerData['All Clubs'] ? playerData['All Clubs'].split('|') : [];

const currentClub = playerData['Current Club'];
  // Filter out the current club from the array
  const allClubsExceptCurrent = allClubsArray.filter(club => club !== currentClub);
  const logoComponents = allClubsExceptCurrent.map((club) => {
    const logoPath = clubLogos[club];
    return logoPath ? <img key={club} src={logoPath} alt={`${club} logo`} style={{ width: '50px', height: '50px', marginRight: '10px' }} /> : null;
  }).filter(component => component !== null); // This will filter out any clubs without a logo

  // Join the remaining clubs into a string, separated by your chosen delimiter (e.g., ", ")
  const clubsDisplayString = allClubsExceptCurrent.join(', ');

  const years = Object.keys(playerData)
    .filter((key) => key.match(/^\d{4}$/))
    .sort(); // Extract and sort years from playerData

  // Filter out years with 0 points
  const validYears = years.filter((year) => parseFloat(playerData[year]) > 0);

  // Determine the best year
  const bestYear = validYears.reduce((best, year) => {
    return parseFloat(playerData[year]) > parseFloat(playerData[best])
      ? year
      : best;
  }, validYears[0]);

  const rankData = validYears.map((year) => {
    const playersInYear = categoryData.filter((player) => player[year] !== undefined);
    const sortedPlayers = playersInYear.sort(
      (a, b) => parseFloat(b[year]) - parseFloat(a[year])
    );
    const playerRank = sortedPlayers.findIndex(
      (player) => player.Navn === playerName
    );
    return playerRank + 1;
  }).reverse(); // Reverse the rankData array

  const chartData = {
    labels: validYears.reverse(),
    datasets: [
      {
        label: 'Rank',
        data: rankData,
        fill: false,
        borderColor: '#ff79b0',
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            reverse: true,
            display: true,
            min: 1, // Set the lowest value on the y-axis to 1
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            reverse: true,
          },
        },
      ],
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let index = context.dataIndex;
            let dataset = context.dataset;
            if (dataset.label === 'Rank') {
              return `Rank: ${dataset.data[index]}`;
            } else {
              return `Points: ${dataset.data[index]}`;
            }
          },
        },
      },
      datalabels: {
        color: '#000000',
        font: {
          weight: 'bold',
        },
        formatter: function (value, context) {
          return context.dataset.label === 'Rank'
            ? `Rank: ${value}`
            : `Points: ${value}`;
        },
      },
    },
  };

  const totalPoints = validYears.reduce(
    (total, year) => total + parseFloat(playerData[year]),
    0
  );
  const averageRank =
    rankData.reduce((total, rank) => total + rank, 0) / rankData.length;
  const bestRank = Math.min(...rankData);
  const worstRank = Math.max(...rankData);

  const previousYear = '2023';
  const previousRank =
    rankData[validYears.indexOf(previousYear)] || rankData[rankData.length - 1];
  const currentYear = '2024';
  const currentRank = rankData[0];
  const rankChange = previousRank - currentRank;
  const previousPoints = parseFloat(playerData[previousYear] || 0); // Added this line
  const currentPoints = parseFloat(playerData[currentYear] || 0); // Added this line

  const pointsChange = currentPoints - previousPoints; // Calculate the change in points
  const pointsChangeMessage = pointsChange !== 0 ? `${Math.abs(pointsChange)} poeng` : ''; // Create a message for the change in points
  const bestRankIndex = rankData.indexOf(Math.min(...rankData));
  const worstRankIndex = rankData.indexOf(Math.max(...rankData));

  // Find the corresponding years for the best and worst rank
  const bestRankYear = validYears[bestRankIndex];
  const worstRankYear = validYears[worstRankIndex];

  let improvementArrow = '';
  let improvementMessage = '';

  if (currentPoints > previousPoints) {
    improvementArrow = '↑';
    improvementMessage = 'Fremgang';
  } else if (currentPoints < previousPoints) {
    improvementArrow = '↓';
    improvementMessage = 'Tilbakegang';
  } else {
    improvementArrow = '→';
    improvementMessage = 'Stabil';
  }

  const currentClubLogo = clubLogos[currentClub];
  const playerImage = playerImages[playerData['Spiller-Id']] || 'https://t3.ftcdn.net/jpg/03/20/77/16/360_F_320771622_DSGMf0UHsq9dLftVF42z0SmwzCK14Iq8.jpg';


  return (
    <div className="player-detail-container">
      
      <h1 id="name">{playerData.Navn}</h1>
      <div className="info-container">
        {currentClubLogo ? (
          <img src={currentClubLogo} alt={`${currentClub} logo`} className="club-logo" />
        ) : (
          <h2>{currentClub}</h2>
        )}
        {playerImage && (
          <img src={playerImage} alt={`${playerData.Navn}`} className="player-image" />
        )}
      </div>

      <div className="rank-box">
        <div className="points">
          <h1 style={{ color: '#5c5c5c' }}>POENG</h1>
          <h1 className="rank-points"> {currentPoints}</h1>
        </div>
        <div className="rank">
          <h1 style={{ color: '#5c5c5c' }}>RANK</h1>
          <h1 className="rank-points"> {currentRank}</h1>
        </div>
        <div className="best-placement">
          <h1 style={{ color: '#5c5c5c' }}>BESTE</h1>
          <h1 className="rank-points"> {bestRank}</h1>
        </div>
      </div>
      <div className="category-buttons">
        <button onClick={() => setCategory('Sammenlagt')}>Sammenlagt</button>
        <button onClick={() => setCategory('single')}>Single</button>
        <button onClick={() => setCategory('double')}>Double</button>
        <button onClick={() => setCategory('mix')}>Mix</button>
      </div>
      <h2>UTMERKELSER</h2>
      <AchievementsDisplay playerName={playerName} milestones={achievementsConfig.gameplayMilestones} />

      <h2>RANK</h2>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
      <h2>RANKINGLISTE</h2>
      <table className="rank-table">
        <thead>
          <tr>
            <th>År</th>
            <th>Rank</th>
            <th>Poeng</th>
          </tr>
        </thead>
        <tbody>
          {validYears.map((year) => (
            <tr key={year}>
              <td>{year}</td>
              <td>{rankData[validYears.indexOf(year)]}</td>
              <td>{parseFloat(playerData[year])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PlayerRecentMatches playerName={playerName} />
    </div>
  );
};

export default PlayerDetail;
