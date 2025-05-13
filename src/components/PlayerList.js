import React, { useState, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom';
import players from '../combined_rankings.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faTableTennis, faChartLine, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import ShuttlecockIcon from './ShuttlecockIcon';
import AdSlot from './AdSlot';

const PlayerList = () => {
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultCount, setResultCount] = useState(0);
    const navigate = useNavigate();

    // Function to calculate string similarity with improved matching
    const stringSimilarity = (str1, str2) => {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        // Direct match check
        if (s1 === s2) return 1;
        if (s1.includes(s2) || s2.includes(s1)) return 0.95;
        
        // Split into words for better matching
        const words1 = s1.split(/\s+/).filter(w => w.length > 0);
        const words2 = s2.split(/\s+/).filter(w => w.length > 0);
        
        // If either string is empty after filtering, return 0
        if (words1.length === 0 || words2.length === 0) return 0;
        
        // Check if all words from the search query are contained in the player name
        const allWordsMatch = words1.every(word1 => 
            words2.some(word2 => word2.includes(word1) || word1.includes(word2))
        );
        
        if (allWordsMatch) return 0.9;
        
        // Check for partial word matches
        let matchCount = 0;
        for (const word1 of words1) {
            for (const word2 of words2) {
                if (word1.includes(word2) || word2.includes(word1)) {
                    matchCount++;
                    break;
                }
            }
        }
        
        // Calculate similarity based on how many words match
        if (matchCount > 0) {
            return 0.7 + (matchCount / Math.max(words1.length, words2.length)) * 0.2;
        }
        
        return 0;
    };

    // Debounce function to prevent excessive searches
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const loadOptions = useCallback(
        debounce((inputValue, callback) => {
            setIsLoading(true);
            
            // If input is empty or just spaces, return empty array
            if (!inputValue || inputValue.trim() === '') {
                setResultCount(0);
                setIsLoading(false);
                callback([]);
                return;
            }
            
            // Filter players with improved matching
            const filteredPlayers = players
                .map(player => {
                    const name = player['Navn'];
                    const similarity = stringSimilarity(name, inputValue);
                    return { player, similarity };
                })
                .filter(item => item.similarity > 0)
                .sort((a, b) => b.similarity - a.similarity)
                .map(item => ({ 
                    value: item.player['Navn'], 
                    label: item.player['Navn'],
                    data: item.player // Store full player data
                }));
            
            // Update result count
            setResultCount(filteredPlayers.length);
            
            // Limit to top 10 results for performance
            const limitedResults = filteredPlayers.slice(0, 10);
            
            setIsLoading(false);
            callback(limitedResults);
        }, 150),
        []
    );

    const handleSelect = (selectedOption) => {
        if (!selectedOption) return;
        setSearch(selectedOption.value);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate(`/player/${encodeURIComponent(selectedOption.value)}`);
        }, 300);
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: state.isFocused ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)',
            borderWidth: '2px',
            borderRadius: '1rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.4)' : 'none',
            '&:hover': {
                borderColor: '#4f46e5',
                boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)'
            },
            padding: '0.75rem',
            paddingLeft: '3rem',
            cursor: 'text',
            transition: 'all 0.2s ease',
            fontSize: '1.1rem'
        }),
        input: (provided) => ({
            ...provided,
            color: '#fff !important',
            caretColor: '#fff',
            fontSize: '1.1rem'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.1rem'
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#fff',
            fontSize: '1.1rem'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ':active': {
                backgroundColor: 'rgba(79, 70, 229, 0.3)'
            },
            padding: '12px 16px',
            fontSize: '1.05rem',
            '&:hover': {
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(17, 24, 39)',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0.5rem',
            '&::-webkit-scrollbar': {
                width: '4px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
            },
        }),
        loadingMessage: (provided) => ({
            ...provided,
            color: '#fff',
            backgroundColor: 'transparent',
            fontSize: '1.05rem'
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#fff',
            backgroundColor: 'transparent',
            fontSize: '1.05rem'
        })
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <ShuttlecockIcon className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" color="currentColor" />
                    <p className="text-gray-300">Laster spillere...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-24 px-4 pb-12">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block p-2 px-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                        <ShuttlecockIcon className="w-5 h-5 inline-block mr-2 animate-spin" color="currentColor" />
                        Basert på 174.000 kamper siden 2013
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Spillersøk
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Søk blant alle spillere i Norge
                    </p>
                </motion.div>

                {/* Search Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative w-full max-w-2xl mx-auto"
                >
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                        {isLoading ? (
                            <FontAwesomeIcon 
                                icon={faSpinner} 
                                className="w-5 h-5 text-indigo-400 animate-spin" 
                            />
                        ) : (
                            <FontAwesomeIcon 
                                icon={faSearch} 
                                className="w-5 h-5 text-indigo-400" 
                            />
                        )}
                    </div>
                    <AsyncSelect
                        loadOptions={loadOptions}
                        onChange={handleSelect}
                        value={search ? { value: search, label: search } : null}
                        defaultOptions={[]}
                        cacheOptions
                        styles={customStyles}
                        placeholder="Søk etter spillernavn..."
                        isLoading={isLoading}
                        loadingMessage={() => "Søker..."}
                        noOptionsMessage={() => "Ingen spillere funnet"}
                        className="player-select"
                        classNamePrefix="player-select"
                        components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                        }}
                        isClearable
                        isSearchable
                        blurInputOnSelect
                        minMenuHeight={100}
                        maxMenuHeight={300}
                        menuPlacement="auto"
                        openMenuOnClick={false}
                        openMenuOnFocus={false}
                    />
                </motion.div>

                {/* Ad Slot moved below the search bar */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}
                >
                    <AdSlot 
                        adSlot="7152830155" 
                        adClient="ca-pub-6338038731129939"
                    />
                </motion.div>

                {/* Features Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
                >
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:bg-white/15">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faTrophy} className="text-2xl text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">Se Ranking</h3>
                        <p className="text-gray-300 leading-relaxed">
                            Se nåværende spillerrankinger og følg deres posisjon i den nasjonale rangeringen
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:bg-white/15">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <ShuttlecockIcon className="w-6 h-6 text-indigo-400" color="currentColor" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">Se Alle Kamper</h3>
                        <p className="text-gray-300 leading-relaxed">
                            Tilgang til komplett kamphistorikk inkludert resultater, motstandere og turneringsdetaljer
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:bg-white/15">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faChartLine} className="text-2xl text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">Historisk Data</h3>
                        <p className="text-gray-300 leading-relaxed">
                            Utforsk spillerprestasjoner og statistikk over tid
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default PlayerList;

