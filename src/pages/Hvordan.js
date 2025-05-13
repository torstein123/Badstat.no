import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDatabase,
    faBalanceScale,
    faAward,
    faChartBar,
    faCheckCircle,
    faCalculator
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from '../components/ShuttlecockIcon';

const Hvordan = () => {
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
                        Metode
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                            Hvordan lager vi den mest rettferdige rangeringslisten?
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Vår unike tilnærming til badmintonrangeringer skaper en mer nøyaktig og helhetlig rangeringsliste
                    </p>
                </div>

                <div className={`space-y-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Datakilde */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faDatabase} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Omfattende datainnsamling
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi bruker data fra Badmintonportalen til å kombinere rangeringspoengene fra alle klasser og lage en samlet rangeringsliste. Dette gir oss muligheten til å:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Identifisere og rangere de beste spillerne basert på prestasjoner i alle kategorier</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Innhente oppdaterte resultater fra alle turneringer</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Bygge en database med historiske resultater for trend- og utviklingsanalyse</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Helhetlig vurdering */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faCalculator} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Helhetlig vurdering
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Ved å inkludere rangeringspoengene fra alle klasser tar vi hensyn til spillernes samlede ferdigheter og prestasjoner. Dette betyr at:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Én enkelt god prestasjon ikke alene definerer en spillers rangering</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Vi får en helhetlig vurdering av en spillers evner på tvers av kategorier</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Rangeringslisten blir mer representativ for faktiske ferdigheter</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rettferdig balanse */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faBalanceScale} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                                    Rettferdig balanse
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vår tilnærming sikrer at ingen spesifikke kategorier eller klasser favoriseres over andre:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Hver kategori tillegges riktig vekting i den samlede rangeringen</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Spillere som utmerker seg i flere klasser belønnes</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Dyktighet på tvers av disipliner anerkjennes rettferdig</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Presisjon og nøyaktighet */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faChartBar} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Presisjon og nøyaktighet
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi er dedikert til å tilby de mest presise rangeringene:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Kontinuerlig oppdatering etter hver turnering</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Matematiske algoritmer som sikrer rettferdige beregninger</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Kvalitetssikring av alle data som inkluderes i rangeringen</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resultatet */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faAward} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Resultat: Norges mest nøyaktige rangeringsliste
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi er stolte av å tilby en rangeringsliste som tar hensyn til alle aspekter av badmintonsporten og gir en mer nøyaktig representasjon av spillernes samlede ferdigheter. Den er designet for:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Aktive spillere som ønsker å følge sin rangering</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Trenere som søker innsikt i spilleres utvikling</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Badmintonentusiaster som ønsker en rettferdig vurdering av spillerne</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-16 text-center transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <a href="/hvorfor" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:from-indigo-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25">
                        Utforsk hvorfor vi trenger BadStat
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Hvordan;
