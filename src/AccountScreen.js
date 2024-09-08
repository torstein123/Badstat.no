import React, { useContext, useState } from 'react';
import { AuthenticationContext } from "./Auth-Context";
import './AccountScreen.css';
import { useNavigate } from 'react-router-dom';
import GoogleSignInLogo from './img/google.svg'; // Ensure this is the correct path

export const AccountScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {
        onLogin,
        onGoogleLogin,
        onResetPassword,
        error,
        user,
        onLogout,
        isAuthenticated,
        isLoading
    } = useContext(AuthenticationContext);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await onLogin(email, password);
            navigate('/'); // Redirect to home on successful login
        } catch (error) {
            console.error("Login failed:", error.message);
            alert(error.message); // Provide user feedback
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            alert('Vennligst skriv inn e-posten din i "logg-inn" feltet og prøv igjen.');
            return;
        }
        try {
            await onResetPassword(email);
            alert('Hvis en bruker er knyttet til e-posten skal du ha fått en reset-link nå.');
        } catch (error) {
            console.error("Reset password failed:", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="full-page-background">
            <div className="container-wrapper">
                <div className="registration-container">
                    <div className="logo">
                        {/* Optionally add a logo here */}
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
                                {isLoading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <>
                                        <button onClick={onGoogleLogin} className="google">
                                            <img src={GoogleSignInLogo} alt="Sign in with Google" />
                                        </button>
                                        <button onClick={handleLogin} className="button">
                                            Logg inn
                                        </button>
                                        <button onClick={handleResetPassword} className="button">
                                            Glemt passord?
                                        </button>
                                    </>
                                )}
                            </div>
                            <p>Har du ikke bruker?</p>
                            <button
                                className="button"
                                onClick={() => navigate("/register")}
                            >Opprett</button>
                        </>
                    )}
                </div>

                <div className="feature-container">
                    <h2>Funksjoner</h2>
                    <div className="feature-item">
                        <h3>📊 Spillerstatistikk</h3>
                        <p>Vis statistikk for badmintonspillere. Mer detaljert statistikk kommer fortløpende</p>
                    </div>
                    <div className="feature-item">
                        <h3>🤼‍♂️ Head-to-Head-kamper</h3>
                        <p>Sammenlign spillere og deres historiske oppgjør.</p>
                    </div>
                    <div className="feature-item">
                        <h3>🏸 Alle turneringskamper</h3>
                        <p>Utforsk alle turneringskamper som er spilt av forskjellige spillere.</p>
                    </div>
                    <div className="feature-item">
                        <h3>📖 Badminton Dagbok</h3>
                        <p>Hold en personlig kampdagbok over kamper du har spilt mot spesifikke motstandere, og lær av dine feil</p>
                    </div>
                    <div className="feature-item">
                        <h3>📈 Over 150 000 kamper registrert</h3>
                        <p>Databasen inneholder 150 000 registrerte kamper (alle kamper siden 2013  ).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountScreen;
