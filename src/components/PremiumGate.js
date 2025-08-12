import React, { useContext } from 'react';
import { AuthenticationContext } from '../Auth-Context';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCrown, 
    faLock, 
    faArrowRight,
    faUser,
    faCheck,
    faStar,
    faChartLine,
    faShield
} from '@fortawesome/free-solid-svg-icons';
import VippsPaymentButton from './VippsPaymentButton';

const PremiumGate = ({ children }) => {
    const { isAuthenticated, hasPremiumAccess, userData } = useContext(AuthenticationContext);

    // If user has premium access, show the content
    if (hasPremiumAccess) {
        return children;
    }

    // If not authenticated, show login prompt
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <FontAwesomeIcon icon={faCrown} className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-4">Lisens Kreves</h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Badstat.no krever nå lisens for tilgang. Logg inn og kjøp lisens til 2025/2026-sesongen for kun 99 NOK for å få tilgang til alle funksjoner.
                        </p>
                        
                        <div className="flex justify-center mb-12">
                            <VippsPaymentButton 
                                size="normal"
                                variant="primary" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                                <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                    <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">Spillerstatistikk</h3>
                                <p className="text-gray-300">Detaljert statistikk og analyser for alle badmintonspillere</p>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                                <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                    <FontAwesomeIcon icon={faShield} className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">"Spotify Wrapped" År-i-oversikt</h3>
                                <p className="text-gray-300">Personlige årsrapporter med flotte visualiseringer</p>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                                <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                    <FontAwesomeIcon icon={faStar} className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">Lisens Funksjoner</h3>
                                <p className="text-gray-300">Alle avanserte analyser og verktøy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If authenticated but no premium, show upgrade prompt
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faCrown} className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-4">Kjøp lisens til 2025/2026-sesongen</h2>
                    <p className="text-xl text-gray-300 mb-4">
                        Hei {userData?.email}! 👋
                    </p>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                        Badstat.no krever nå lisens for tilgang. Kjøp lisens til 2025/2026-sesongen for kun 99 NOK for å få tilgang til alle funksjoner og statistikker.
                    </p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-white mb-4">Hva får du med lisensen?</h3>
                        <div className="space-y-3 text-left">
                            {[
                                'Detaljert spillerstatistikk og analyser',
                                'Head-to-Head sammenligning',
                                '"Spotify Wrapped" år-i-oversikt',
                                'Rankingoversikt og utvikling',
                                'Spillerdagbok funksjonalitet',
                                'Turneringsanalyser'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                    <span className="text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <VippsPaymentButton 
                        size="large"
                        variant="primary"
                    />
                    
                    <p className="text-gray-400 text-sm mt-4">
                        Sikker betaling med Vipps • Gjelder hele 2025/2026-sesongen
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumGate; 