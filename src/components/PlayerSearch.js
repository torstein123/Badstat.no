import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../combined_rankings.json';
import AsyncSelect from 'react-select/async';
import { motion } from 'framer-motion';
import AdSlot from './AdSlot';

const PlayerSearch = () => {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [resultCount1, setResultCount1] = useState(0);
  const [resultCount2, setResultCount2] = useState(0);
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

  const filterPlayers = useCallback((inputValue) => {
    // If input is empty or just spaces, return empty array
    if (!inputValue || inputValue.trim() === '') {
      return [];
    }
    
    // Filter players with improved matching
    const filteredPlayers = data
      .map(player => {
        const name = player.Navn;
        const similarity = stringSimilarity(name, inputValue);
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
  }, []);

  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      const results = filterPlayers(inputValue);
      callback(results);
    }, 150),
    [filterPlayers]
  );

  const handleChange1 = (selectedOption) => {
    setPlayer1(selectedOption);
    setResultCount1(selectedOption ? 1 : 0);
  };

  const handleChange2 = (selectedOption) => {
    setPlayer2(selectedOption);
    setResultCount2(selectedOption ? 1 : 0);
  };

  const handleCompare = () => {
    if (player1 && player2) {
      navigate(`/compare/${encodeURIComponent(player1.value)}/${encodeURIComponent(player2.value)}`);
    }
  };

  // Custom styles for react-select
  const customStyles = {
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
      color: '#ffffff !important',
      caretColor: '#ffffff',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-4">
            Head to Head
          </h1>
          <p className="text-gray-400 text-lg">
            Sammenlign spillere og utforsk deres historiske oppgjør
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-5/12">
                <AsyncSelect
                  loadOptions={loadOptions}
                  onChange={handleChange1}
                  value={player1}
                  defaultOptions={[]}
                  cacheOptions
                  styles={customStyles}
                  placeholder="Velg første spiller"
                  isClearable
                  isSearchable
                  blurInputOnSelect
                  noOptionsMessage={() => "Ingen spillere funnet"}
                  loadingMessage={() => "Søker..."}
                  minMenuHeight={100}
                  maxMenuHeight={300}
                  menuPlacement="auto"
                  openMenuOnClick={false}
                  openMenuOnFocus={false}
                />
              </div>
              
              <div className="flex items-center justify-center w-full md:w-2/12">
                <span className="text-2xl font-bold text-gray-400">VS</span>
              </div>

              <div className="w-full md:w-5/12">
                <AsyncSelect
                  loadOptions={loadOptions}
                  onChange={handleChange2}
                  value={player2}
                  defaultOptions={[]}
                  cacheOptions
                  styles={customStyles}
                  placeholder="Velg andre spiller"
                  isClearable
                  isSearchable
                  blurInputOnSelect
                  noOptionsMessage={() => "Ingen spillere funnet"}
                  loadingMessage={() => "Søker..."}
                  minMenuHeight={100}
                  maxMenuHeight={300}
                  menuPlacement="auto"
                  openMenuOnClick={false}
                  openMenuOnFocus={false}
                />
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleCompare}
                disabled={!player1 || !player2}
                className={`px-8 py-3 text-base font-medium rounded-lg transition-all duration-300 transform 
                  ${(!player1 || !player2) 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                  }`}
              >
                Sammenlign spillere
              </button>
            </div>
          </div>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}
        >
          <AdSlot 
            adSlot="7152830155" 
            adClient="ca-pub-6338038731129939"
          />
        </motion.div>

      </motion.div>
    </div>
  );
};

export default PlayerSearch;
