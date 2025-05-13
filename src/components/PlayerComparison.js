import React from 'react';
import { useParams } from 'react-router-dom';
import data from '../combined_rankings.json';
import { Line } from 'react-chartjs-2';
import HeadToHead from './headTohead.js' ;
import { motion } from 'framer-motion';
import AdSlot from './AdSlot';

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
                borderColor: '#3b82f6', // Tailwind blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#3b82f6',
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: playerData2.Navn,
                data: player2Scores,
                borderColor: '#ec4899', // Tailwind pink-500
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#ec4899',
                pointRadius: 4,
                tension: 0.4,
            },
        ],
    };
};

const PlayerTable = ({ player1Data, player2Data }) => {
    return (
        <div className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden mt-8">
            <table className="w-full">
                <thead>
                    <tr className="bg-white/20">
                        <th className="px-6 py-4 text-left text-sm font-medium text-white uppercase tracking-wider">År</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-blue-300 uppercase tracking-wider">{player1Data.Navn}</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-pink-300 uppercase tracking-wider">{player2Data.Navn}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013'].map((year) => (
                        <motion.tr
                            key={year}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="transition-colors hover:bg-white/10"
                        >
                            <td className="px-6 py-4 text-sm text-white font-medium">{year}</td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-sm font-medium text-blue-300">
                                    {parseInt(player1Data[year]) || '-'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-sm font-medium text-pink-300">
                                    {parseInt(player2Data[year]) || '-'}
                                </span>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PlayerChart = ({ player1Data, player2Data }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#4B5563', // text-gray-600
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#4B5563',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#4B5563',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8"
        >
            <h3 className="text-xl font-medium text-gray-300 mb-6 text-center">
                Historisk oversikt
            </h3>
            <div className="p-4">
                <Line data={generateChartData(player1Data, player2Data)} options={options} />
            </div>
        </motion.div>
    );
};

const PlayerComparison = () => {
    const { player1, player2 } = useParams();
    const player1Data = data.find(player => player.Navn === decodeURIComponent(player1));
    const player2Data = data.find(player => player.Navn === decodeURIComponent(player2));

    if (!player1Data || !player2Data) {
        return (
            <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-gray-400">En eller begge spillerne er ikke funnet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <HeadToHead />
                
                {/* --- Ad Slot 1 --- */}
                <div style={{ marginTop: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
                    <AdSlot 
                        adSlot="7152830155" 
                        adClient="ca-pub-6338038731129939"
                    />
                </div>
                
                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">
                        Rankingpoeng
                    </h2>
                    <PlayerChart player1Data={player1Data} player2Data={player2Data} />
                    <PlayerTable player1Data={player1Data} player2Data={player2Data} />

                    {/* --- Ad Slot 2 --- */}
                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                        <AdSlot 
                            adSlot="7152830155" 
                            adClient="ca-pub-6338038731129939"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerComparison