import React, { useContext, useState, useEffect } from 'react';
import { AuthenticationContext } from "./Auth-Context";
import './AccountScreen.css';
import { useNavigate } from 'react-router-dom';
import GoogleSignInLogo from './img/google.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faLock, 
    faEnvelope,
    faArrowRight,
    faShieldAlt,
    faChartLine,
    faTrophy,
    faBook
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from './components/ShuttlecockIcon';

export const AccountScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVisible, setIsVisible] = useState(false);
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

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleLogin = async () => {
        try {
            await onLogin(email, password);
            navigate('/');
        } catch (error) {
            console.error("Login failed:", error.message);
            alert(error.message);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                
                {/* Floating shuttlecocks */}
                <div className="absolute top-1/4 left-1/4 w-16 h-16 text-indigo-400 opacity-40 animate-float">
                    <ShuttlecockIcon className="w-full h-full" color="currentColor" />
                </div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 text-teal-400 opacity-40 animate-float" style={{ animationDelay: '1s' }}>
                    <ShuttlecockIcon className="w-full h-full" color="currentColor" />
                </div>
                <div className="absolute bottom-1/4 right-1/3 w-12 h-12 text-amber-400 opacity-40 animate-float" style={{ animationDelay: '2s' }}>
                    <ShuttlecockIcon className="w-full h-full" color="currentColor" />
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Login Container */}
                    <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">Velkommen tilbake!</h2>
                                <p className="text-gray-300">Logg inn for å få tilgang til alle funksjoner</p>
                            </div>

                            {isAuthenticated ? (
                                <div className="text-center">
                                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                                        <FontAwesomeIcon icon={faUser} className="text-indigo-400 text-2xl mb-2" />
                                        <p className="text-white">Du er logget inn som:</p>
                                        <p className="text-indigo-300 font-medium">{user.email}</p>
                                    </div>
                                    <button 
                                        onClick={onLogout}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
                                    >
                                        Logg ut
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="E-post"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="Passord"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {isLoading ? (
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={onGoogleLogin}
                                                    className="w-full px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                                                >
                                                    <img src={GoogleSignInLogo} alt="Google" className="w-5 h-5" />
                                                    <span>Logg inn med Google</span>
                                                </button>
                                                <button 
                                                    onClick={handleLogin}
                                                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-lg hover:from-indigo-700 hover:to-teal-700 transition-all transform hover:scale-105"
                                                >
                                                    Logg inn
                                                </button>
                                                <button 
                                                    onClick={handleResetPassword}
                                                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                                                >
                                                    Glemt passord?
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-6 text-center">
                                        <p className="text-gray-300">Har du ikke bruker?</p>
                                        <button
                                            onClick={() => navigate("/register")}
                                            className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-amber-600 text-white rounded-lg hover:from-teal-700 hover:to-amber-700 transition-all transform hover:scale-105"
                                        >
                                            Opprett konto
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Features Container */}
                    <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">Funksjoner</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4 group">
                                    <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                        <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">Spillerstatistikk</h3>
                                        <p className="text-gray-300">Detaljert statistikk og analyser for badmintonspillere</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                        <FontAwesomeIcon icon={faTrophy} className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">Head-to-Head</h3>
                                        <p className="text-gray-300">Analyser historiske oppgjør mellom spillere</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                        <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">Badminton Dagbok</h3>
                                        <p className="text-gray-300">Hold oversikt over dine kamper og utvikling</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                        <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">Over 150 000 kamper</h3>
                                        <p className="text-gray-300">Omfattende database med alle kamper siden 2013</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountScreen;
