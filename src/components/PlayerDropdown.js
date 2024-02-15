import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import players from '../combined_rankings.json';

const PlayerDropdown = ({ onSelect }) => {
    const loadOptions = (inputValue, callback) => {
        // Simulate an API call or filter the players based on the inputValue.
        const filteredPlayers = players.filter(
            player => player['Navn'].toLowerCase().includes(inputValue.toLowerCase())
        );
        // Delay the response to give the user time to type.
        setTimeout(() => {
            callback(filteredPlayers.map(player => ({ value: player['Spiller-Id'], label: player['Navn'] })));
        }, 500); // Adjust the delay as needed.
    };

    // Custom styles to change text color
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            color: 'black', // Change text color here
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'black', // Change text color here
        }),
    };

    return (
        <AsyncSelect
            loadOptions={loadOptions}
            onChange={onSelect}
            defaultOptions={[]}
            cacheOptions
            styles={customStyles} // Apply custom styles
            placeholder="Skriv inn motstander..."
        />
    );
};

export default PlayerDropdown;
