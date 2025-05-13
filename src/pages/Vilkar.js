import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileContract,
    faGavel,
    faUserCheck,
    faExclamationTriangle,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from '../components/ShuttlecockIcon';

const Vilkar = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsVisible(true);
        
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-semibold tracking-wide uppercase mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        Vilkår
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                            Brukervilkår og Betingelser
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Ved å bruke BadStat godtar du følgende vilkår og betingelser.
                    </p>
                </div>

                <div className={`space-y-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Generelle vilkår */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faFileContract} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Generelle vilkår
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Ved å bruke tjenesten godtar du at:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Du er minst 13 år gammel</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Du gir korrekt og oppdatert informasjon</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Du er ansvarlig for å beskytte din konto</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bruk av tjenesten */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faUserCheck} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Bruk av tjenesten
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Du godtar å:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Bruke tjenesten kun til lovlige formål</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Ikke forstyrre eller sabotere tjenesten</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Respektere andres rettigheter</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ansvarsfraskrivelse */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                                    Ansvarsfraskrivelse
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi fraskriver oss ansvar for:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Tekniske feil eller avbrudd i tjenesten</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Tap av data eller informasjon</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Indirekte skader eller tap</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Endringer i vilkårene */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faGavel} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Endringer i vilkårene
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi forbeholder oss retten til å:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Endre vilkårene når som helst</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Varsle om endringer via tjenesten</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Avslutte eller endre tjenesten</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-16 text-center text-sm text-gray-400 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
                </div>
            </div>
        </div>
    );
};

export default Vilkar; 