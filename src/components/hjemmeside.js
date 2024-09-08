import React, { useContext } from 'react'; // Import useContext
import PlayerComparison from './PlayerComparison';
import PlayerList from './PlayerList';
import SearchBar from '../Search_Bar';
import PlayerSearch from './PlayerSearch';
import styles from './hjemmeside.css'; // Importing CSS Module
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { AuthenticationContext } from "../Auth-Context.js"; // Adjust this import path to where your AuthenticationContext is located

const Home = () => {
    const { isAuthenticated, onLogout } = useContext(AuthenticationContext); // Corrected use of useContext

    // Define the event handler functions
    const handleLogoutClick = () => {
        onLogout();
    };

    const handleLinkClick = (event) => {
        // Implement functionality or remove if not needed
    };

    return (
        <div className="home-page">
            <section className="hero-section">
                <h1>Velkommen til Badstat 🏸</h1>
                <p>Med Badstat får du verktøyene du trenger til turnering. <br/>Sjekk tidligere kamper, analyser motstandere, sammenligne deg med andre og skriv kamplogger.</p>
                <div className="start-button">
    {isAuthenticated ? (
        <button
            style={{ all: 'unset', padding: '0px 0px', display: 'block', width: '100%' }}
        >
            <h3>Du er logget inn</h3>
        </button>
    ) : (
        <Link to="/account" onClick={handleLinkClick} style={{ all: 'unset', padding: '0px 0px', display: 'block', width: '100%' }}>
            <h3>Logg inn / Registrer</h3>
        </Link>
    )}
</div>

                <p>Oppdatert: 13.07.2024</p>
                <img src="https://embedsocial.com/admin/media/feed-media/17950/17950733630435669/image_2_large.jpeg" alt="Badminton action" style={{maxWidth: '100%', height: 'auto', marginTop: '20px', marginBottom:  '30px', borderRadius : '10px'}}/>
            </section>

            <section className="contact-section">
                <h2>Ta kontakt 📬</h2>
                <p>Har du spørsmål eller tilbakemeldinger? Vi vil gjerne høre fra deg.</p>
                <a href="https://www.instagram.com/badstatnorge/">Send meg en DM på Instagram</a>
            </section>

            <footer className="footer-section">
                <p>&copy; 2024 Badstat. Alle rettigheter reservert. Utviklet av Torstein Vikse Olsen</p>
            </footer>
        </div>
    );
};

export default Home;  
