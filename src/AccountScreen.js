import React, { useContext, useState } from 'react';
import { AuthenticationContext } from "./Auth-Context";
import './AccountScreen.css';
import { useNavigate } from 'react-router-dom';


export const AccountScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { onLogin, onResetPassword, error, user, onLogout, isAuthenticated, feedbackMessage, isFeedbackPositive, isLoading } = useContext(AuthenticationContext);
    const navigate = useNavigate(); // Use useNavigate for navigation in React Router

    const handleLogin = async () => {
        try {
            await onLogin(email, password);
            console.log("Logged in successfully");
            navigate('/'); // Ensure this is navigating correctly
        } catch (error) {
            // Handle the error appropriately
            console.error("Login failed:", error.message);
            // Optionally, update the UI to inform the user
        }
    };

    const handleResetPassword = async () => {
        if (email) {
            try {
                await onResetPassword(email);
                alert('Hvis en bruker er knyttet til e-posten skal du ha fått en reset-link nå.'); // Provide feedback
            } catch (error) {
                console.error("Reset password failed:", error.message);
                // Optionally, update the UI to inform the user
            }
        } else {
            alert('Vennligst skriv inn e-posten din i "logg-inn" feltet og prøv igjen.');
        }
    };
    

    return (
        <div className="full-page-background">
            <div class="container-wrapper">
                <div className="registration-container">
                    <div className="logo">

                    </div>
                    <div className="promotional-text">
                    <h3>Heisann!👋🏽</h3>
                    </div>
        
                    {isAuthenticated ? (
                        <div>
                            <p>Du er logget inn med e-post: {user.email}</p>
                            <button className="button" onClick={onLogout}>Logg ut</button>
                        </div>
                    ) : (
                        <>
                            <p>Velkommen! Du må være logget inn for å få tilgang til turneringsdata</p>
                            <p>Har du bruker?</p>
                            <div className="inputContainer">
                                <input
                                    type="text"
                                    placeholder="E-post"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                />
                                <input
                                    type="password"
                                    placeholder="Passord"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                />
                            </div>
        
                            <div className="buttonContainer">
                                <button onClick={handleLogin} className="button">
                                    Logg inn
                                </button>
                                <button onClick={handleResetPassword} className="button">
                                    Glemt passord?
                                </button>
                                
                            </div>
                            <p>Har du ikke bruker?</p>
                            <button
                                className="button"
                                onClick={() => navigate("/register")}
                            >Opprett</button>
                        </>
                    )}
                </div>

                <div class="feature-container">
                    <h2>Funksjoner</h2>
                    <div class="feature-item">
                        <h3>📊 Spillerstatistikk</h3>
                        <p>Vis statistikk for badmintonspillere. Mer detaljert statistikk kommer fortløpende</p>
                    </div>
                    <div class="feature-item">
                        <h3>🤼‍♂️ Head-to-Head-kamper</h3>
                        <p>Sammenlign spillere og deres historiske oppgjør.</p>
                    </div>
                    <div class="feature-item">
                        <h3>🏸 Alle turneringskamper</h3>
                        <p>Utforsk alle turneringskamper som er spilt av forskjellige spillere.</p>
                    </div>
                    <div class="feature-item">
                        <h3>📖 Badminton Dagbok</h3>
                        <p>Hold en personlig kampdagbok over kamper du har spilt mot spesifikke motstandere, og lær av dine feil</p>
                    </div>
                    <div class="feature-item">
                        <h3>📈 Over 150 000 kamper registrert</h3>
                        <p>Jeg har gått gjennom 150 000 registrerte kamper, og kan gi deg god innsikt i dine turneringskamper.</p>
                    </div>
                    </div>

</div>


            
        </div>

    );
    
    
};

export default AccountScreen;
