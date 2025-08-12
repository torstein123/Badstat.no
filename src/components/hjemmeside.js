import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticationContext } from "../Auth-Context.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faChartLine, 
    faTrophy, 
    faHandshake, 
    faBook, 
    faDatabase,
    faArrowRight,
    faChartBar,
    faCalendar,
    faQuoteLeft,
    faStar,
    faMedal,
    faAward,
    faCrown,
    faCheck,
    faLock,
    faUserFriends
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from './ShuttlecockIcon';
import AdSlot from './AdSlot';
import VippsPaymentButton from './VippsPaymentButton';
import { motion } from 'framer-motion';

const Home = () => {
    const { isAuthenticated, hasPremiumAccess, userData } = useContext(AuthenticationContext);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Track mouse movement for parallax effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Track scroll position for animations
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Trigger entrance animation
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Calculate parallax values
    const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.01;
    const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.01;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                
                {/* Floating shuttlecocks */}
                <div className="absolute top-1/4 left-1/4 w-16 h-16 text-indigo-400 opacity-40 animate-float" style={{ animationDelay: '0s', transform: `translate(${parallaxX * 2}px, ${parallaxY * 2}px)` }}>
                    <ShuttlecockIcon className="w-full h-full" color="currentColor" />
                </div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 text-teal-400 opacity-40 animate-float" style={{ animationDelay: '1s', transform: `translate(${-parallaxX * 3}px, ${parallaxY * 3}px)` }}>
                    <ShuttlecockIcon className="w-full h-full" color="currentColor" />
                </div>
                <div className="absolute bottom-1/4 right-1/3 w-12 h-12 text-amber-400 opacity-40 animate-float" style={{ animationDelay: '2s', transform: `translate(${parallaxX * 4}px, ${-parallaxY * 4}px)` }}>
                    <ShuttlecockIcon className="w-full h-full" color="currentColor" />
                </div>
                
                {/* Particle effect */}
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.1,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                animationDelay: `${Math.random() * 2}s`,
                                transform: `translate(${parallaxX * (Math.random() * 2 - 1)}px, ${parallaxY * (Math.random() * 2 - 1)}px)`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    <div className={`inline-block transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-semibold tracking-wide uppercase mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                            Norsk badmintonstatistikk
                        </span>
                    </div>
                    <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Hei og velkommen til <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400 relative">
                            BadStat
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-teal-400 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></span>
                        </span>
                    </h1>
                    <p className={`text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Her finner du alt av badmintonstatistikk og analyser. 
                        <span className="block mt-2 text-teal-300">Vi har samlet over 150.000 kamper siden 2013!</span>
                    </p>
                    <div className={`mt-10 space-x-4 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {isAuthenticated ? (
                            <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 relative overflow-hidden group">
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative flex items-center">
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    Du er logget inn
                                </span>
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                {/* Year in Review Announcement Section */}
                <div className={`mt-20 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-5xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 mix-blend-overlay"></div>
                        
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                                backgroundSize: '32px 32px'
                            }}></div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute top-6 right-6 w-20 h-20 text-purple-400 opacity-30">
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -5, 0],
                                    y: [0, -5, 5, 0] 
                                }}
                                transition={{ 
                                    duration: 5, 
                                    repeat: Infinity,
                                    repeatType: "mirror" 
                                }}
                                className="text-5xl"
                            >
                                🏸
                            </motion.div>
                        </div>

                        <div className="relative px-6 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <FontAwesomeIcon icon={faCalendar} className="text-white text-2xl" />
                                    </div>
                                    <span className="px-4 py-2 bg-purple-500/20 text-purple-300 text-lg font-bold rounded-full border border-purple-500/30">
                                        ✨ LANSERT NÅ!
                                    </span>
                                </div>
                                
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                                        Badstat "Wrapped"
                                    </span>
                                </h2>
                                
                                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                                    Få en oversikt over dine beste øyeblikk, største seire og mest interessante statistikker fra 2024/2025-sesongen – presentert på en enkel og visuell måte.
                                </p>

                                {/* Feature highlights */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                                        <FontAwesomeIcon icon={faTrophy} className="h-8 w-8 text-yellow-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">Beste Seire</h3>
                                        <p className="text-gray-300 text-sm">Dine mest imponerende triumfer</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                                        <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-blue-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">Personlig Statistikk</h3>
                                        <p className="text-gray-300 text-sm">Dyptgående analyser av spillet ditt</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                                        <FontAwesomeIcon icon={faUserFriends} className="h-8 w-8 text-green-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">Beste Partnere</h3>
                                        <p className="text-gray-300 text-sm">Hvem du spiller best med</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                                        <FontAwesomeIcon icon={faQuoteLeft} className="h-8 w-8 text-purple-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">Morsomme Fakta</h3>
                                        <p className="text-gray-300 text-sm">Overraskende innsikter</p>
                                    </div>
                                </div>
                                
                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        to={hasPremiumAccess ? "/playerlist" : "/premium"}
                                        className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-500 hover:to-pink-500 overflow-hidden"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                        <span className="relative flex items-center">
                                            {hasPremiumAccess ? (
                                                <>
                                                    <FontAwesomeIcon icon={faCalendar} className="mr-3" />
                                                    Se min "Badminton Wrapped"
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faCrown} className="mr-3" />
                                                    Kjøp lisens
                                                </>
                                            )}
                                            <motion.div
                                                className="ml-2"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <FontAwesomeIcon icon={faArrowRight} />
                                            </motion.div>
                                        </span>
                                    </Link>
                                </div>
                                
                                <p className="text-purple-300 text-sm mt-4 opacity-80">
                                    Interaktiv opplevelse • 2-3 minutter • Kun 99 NOK for hele sesongen
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Upgrade Section */}
                {!hasPremiumAccess && (
                    <div className="mt-24 mb-16">
                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="h-20 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <FontAwesomeIcon icon={faCrown} className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Kjøp lisens til 2025/2026-sesongen
                                </h2>
                                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                    Få full tilgang til alle funksjoner og statistikker for kun 99 NOK for hele sesongen
                                </p>
                                
                                {/* Cost Explanation */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
                                    <p className="text-blue-200 text-sm leading-relaxed">
                                        <strong>Hvorfor lisens?</strong> BadStat.no inneholder over 150.000 kamper i databasen og krever betydelige ressurser for hosting, database og vedlikehold. Lisensmodellen sikrer at vi kan fortsette å levere kvalitetstjenesten du forventer.
                                    </p>
                                </div>
                                
                                {/* Feature Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                                        <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-amber-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">Spillerstatistikk</h3>
                                        <p className="text-gray-300 text-sm">Detaljert statistikk og utvikling for alle spillere</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                                        <FontAwesomeIcon icon={faHandshake} className="h-8 w-8 text-amber-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">Head-to-Head</h3>
                                        <p className="text-gray-300 text-sm">Sammenlign spillere og analyser historiske oppgjør</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                                        <FontAwesomeIcon icon={faCalendar} className="h-8 w-8 text-purple-400 mb-3" />
                                        <h3 className="text-white font-semibold mb-2">🌟 År i Oversikt (NYT!)</h3>
                                        <p className="text-gray-300 text-sm">Ditt personlige "Spotify Wrapped" for badminton med interaktive visualiseringer</p>
                                    </div>
                                </div>
                                
                                {/* Premium Benefits */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                                    <h3 className="text-lg font-semibold text-white mb-4">Hva får du med lisensen?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                        {[
                                            '🌟 År i Oversikt - ditt personlige "Spotify Wrapped"',
                                            'Spillerstatistikk og analyser',
                                            'Head-to-Head sammenligning',
                                            'Rankingoversikt og utvikling',
                                            'Spillerdagbok funksjonalitet',
                                            'Turneringsanalyser'
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                                <span className="text-gray-300 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <VippsPaymentButton 
                                        size="large"
                                        variant="primary"
                                    />
                                </div>
                                
                                <p className="text-gray-400 text-sm mt-4">
                                    Sikker betaling med Vipps • Gjelder hele 2025/2026-sesongen
                                </p>
                                
                                {/* Last Updated Date */}
                                <p className="text-gray-500 text-xs mt-6">
                                    Sist oppdatert: 06.07.2025
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Banner */}
                <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group hover:bg-white/10">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400 mb-2 group-hover:scale-110 transition-transform duration-300">150K+</div>
                        <div className="text-gray-300 font-medium">Kamper i databasen</div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <FontAwesomeIcon icon={faDatabase} className="text-indigo-400 text-xs" />
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center border border-white/10 hover:border-teal-500/30 transition-all duration-300 group hover:bg-white/10">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400 mb-2 group-hover:scale-110 transition-transform duration-300">06.07.2025</div>
                        <div className="text-gray-300 font-medium">Sist oppdatert</div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-xs" />
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center border border-white/10 hover:border-amber-500/30 transition-all duration-300 group hover:bg-white/10">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300">2602+</div>
                        <div className="text-gray-300 font-medium">Spillere</div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <FontAwesomeIcon icon={faUser} className="text-amber-400 text-xs" />
                        </div>
                    </div>
                </div>

                 

                {/* --- Ad Slot 3 (added above Nytt på BadStat) --- */}
                <div style={{ marginTop: '64px', marginBottom: '64px', display: 'flex', justifyContent: 'center' }}>
                    <AdSlot 
                        adSlot="7152830155" 
                        adClient="ca-pub-6338038731129939"
                    />
                </div>

                {/* New Features Section - Moved up */}
                <div className={`mt-20 transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 relative">
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full"></span>
                        Nytt på BadStat
                    </h2>
                    
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group hover:bg-white/10 max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <div className="h-16 w-16 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                    <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    BadStat Oddsen
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    Sjekk vinnersjansene dine mot andre spillere! Vi analyserer tidligere kamper, spillestilen din og nåværende form for å gi deg et godt estimat på hvordan kampen kan gå.
                                </p>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faChartBar} className="text-indigo-400" />
                                        <span className="text-gray-300">Smart analyse</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faMedal} className="text-teal-400" />
                                        <span className="text-gray-300">Alltid oppdatert</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faAward} className="text-amber-400" />
                                        <span className="text-gray-300">God innsikt</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-shrink-0 w-full md:w-72 bg-white/5 rounded-lg p-6 border border-white/10">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400 mb-2">
                                        73%
                                    </div>
                                    <div className="text-gray-300 mb-4">Vinnersjanse</div>
                                    <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full" style={{ width: '73%' }}></div>
                                    </div>
                                    <div className="mt-6">
                                        <Link
                                            to={hasPremiumAccess ? "/headtohead" : "/premium"}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
                                        >
                                            {hasPremiumAccess ? "Prøv nå" : "Kjøp lisens til 2025/2026-sesongen"}
                                            <FontAwesomeIcon icon={hasPremiumAccess ? faArrowRight : faCrown} className="ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ad Slot added below "Nytt på BadStat" section */}
                <div style={{ marginTop: '64px', marginBottom: '64px', display: 'flex', justifyContent: 'center' }}>
                    <AdSlot 
                        adSlot="7152830155" 
                        adClient="ca-pub-6338038731129939"
                    />
                </div>



                {/* Routes to Pages Section */}
                <div className={`mt-24 transform transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 relative">
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full"></span>
                        Utforsk BadStat
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Link to={hasPremiumAccess ? "/headtohead" : "/premium"} className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="h-14 w-14 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faHandshake} className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">Head to Head</h3>
                                {!hasPremiumAccess && (
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-amber-400" />
                                )}
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                Se hvordan du står mot andre spillere og sjekk tidligere kamper mellom dere.
                                {!hasPremiumAccess && (
                                    <span className="block mt-2 text-amber-400 font-medium">Lisens kreves</span>
                                )}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </Link>

                        <Link to={hasPremiumAccess ? "/Diary" : "/premium"} className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-teal-500/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="h-14 w-14 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faBook} className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">Badminton-dagboka</h3>
                                {!hasPremiumAccess && (
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-amber-400" />
                                )}
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                Hold styr på kampene dine, sjekk motstandere og følg med på fremgangen din.
                                {!hasPremiumAccess && (
                                    <span className="block mt-2 text-amber-400 font-medium">Lisens kreves</span>
                                )}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </Link>

                        <Link to={hasPremiumAccess ? "/playerlist" : "/premium"} className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="h-14 w-14 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <ShuttlecockIcon className="h-7 w-7 text-white" color="currentColor" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">Spillersøk</h3>
                                {!hasPremiumAccess && (
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-amber-400" />
                                )}
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                Søk blant tusenvis av spillere og sjekk kamphistorikk og statistikk.
                                {!hasPremiumAccess && (
                                    <span className="block mt-2 text-amber-400 font-medium">Lisens kreves</span>
                                )}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </Link>

                        <Link to="/MostGames" className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="h-14 w-14 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faTrophy} className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">Topplista</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Sjekk hvem som topper lista og følg med på utviklingen i norsk badminton.
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </Link>

                        <Link to="/hvorfor" className="group bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="h-14 w-14 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faChartBar} className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">Hvorfor BadStat?</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Les mer om hvorfor BadStat er stedet for all badmintonstatistikk i Norge.
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </Link>
                    </div>
                </div>

               

                {/* --- Ad Slot 2 (added below Utforsk BadStat) --- */}
                <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
                    <AdSlot 
                        adSlot="7152830155" 
                        adClient="ca-pub-6338038731129939"
                    />
                </div>



            </div>
        </div>
    );
};

export default Home;
