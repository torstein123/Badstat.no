import React, { useContext, useState, useEffect } from 'react';
import { AuthenticationContext } from "./Auth-Context";
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faEnvelope, 
    faLock, 
    faBuilding, 
    faArrowLeft,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';

export const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [club, setClub] = useState('');
    const [age, setAge] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const { onRegister, error } = useContext(AuthenticationContext);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleRegister = async () => {
        try {
            const additionalData = {
                firstName,
                lastName,
                club,
                age,
            };
            await onRegister(email, password, additionalData);
            navigate('/');
        } catch (e) {
            console.error("Registration error:", e.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative">
                <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 shadow-xl">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                                <FontAwesomeIcon icon={faUserPlus} className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white text-center mb-8">Opprett Konto</h2>

                        <div className="space-y-4">
                            <div className="relative">
                                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    placeholder="Fornavn"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    placeholder="Etternavn"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <FontAwesomeIcon icon={faBuilding} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    placeholder="Klubb"
                                    value={club}
                                    onChange={(e) => setClub(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    placeholder="E-post"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    placeholder="Passord"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleRegister}
                            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
                        >
                            Opprett Konto
                        </button>

                        <div className="mt-6 text-center">
                            <Link
                                to="/account"
                                className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Har du allerede en konto? Logg inn
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
