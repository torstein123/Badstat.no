import React from 'react';
import { useParams, Link } from 'react-router-dom';
import data from './combined_rankings.json';
import { Line } from 'react-chartjs-2';
import './styles.css'; // Import the styles.css file

const PlayerDetail = () => {
  const { name } = useParams();
  const playerName = decodeURIComponent(name);
  const playerData = data.find((player) => player.Navn === playerName);

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
    const playersInYear = data.filter((player) => player[year] !== undefined);
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
        borderColor: 'rgba(75, 192, 192, 1)',
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
      <Link to="/" className="button-link">
        Tilbake
      </Link>

      <h1>{playerData.Navn}</h1>
      <p>
        {playerData.Navn} har {currentPoints} rankingpoeng, og
        er rangert som nummer {currentRank} i Norge. Beste år var i {bestYear} med{' '}
        {parseFloat(playerData[bestYear])} poeng.
      </p>

      {improvementArrow && (
        <div className="trend-container">
          <div className={`trend-arrow ${improvementArrow === '↑' ? 'green' : improvementArrow === '↓' ? 'red' : 'neutral'}`}>
            {improvementArrow}
          </div>
          <div className="trend-message">{improvementMessage}</div>
        </div>
      )}

<p>
  All-time rankingpoeng: {' '} {totalPoints.toFixed(0)} <br />
  Gjennomsnittlig rangering gjennom {validYears.length} år{' '}: {averageRank.toFixed(0)}. plass <br />
</p>



      <h2>Utvikling over tid</h2>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>

      <h2>Plasseringer</h2>
      <table className="rank-table">
        <thead>
          <tr>
            <th>År</th>
            <th>Plassering</th>
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
    </div>
  );
};

export default PlayerDetail;
