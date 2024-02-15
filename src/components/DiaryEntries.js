import React, { useEffect, useState, useContext } from 'react';
import { AuthenticationContext } from '../Auth-Context';

function DiaryEntries({ userId, opponentSpillerId }) {
    const [entries, setEntries] = useState([]);
    const { fetchUserDiaryEntries } = useContext(AuthenticationContext); // Destructure the method from context

    useEffect(() => {
        async function fetchEntries() {
            try {
                const entries = await fetchUserDiaryEntries(userId, opponentSpillerId);
                // Sort the entries by timestamp or date field in descending order (newest to oldest)
                const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);
                setEntries(sortedEntries);
            } catch (error) {
                console.error("Failed to fetch diary entries:", error);
                setEntries([]); // Handle error, perhaps show a message or clear entries
            }
        }

        if (userId && opponentSpillerId) {
            fetchEntries();
        }
    }, [userId, opponentSpillerId, fetchUserDiaryEntries]);

    // Formatting today's date for display, consider moving inside useEffect if it only needs to run once
    const today = new Date();
    const formattedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;

    return (
        <div className="diary-entries-container">
            <h2>Logg informasjon om motstanderen</h2>
            {entries.length === 0 ? (
                <p>Ingen data</p>
            ) : (
                entries.map((entry, index) => (
                    <div key={index} className="diary-entry">
                        <h3>{formattedDate}</h3> {/* Added Entry ID for clarity */}
                        <p><b>Oppsummering av kampen:</b> {entry.summary}</p>
                        <p><b>Styrker?</b> {entry.strengths}</p>
                        <p><b>Svakheter?</b> {entry.weaknesses}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default DiaryEntries;
