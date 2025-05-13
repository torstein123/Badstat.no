import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faShieldAlt,
    faLock,
    faUserShield,
    faDatabase,
    faEnvelope,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from '../components/ShuttlecockIcon';

const Personvern = () => {
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
                        Personvern
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                            Personvern og Databeskyttelse
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Din personvern er vår høyeste prioritet. Her kan du lese om hvordan vi håndterer dine data.
                    </p>
                </div>

                <div className={`space-y-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Informasjonsinnsamling */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faDatabase} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Informasjonsinnsamling
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi samler inn følgende typer informasjon:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Grunnleggende brukerinformasjon (navn, e-post)</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Badmintonrelaterte data (rangeringer, resultater)</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Teknisk informasjon (IP-adresse, nettlesertype)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bruk av informasjon */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faUserShield} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Bruk av informasjon
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Din informasjon brukes til:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Tilby tilgang til badmintonstatistikk</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Forbedre tjenestene våre</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Sende viktige oppdateringer</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dine rettigheter */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                                    Dine rettigheter
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Du har rett til å:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Få tilgang til dine personopplysninger</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Korrigere unøyaktige opplysninger</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Slette dine data</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Trekke tilbake samtykke</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kontakt */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Kontakt oss
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Har du spørsmål om personvern eller ønsker å utøve dine rettigheter?</p>
                                    <a 
                                        href="mailto:kontakt@badmintonsentralen.no" 
                                        className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        <span>kontakt@badmintonsentralen.no</span>
                                    </a>
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

export default Personvern; 