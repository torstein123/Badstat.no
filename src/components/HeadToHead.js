import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './headTohead.css';
import HeadToHeadStats from './HeadToHeadStats'; // Import the new component

function HeadToHead() {
    const [allMatches, setAllMatches] = useState([]);
    const { player1, player2 } = useParams();

    const headToHeadMatches = useMemo(() => {
        return allMatches.filter(match => (
            (match["Team 1 Player 1"] === player1 || match["Team 1 Player 2"] === player1) &&
            (match["Team 2 Player 1"] === player2 || match["Team 2 Player 2"] === player2)
        ) || (
            (match["Team 1 Player 1"] === player2 || match["Team 1 Player 2"] === player2) &&
            (match["Team 2 Player 1"] === player1 || match["Team 2 Player 2"] === player1)
        ));
    }, [allMatches, player1, player2]);

    useEffect(() => {
        async function fetchMatches() {
            try {
                let data = require('../cleaned_file.json');
                setAllMatches(data);
            } catch (error) {
                console.error("Error fetching the matches:", error);
            }
        }
        fetchMatches();
    }, []);

    // Convert and sort matches by date in descending order
    headToHeadMatches.sort((a, b) => {
        const dateA = convertToDate(a.Date);
        const dateB = convertToDate(b.Date);
        
        if (dateA && dateB) {
            return dateB - dateA; // Compare dates in descending order
        }
        
        return 0; // If there was an issue with date conversion
    });

    function convertToDate(dateString) {
        const parts = dateString.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            return new Date(year, month - 1, day); // Months are zero-based
        }
        return null; // Invalid date format
    }

    return (
        <div>

            {/* Card view for mobile */}
            <HeadToHeadStats player1={player1} player2={player2} headToHeadMatches={headToHeadMatches} />
            <div className="comparison-container mobile-view">
                {headToHeadMatches.map((match, index) => (
                    <div key={index} className="match-card">
                        <h3>{match.Date}</h3>
                        <p><strong>Turnering:</strong> {match["Tournament Name"]}</p>
                        <div className="teams-comparison">
                            <div>
                                {match["Team 1 Player 1"] && match["Team 1 Player 1"] !== "NaN" ? match["Team 1 Player 1"] : ""}
                                {match["Team 1 Player 2"] && match["Team 1 Player 2"] !== "NaN" ? `, ${match["Team 1 Player 2"]}` : ""}
                            </div>
                            <div className="score">{match.Result}</div>
                            <div>
                                {match["Team 2 Player 1"] && match["Team 2 Player 1"] !== "NaN" ? match["Team 2 Player 1"] : ""}
                                {match["Team 2 Player 2"] && match["Team 2 Player 2"] !== "NaN" ? `, ${match["Team 2 Player 2"]}` : ""}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table view for desktop */}
            <div className="desktop-view">
                <table>
                    <thead>
                        <tr>
                            <th>Dato</th>
                            <th>Turnering</th>
                            <th>Vinner</th>
                            <th></th>
                            <th>Taper</th>
                            <th>Resultat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {headToHeadMatches.map((match, index) => (
                            <tr key={index} style={{ backgroundColor: "transparent" }}>
                                <td>{match.Date}</td>
                                <td>{match["Tournament Name"]}</td>
                                <td align="right">
                                        {match["Team 1 Player 1"] && match["Team 1 Player 1"] !== "NaN" ? match["Team 1 Player 1"] : ""}
                                        {match["Team 1 Player 2"] && match["Team 1 Player 2"] !== "NaN" ? `, ${match["Team 1 Player 2"]}` : ""}
                                </td>
                                <td align="center">-</td>
                                <td>
                                    {match["Team 2 Player 1"] && match["Team 2 Player 1"] !== "NaN" ? match["Team 2 Player 1"] : ""}
                                    {match["Team 2 Player 2"] && match["Team 2 Player 2"] !== "NaN" ? `, ${match["Team 2 Player 2"]}` : ""}
                                </td>
                                <td><span className="score">{match.Result}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
}

export default HeadToHead;
