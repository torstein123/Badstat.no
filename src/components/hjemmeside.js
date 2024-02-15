import React from 'react';
import PlayerComparison from './PlayerComparison';
import PlayerList from './PlayerList';
import SearchBar from '../Search_Bar';
import PlayerSearch from './PlayerSearch';
import styles from './hjemmeside.css'; // Importing CSS Module
import { BrowserRouter, Route, Link } from 'react-router-dom';


const Home = () => {
    return (
        <div className="home-page">
            {/* Hero-seksjon */}
            <section className="hero-section">
                <h1>Forbedre ditt badmintonspill 🏸</h1>
                <p>Med Badstat får du verktøyene du trenger for å forstå spillet ditt, analysere motstandere og forbedre dine ferdigheter.</p>
                <Link to="/account" className="start-button">Start nå🔥</Link>
                <img src="https://embedsocial.com/admin/media/feed-media/17950/17950733630435669/image_2_large.jpeg" alt="Badminton action" style={{maxWidth: '100%', height: 'auto', marginTop: '20px'}}/>
            </section>

            {/* Hvordan det fungerer */}
            <section className="how-it-works-section">
                <h1>Enkelt og effektivt 🚀</h1 >
                <div className="step">
                    <h3>Logg kamper 📝</h3>
                    <p>Dokumenter dine kamper enkelt - hvem, hva og hvordan.</p>
                    <Link to="/diary" className="start-button">Logg en kamp</Link>
                    
                </div>
                <div className="step">
                    <h3>Utforsk statistikk 📊</h3>
                    <p>Sjekk dine og andres prestasjoner over tid.</p>
                    <Link to="/PlayerList" className="start-button">Søk opp spiller</Link>
                </div>
                <div className="step">
                    <h3>Sammenlign og konkurrer 👥</h3>
                    <p>Bruk vår head-to-head funksjon for å sammenligne deg med venner eller konkurrenter.</p>
                    <Link to="/headtohead" className="start-button">Head to head</Link>
                    <img src="https://embedsocial.com/admin/media/feed-media/17950/17950733630435669/image_5_large.jpeg" alt="Head to Head Comparison" style={{maxWidth: '70%', height: 'auto', margin: '20px auto', display: 'block'}}/>
                </div>
            </section>

            {/* Om oss */}
            <section className="about-section">
            <h2>Hvordan har vi gjort det? 🎯</h2>
                <p>Vi har jobbet knallhardt og gått gjennom over 150 000 badmintonkamper fra portalen vår. Det har tatt oss hele 1,5 år å sortere og analysere all denne dataen! Hvorfor? Fordi vi ønsker at Badstat skal være det ultimate stedet for badmintonentusiaster som ønsker å sjekke ut kamper og statistikk. Og tro meg, vi har ikke tenkt å stoppe der! Vi jobber med å legge til enda flere verktøy som vil være til god hjelp for badmintonspillere over hele landet. Så, er du klar til å ta spillet ditt til neste nivå? Badstat er her for å hjelpe deg med akkurat det!</p>

                <img src="https://embedsocial.com/admin/media/feed-media/17950/17950733630435669/image_4_large.jpeg" alt="Benefits of using Badstat" style={{maxWidth: '700px', height: 'auto', margin: '20px auto', display: 'block'}}/>
            </section>


            {/* Kontakt Oss */}
            <section className="contact-section">
                <h2>Ta kontakt 📬</h2>
                <p>Har du spørsmål eller tilbakemeldinger? Vi vil gjerne høre fra deg.</p>
                <p>@Badstat på Instagram</p>>
            </section>

            {/* Fotnote */}
            <footer className="footer-section">
                <p>&copy; 2024 Badstat. Alle rettigheter reservert.</p>
            </footer>
        </div>
    );
};

export default Home;  
