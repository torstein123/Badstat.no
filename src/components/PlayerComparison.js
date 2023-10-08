import React from 'react';
import { useParams } from 'react-router-dom';
import data from '../combined_rankings.json';
import { Line } from 'react-chartjs-2';
import './PlayerComparison.css';
import HeadToHead from './headTohead';

const generateChartData = (playerData1, playerData2) => {
const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2021', '2022', '2023'];
const player1Scores = years.map(year => parseInt(playerData1[year]) || 0);
const player2Scores = years.map(year => parseInt(playerData2[year]) || 0);


  return {
    labels: years,
    datasets: [
      {
        label: playerData1.Navn,
        data: player1Scores,
        borderColor: 'purple',
        fill: false,
      },
      {
        label: playerData2.Navn,
        data: player2Scores,
        borderColor: '#0d6efd',
        fill: false,
      },
    ],
  };
};

const PlayerTable = ({ player1Data, player2Data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>År</th>
          <th>{player1Data.Navn}</th>
          <th>{player2Data.Navn}</th>
        </tr>
      </thead>
      <tbody>
        {/* Add comparison metrics here */}
        <tr>
  <td>2023</td>
  <td>{parseInt(player1Data['2023'])}</td>
  <td>{parseInt(player2Data['2023'])}</td>
</tr>
<tr>
  <td>2022</td>
  <td>{parseInt(player1Data['2022'])}</td>
  <td>{parseInt(player2Data['2022'])}</td>
</tr>
<tr>
  <td>2021</td>
  <td>{parseInt(player1Data['2021'])}</td>
  <td>{parseInt(player2Data['2021'])}</td>
</tr>
<tr>
  <td>2020</td>
  <td>{parseInt(player1Data['2020'])}</td>
  <td>{parseInt(player2Data['2020'])}</td>
</tr>
<tr>
  <td>2019</td>
  <td>{parseInt(player1Data['2019'])}</td>
  <td>{parseInt(player2Data['2019'])}</td>
</tr>
<tr>
  <td>2018</td>
  <td>{parseInt(player1Data['2018'])}</td>
  <td>{parseInt(player2Data['2018'])}</td>
</tr>
<tr>
  <td>2017</td>
  <td>{parseInt(player1Data['2017'])}</td>
  <td>{parseInt(player2Data['2017'])}</td>
</tr>
<tr>
  <td>2016</td>
  <td>{parseInt(player1Data['2016'])}</td>
  <td>{parseInt(player2Data['2016'])}</td>
</tr>
<tr>
  <td>2015</td>
  <td>{parseInt(player1Data['2015'])}</td>
  <td>{parseInt(player2Data['2015'])}</td>
</tr>
<tr>
  <td>2014</td>
  <td>{parseInt(player1Data['2014'])}</td>
  <td>{parseInt(player2Data['2014'])}</td>
</tr>
<tr>
  <td>2013</td>
  <td>{parseInt(player1Data['2013'])}</td>
  <td>{parseInt(player2Data['2013'])}</td>
</tr>


        {/* Add more rows as needed */}
      </tbody>
    </table>
  );
};

const PlayerChart = ({ player1Data, player2Data }) => {
  return (
    <div>
      <h3>Historisk oversikt</h3>
      <Line data={generateChartData(player1Data, player2Data)} />
    </div>
  );
};

const PlayerComparison = () => {
  const { player1, player2 } = useParams();
  const player1Data = data.find(player => player.Navn === decodeURIComponent(player1));
  const player2Data = data.find(player => player.Navn === decodeURIComponent(player2));

  if (!player1Data || !player2Data) {
    return <p>En eller begge spillerne er ikke funnet</p>;
  }


  return (
    <>
      <div className="player-comparison">
        <h1></h1>
        <h2>{player1Data.Navn} VS {player2Data.Navn}</h2>
        <h5>Rankingpoeng</h5>
        <PlayerTable player1Data={player1Data} player2Data={player2Data} />
        <PlayerChart player1Data={player1Data} player2Data={player2Data} />
      </div>
      <div className="App">
        <h2>Kamper spilt mot hverandre</h2>
        <HeadToHead />
      </div>
    </>
  );
};
export default PlayerComparison