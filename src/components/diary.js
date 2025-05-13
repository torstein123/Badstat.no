import React, { useState, useContext, useEffect } from 'react';
import DiaryForm from './DiaryForm';
import DiaryEntries from './DiaryEntries';
import PlayerDropdown from './PlayerDropdown';
import { AuthenticationContext } from '../Auth-Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faSearch, faChartLine, faLock, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Diary = () => {
    const [selectedOpponent, setSelectedOpponent] = useState(null);
    const [refreshEntries, setRefreshEntries] = useState(false);
    const { user } = useContext(AuthenticationContext);

    useEffect(() => {
        if (user && !user.uid) {
            console.error("No userId available.");
        }
    }, [user]);

    const handleOpponentSelect = (selected) => {
        console.log('Opponent selected:', selected);
        setSelectedOpponent(selected);
    };
    
    const handleEntryAdded = () => {
        setRefreshEntries(!refreshEntries);
    };

    const features = [
        {
            icon: faSearch,
            title: "Søk og Analyser",
            description: "Finn enkelt tidligere motstandere og analyser deres spillestil"
        },
        {
            icon: faBook,
            title: "Loggfør og Lær",
            description: "Hold oversikt over kamper og trekk lærdom av hver erfaring"
        },
        {
            icon: faChartLine,
            title: "Utvikle og Forbedre",
            description: "Se din egen utvikling og forbered deg bedre til neste kamp"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        BadmintonDagbok 📝
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        Analysere. Forbedre. Dominere.
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl mb-8">
                    {user && user.uid ? (
                        <div>
                            <div className="flex items-center space-x-2 mb-6">
                                <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-blue-400" />
                                <span className="text-white">Logget inn som {user.email}</span>
                            </div>
                            <div className="mb-6">
                                <PlayerDropdown onSelect={handleOpponentSelect} />
                            </div>
                            {selectedOpponent && (
                                <div className="space-y-6">
                                    <DiaryForm 
                                        userId={user.uid} 
                                        opponentSpillerId={selectedOpponent.value} 
                                        onEntryAdded={handleEntryAdded} 
                                    />
                                    <DiaryEntries 
                                        userId={user.uid} 
                                        opponentSpillerId={selectedOpponent.value} 
                                        key={refreshEntries} 
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FontAwesomeIcon icon={faLock} className="text-4xl text-gray-400 mb-4" />
                            <p className="text-xl text-gray-300">Logg inn for å bruke BadmintonDagboka</p>
                        </div>
                    )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                            <FontAwesomeIcon icon={feature.icon} className="text-3xl text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-300">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Information Section */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Om BadmintonDagboka</h2>
                    <div className="space-y-6 text-gray-300">
                        <p>
                            BadmintonDagboka er en skreddersydd løsning for spillere som ønsker å ta spillet sitt til neste nivå. 
                            Den fungerer som din personlige, digitale treningsdagbok med fokus på badminton.
                        </p>
                        
                        <div className="bg-white/5 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Slik bruker du BadmintonDagboka:</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Skriv inn navnet på motstanderen din, og trykk på navnet</li>
                                <li>Register en oppsummering, samt mostanderens styrker og svakheter etter hver kamp</li>
                                <li>Se dine tidligere logger, for å best mulig forberede deg til neste gang</li>
                            </ul>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                            <FontAwesomeIcon icon={faLock} className="text-blue-400" />
                            <span>All data er sikret og personlig, og kun tilgjengelig for deg.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;
