import React, { useEffect, useState, useContext } from 'react';
import { AuthenticationContext } from '../Auth-Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCalendarAlt, faStickyNote, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

function DiaryEntries({ userId, opponentSpillerId }) {
    const [entries, setEntries] = useState([]);
    const { fetchUserDiaryEntries } = useContext(AuthenticationContext);

    useEffect(() => {
        async function fetchEntries() {
            try {
                const entries = await fetchUserDiaryEntries(userId, opponentSpillerId);
                const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);
                setEntries(sortedEntries);
            } catch (error) {
                console.error("Failed to fetch diary entries:", error);
                setEntries([]);
            }
        }

        if (userId && opponentSpillerId) {
            fetchEntries();
        }
    }, [userId, opponentSpillerId, fetchUserDiaryEntries]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FontAwesomeIcon icon={faHistory} className="mr-2 text-blue-400" />
                Tidligere Analyser
            </h3>

            {entries.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400">Ingen tidligere analyser funnet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map((entry, index) => (
                        <div 
                            key={index} 
                            className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-center text-gray-400 text-sm mb-4">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                {formatDate(entry.timestamp)}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center text-blue-400 mb-2">
                                        <FontAwesomeIcon icon={faStickyNote} className="mr-2" />
                                        <h4 className="font-medium">Kampoppsummering</h4>
                                    </div>
                                    <p className="text-gray-300 pl-6">{entry.summary}</p>
                                </div>

                                <div>
                                    <div className="flex items-center text-green-400 mb-2">
                                        <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
                                        <h4 className="font-medium">Styrker</h4>
                                    </div>
                                    <p className="text-gray-300 pl-6">{entry.strengths}</p>
                                </div>

                                <div>
                                    <div className="flex items-center text-red-400 mb-2">
                                        <FontAwesomeIcon icon={faThumbsDown} className="mr-2" />
                                        <h4 className="font-medium">Svakheter</h4>
                                    </div>
                                    <p className="text-gray-300 pl-6">{entry.weaknesses}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DiaryEntries;
