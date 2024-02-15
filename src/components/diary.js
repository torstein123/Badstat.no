import React, { useState, useContext, useEffect } from 'react';
import DiaryForm from './DiaryForm';
import DiaryEntries from './DiaryEntries';
import PlayerDropdown from './PlayerDropdown';
import { AuthenticationContext } from '../Auth-Context';
import './diary.css'; // Ensure this matches the filename of your CSS file

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

    return (
        <div className="diary-container">
            <h1>Analysere. Forbedre. Dominere</h1>
            <div className="player-dropdown">
                <PlayerDropdown onSelect={handleOpponentSelect} />
            </div>
            {user && user.uid ? (
                selectedOpponent && (
                    <>
                        <DiaryForm userId={user.uid} opponentSpillerId={selectedOpponent.value} onEntryAdded={handleEntryAdded} />
                        <DiaryEntries userId={user.uid} opponentSpillerId={selectedOpponent.value} key={refreshEntries} />
                    </>
                )
            ) : (
                <p className="please-login">Please log in to use the diary.</p>
            )}
            <div className="diary-introduction">
                <h2>Hva er Badmintondagboka?</h2>
                <p>Badmintondagboka er en skreddersydd løsning for spillere som ønsker å ta spillet sitt til neste nivå. 
                    Tenk på det som din personlige treneringsdagbok, men digital, og med fokus på badminton. Slik gjør du det:</p>
                <ul>
                    <li>Skriv inn navnet på motstanderen din, og trykk på navnet</li>
                    <li>Register en oppsummering, samt mostanderens styrker og svakheter etter hver kamp.</li>
                    <li>Se dine tidligere logger, for å best mulig forberede deg til neste gang</li>
                </ul>
                <p>All data er sikret og personlig, og kun tilgjengelig for deg.</p>

                <h2>Hvorfor bruke Badmintondagboka?</h2>
                <p>Badmintondagboka gir deg innsikt i din egen utvikling og hjelper deg med å forberede deg bedre til kamper. 
                    Gjennom å loggføre dine kamper, får du innsikt i dine prestasjoner på en måte du aldri før har opplevd. 
                    <br>
                    </br><br>
                    </br>Ved å bli kjent med dine styrker og svakheter, 
                    åpner Badmintondagboka døren til raskere utvikling, og du stiller bedre forberedt til neste oppgjør. 
                    Det er på tide å ta spillet ditt til neste nivå!</p>
            </div>
            
        </div>
    );
};

export default Diary;
