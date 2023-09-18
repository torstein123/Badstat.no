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

  const previousYear = '2021';
  const previousRank =
    rankData[validYears.indexOf(previousYear)] || rankData[rankData.length - 1];
  const currentYear = '2022';
  const currentRank = rankData[0];
  const currentPoints = parseFloat(playerData[currentYear]);
  const rankChange = previousRank - currentRank;
  const rankChangeMessage =
    rankChange > 0 ? `(+${rankChange})` : ` (-${Math.abs(rankChange)})`;

  let improvementArrow = '';
  let improvementMessage = '';

  if (previousRank !== currentRank) {
    improvementArrow = previousRank > currentRank ? '↑' : '↓';
    improvementMessage =
      previousRank > currentRank ? 'Positiv trend' : 'Negativ trend';
  }

  return (
    <div className="player-detail-container">
      <Link to="/" className="button-link">
        Tilbake
      </Link>

      <h1>{playerData.Navn}</h1>
      <p>
        {playerData.Navn} har {currentPoints} rankingpoeng i {currentYear} og
        er rangert som nummer {currentRank} i Norge, på tvers av alle klasser.
        {playerData.Navn}s beste år var i {bestYear} hvor med{' '}
        {parseFloat(playerData[bestYear])} poeng.
      </p>

      {improvementArrow && (
        <div className="trend-container">
          <div
            className={`trend-arrow ${improvementArrow === '↑' ? 'green' : 'red'}`}
          >
            {improvementArrow}
          </div>
          <div className="trend-message">{improvementMessage}</div>
          {rankChange !== 0 && (
            <div className="rank-change">{rankChangeMessage}</div>
          )}
        </div>
      )}

      <p>
        Over {validYears.length} år har {playerData.Navn} samlet opp totalt{' '}
        {totalPoints.toFixed(0)} poeng, med en gjennomsnittlig årlig rangering på{' '}
        {averageRank.toFixed(0)}.
        Beste rangering var {bestRank} og dårligste rangering var{' '}
        {worstRank}.
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
      <p> Sist oppdatert 26/05/2023</p>
    </div>
  );
};

export default PlayerDetail;
