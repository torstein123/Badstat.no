import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers,
    faTrophy,
    faChartLine,
    faHandshake,
    faCheckCircle,
    faEnvelope,
    faMapMarkerAlt,
    faBuilding,
    faPhone
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from '../components/ShuttlecockIcon';

const OmOss = () => {
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
                        Om Oss
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                            BadStat AS
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Din pålitelige kilde til badmintonstatistikk og rangeringer i Norge.
                    </p>
                </div>

                <div className={`space-y-12 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Vår historie */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Vår historie
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>BadStat AS ble grunnlagt i 2023 med én enkel visjon:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Å gjøre badmintonstatistikk tilgjengelig for alle</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Å støtte utviklingen av norsk badminton</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Å skape en felles plattform for badmintonentusiaster</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Våre tjenester */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faTrophy} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-300 transition-colors duration-300">
                                    Våre tjenester
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi tilbyr:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Omfattende rangeringer og statistikk</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Historiske data og utvikling</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Spiller- og klubbprofiler</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 mt-1 flex-shrink-0" />
                                            <span>Turneringsadministrasjon og resultathåndtering</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vårt engasjement */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                                    Vårt engasjement
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi er engasjert i:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Å levere nøyaktig og oppdatert informasjon</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Å støtte norsk badmintonutvikling</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-400 mt-1 flex-shrink-0" />
                                            <span>Å skape en inkluderende badmintonfellesskap</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Samarbeid */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faHandshake} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Samarbeid
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p>Vi samarbeider med:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Norges Badmintonforbund</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Lokale badmintonklubber</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-400 mt-1 flex-shrink-0" />
                                            <span>Turneringsarrangører</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kontaktinformasjon */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                                <FontAwesomeIcon icon={faBuilding} className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">
                                    Kontaktinformasjon
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <div className="space-y-2">
                                        <p className="flex items-center space-x-2">
                                            <FontAwesomeIcon icon={faBuilding} className="text-indigo-400" />
                                            <span>Torstein Vikse Olsen</span>
                                        </p>
                                        <p className="flex items-center space-x-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-400" />
                                            <span>Org.nr: 931 817 523</span>
                                        </p>
                                        <p className="flex items-center space-x-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-400" />
                                            <span>Oslo, Norge</span>
                                        </p>
                                        <p className="flex items-center space-x-2">
                                            <FontAwesomeIcon icon={faPhone} className="text-indigo-400" />
                                            <span>+47 95 36 84 24</span>
                                        </p>
                                        <p className="flex items-center space-x-2">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-indigo-400" />
                                            <a href="mailto:torstein.vikse@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                                                torstein.vikse@gmail.com
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mt-16 text-center text-sm text-gray-400 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <p>Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}</p>
                    <div className="mt-4 space-y-2">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} BadStat. Alle rettigheter reservert.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <a href="/personvern" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 text-xs">
                                Personvern
                            </a>
                            <a href="/vilkar" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 text-xs">
                                Vilkår
                            </a>
                        </div>
                        <p className="text-xs text-gray-500 max-w-2xl mx-auto mt-4">
                            BadStat samler inn og behandler data i henhold til norsk personvernlovgivning. 
                            Vi bruker informasjonskapsler og lignende teknologier for å forbedre brukeropplevelsen og 
                            tilby personlig tilpassede tjenester. Tredjepartsinnhold og lenker til eksterne nettsteder 
                            er ikke under vår kontroll, og vi påtar oss ikke ansvar for slikt innhold.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OmOss; 