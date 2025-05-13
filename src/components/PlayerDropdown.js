import React, { useState, useEffect, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import players from '../combined_rankings.json';

const PlayerDropdown = ({ onSelect }) => {
    const [isLoading, setIsLoading] = useState(false);
    
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

    // Memoized loadOptions function with debouncing
    const loadOptions = useCallback(
        debounce((inputValue, callback) => {
            setIsLoading(true);
            
            // If input is empty or just spaces, return empty array
            if (!inputValue || inputValue.trim() === '') {
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
                    value: item.player['Spiller-Id'], 
                    label: item.player['Navn'] 
                }))
                .slice(0, 10); // Limit to top 10 results for performance
            
            setIsLoading(false);
            callback(filteredPlayers);
        }, 150),
        []
    );

    // Custom styles to change text color
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: '#ffffff',
            backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            cursor: 'pointer',
            padding: '10px 16px',
            fontSize: '0.95rem',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#ffffff',
        }),
        input: (provided) => ({
            ...provided,
            color: '#ffffff !important',
            caretColor: '#ffffff',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(17, 24, 39)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            padding: 0,
            marginTop: '4px'
        }),
        menuList: (provided) => ({
            ...provided,
            padding: 0,
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
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(8px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.2)'
            },
            padding: '2px',
            minHeight: '44px'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'rgba(255, 255, 255, 0.5)',
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'transparent',
            padding: '10px 16px',
        }),
        loadingMessage: (provided) => ({
            ...provided,
            color: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'transparent',
            padding: '10px 16px',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
                color: 'rgba(255, 255, 255, 0.8)'
            }
        }),
        clearIndicator: (provided, state) => ({
            ...provided,
            color: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
                color: 'rgba(255, 255, 255, 0.8)'
            }
        })
    };

    return (
        <AsyncSelect
            loadOptions={loadOptions}
            onChange={onSelect}
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
    );
};

export default PlayerDropdown;
