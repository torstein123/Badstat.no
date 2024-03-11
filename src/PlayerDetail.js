import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import data from './combined_rankings.json';
import dataDD from './combined_rankingsDD.json';
import dataDS from './combined_rankingsDS.json';
import dataHS from './combined_rankingsHS.json';
import dataHD from './combined_rankingsHD.json';
import dataMIX from './combined_rankingsMIX.json';
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

  const previousYear = '2022';
  const previousRank =
    rankData[validYears.indexOf(previousYear)] || rankData[rankData.length - 1];
  const currentYear = '2023';
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

  return (
    <div className="player-detail-container">
      
      <h1 id="name">{playerData.Navn}</h1>
      <div className="category-buttons">
        <button onClick={() => setCategory('Sammenlagt')}>Sammenlagt</button>
        <button onClick={() => setCategory('single')}>Single</button>
        <button onClick={() => setCategory('double')}>Double</button>
        <button onClick={() => setCategory('mix')}>Mix</button>
      </div>
      <div className="rank-box">
        <div className="points">
          <h1 style={{ color: '#5c5c5c' }}>POENG</h1>
          <h1> {currentPoints}</h1>
        </div>
        <div className="rank">
          <h1 style={{ color: '#5c5c5c' }}>RANK</h1>
          <h1> {currentRank}</h1>
        </div>
        <div className="best-placement">
          <h1 style={{ color: '#5c5c5c' }}>🏅</h1>
          <h1> {bestRank}</h1>
        </div>
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
