import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChartLine,
    faSearchPlus,
    faUsers,
    faChartPie,
    faCheckCircle,
    faTrophy
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from '../components/ShuttlecockIcon';

const Hvorfor = () => {
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
                        Hvorfor BadStat?
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                            Hvorfor trenger vi BadStat?
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Din ultimate ressurs for badmintonrangeringer og statistikk i Norge
                    </p>
                </div>

                <div className={`space-y-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Omfattende oversikt */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Omfattende oversikt
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>BadStat gir deg en fullstendig oversikt over rangeringene til norske badmintonspillere. Med vår plattform får du:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Detaljerte rangeringer for alle kategorier</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Oppdatert informasjon etter hver turnering</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Historisk utvikling av spilleres prestasjoner</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brukervennlig søk */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faSearchPlus} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Brukervennlig søk
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Våre avanserte søkefunksjoner gjør det enkelt å finne informasjonen du leter etter:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Søk etter individuelle spillere eller klubber</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Filter basert på alder, kjønn eller kategori</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Intuitivt grensesnitt for alle brukere</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* For hele badmintonmiljøet */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                                    For hele badmintonmiljøet
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>BadStat er designet for å tjene hele det norske badmintonmiljøet:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Aktive spillere som ønsker å følge sin rangering</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Trenere som analyserer spilleres utvikling</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Klubber som evaluerer prestasjoner</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Badmintonentusiaster som vil følge med på sporten</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Innsikt og analyse */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faChartPie} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Innsikt og analyse
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>BadStat gir verdifull innsikt utover bare rangeringer:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Statistikk for hver spiller og klubb</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Trendanalyse og prestasjonsutvikling</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Head-to-head-sammenligninger mellom spillere</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Målsetting */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faTrophy} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Vår målsetting
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>BadStat arbeider kontinuerlig mot disse målene:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Å være den mest nøyaktige kilden til badmintonrangeringer i Norge</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Å støtte vekst og utvikling av norsk badminton</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Å bygge et samlet og engasjert badmintonfellesskap</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-16 text-center transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <a href="/hvordan" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:from-indigo-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25">
                        Lær hvordan vi lager den mest rettferdige rangeringslisten
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Hvorfor;
