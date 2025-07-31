import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPlayers } from '../services/databaseService';
import AsyncSelect from 'react-select/async';
import { motion } from 'framer-motion';
import AdSlot from './AdSlot';

const PlayerSearch = React.memo(() => {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [resultCount1, setResultCount1] = useState(0);
  const [resultCount2, setResultCount2] = useState(0);
  const navigate = useNavigate();
  
  // Use refs to store stable functions
  const debounceRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Create a stable debounce function
  const createDebounce = useMemo(() => {
    return (func, wait) => {
      return (...args) => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => func(...args), wait);
      };
    };
  }, []);

  // Stable string similarity function
  const calculateSimilarity = useCallback((str1, str2) => {
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
  }, []);

  // Stable filter function
  const filterPlayers = useCallback(async (inputValue) => {
    // If input is empty or just spaces, return empty array
    if (!inputValue || inputValue.trim() === '') {
      return [];
    }
    
    try {
      // Search players from database
      const players = await searchPlayers(inputValue);
      
      // Filter players with improved matching
      const filteredPlayers = players
        .map(player => {
          const name = player.Navn;
          const similarity = calculateSimilarity(name, inputValue);
          return { player, similarity };
        })
        .filter(item => item.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .map(item => ({ 
          value: item.player.Navn, 
          label: item.player.Navn 
        }))
        .slice(0, 10); // Limit to top 10 results for performance
      
      return filteredPlayers;
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }, [calculateSimilarity]);

  // Create stable loadOptions function
  const loadOptions = useMemo(() => {
    if (!debounceRef.current) {
      debounceRef.current = createDebounce((inputValue, callback) => {
        filterPlayers(inputValue).then(results => {
          callback(results);
        });
      }, 400); // Increased debounce time to 400ms
    }
    return debounceRef.current;
  }, [createDebounce, filterPlayers]);

  const handleChange1 = useCallback((selectedOption) => {
    setPlayer1(selectedOption);
    setResultCount1(selectedOption ? 1 : 0);
  }, []);

  const handleChange2 = useCallback((selectedOption) => {
    setPlayer2(selectedOption);
    setResultCount2(selectedOption ? 1 : 0);
  }, []);

  const handleCompare = useCallback(() => {
    if (player1 && player2) {
      navigate(`/compare/${encodeURIComponent(player1.value)}/${encodeURIComponent(player2.value)}`);
    }
  }, [player1, player2, navigate]);

  // Custom styles for react-select
  const customStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      background: 'rgba(17, 24, 39, 0.8)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(96, 165, 250, 0.4)' : 'none',
      padding: '4px',
      cursor: 'text',
      '&:hover': {
        borderColor: '#60a5fa'
      },
      minWidth: '300px',
      '@media (max-width: 640px)': {
        minWidth: '100%',
      }
    }),
    menu: (base) => ({
      ...base,
      background: 'rgba(31, 41, 55, 0.98)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
      color: state.isFocused ? '#ffffff' : '#d1d5db',
      '&:hover': {
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        color: '#ffffff'
      },
      cursor: 'pointer',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#ffffff',
    }),
    input: (base) => ({
      ...base,
      color: '#ffffff',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Basert på 174.000 kamper siden 2013
            </h1>
            <h2 className="text-2xl text-gray-300 mb-8">Spillersøk</h2>
            <p className="text-lg text-gray-400 mb-8">
              Søk blant alle spillere i Norge
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Søk etter spillernavn...
                </label>
                <AsyncSelect
                  value={player1}
                  onChange={handleChange1}
                  loadOptions={loadOptions}
                  placeholder="Skriv spillernavn..."
                  styles={customStyles}
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions
                  loadingMessage={() => "Søker..."}
                  noOptionsMessage={() => "Ingen spillere funnet"}
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Søk etter spillernavn...
                </label>
                <AsyncSelect
                  value={player2}
                  onChange={handleChange2}
                  loadOptions={loadOptions}
                  placeholder="Skriv spillernavn..."
                  styles={customStyles}
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions
                  loadingMessage={() => "Søker..."}
                  noOptionsMessage={() => "Ingen spillere funnet"}
                />
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleCompare}
                disabled={!player1 || !player2}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  player1 && player2
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Sammenlign Spillere
              </button>
            </div>

            <div className="mt-8 text-center text-gray-400">
              <p>Velg to spillere for å sammenligne deres statistikk</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default PlayerSearch;
