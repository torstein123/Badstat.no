import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import players from '../combined_rankings.json';
import './PlayerList.css'; // Import the CSS file

const PlayerList = () => {
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add isLoading state
    const navigate = useNavigate(); // Create a navigate function

    const loadOptions = (inputValue, callback) => {
        setIsLoading(true); // Set isLoading to true when loading starts
        // Simulate an API call or filter the players based on the inputValue.
        const filteredPlayers = players.filter(
            player => player['Navn'].toLowerCase().includes(inputValue.toLowerCase())
        );
        // Delay the response to give the user time to type.
        setTimeout(() => {
            setIsLoading(false); // Set isLoading to false when loading finishes
            callback(filteredPlayers.map(player => ({ value: player['Navn'], label: player['Navn'] })));
        }, 500); // Adjust the delay as needed.
    };

    const handleSelect = (selectedOption) => {
        setSearch(selectedOption.value);
        setIsLoading(true); // Set isLoading to true when navigating starts
        // Navigate to the player's page when a suggestion is selected
        setTimeout(() => {
            setIsLoading(false); // Set isLoading to false after navigating
            navigate(`/player/${encodeURIComponent(selectedOption.value)}`);
        }, 500); // Simulate navigation delay
    };

    // Custom styles to change text color
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: 'black', // Text color for options
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'black', // Text color for the selected item
        }),
        control: (provided, state, base) => ({
            ...provided,
            borderColor: '#5c5c5c', // Pink color for the border
            '&:hover': {
                borderColor: state.isFocused ? '#FF4081' : '#5c5c5c', // Lighter pink on hover or focus
            },
            borderWidth: '2px',
            boxShadow: 'none',
            cursor: 'text', // Add this line to change the cursor
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#5c5c5c', // Using --text-200 for placeholder text color
        }),
    };
    
    return (
        <div className="PlayerList">
            <h1>Søk opp spiller🏸</h1>
            <AsyncSelect
                loadOptions={loadOptions}
                onChange={handleSelect}
                value={search ? { value: search, label: search } : null}
                defaultOptions={[]}
                cacheOptions
                styles={customStyles} // Apply custom styles
                placeholder="Spillernavn" // Add the placeholder here
                isLoading={isLoading} // Pass isLoading state to AsyncSelect
                loadingMessage={() => "Loading..."} // Customize loading message
            />
        </div>
    );
};

export default PlayerList;
