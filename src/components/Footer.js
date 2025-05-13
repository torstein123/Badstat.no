import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Om BadStat</h3>
                        <p className="text-gray-400 text-sm">
                            Din pålitelige kilde til badmintonstatistikk og rangeringer i Norge.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Kontakt</h3>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p>Torstein Vikse Olsen</p>
                            <p>Org.nr: 931 817 523</p>
                            <p>Oslo, Norge</p>
                            <p>+47 95 36 84 24</p>
                            <a href="mailto:torstein.vikse@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                                torstein.vikse@gmail.com
                            </a>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Ressurser</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/blogg" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">
                                    Blogg
                                </Link>
                            </li>
                            <li>
                                <Link to="/hvorfor" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">
                                    Hvorfor BadStat?
                                </Link>
                            </li>
                            <li>
                                <Link to="/hvordan" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">
                                    Hvordan det fungerer
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Juridisk</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/personvern" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">
                                    Personvern
                                </Link>
                            </li>
                            <li>
                                <Link to="/vilkar" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">
                                    Vilkår
                                </Link>
                            </li>
                            <li>
                                <Link to="/omoss" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">
                                    Om oss
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm flex items-center">
                            <FontAwesomeIcon icon={faCopyright} className="mr-2" />
                            {currentYear} BadStat. Alle rettigheter reservert.
                        </p>
                        <div className="flex space-x-4">
                            <a href="/personvern" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300 text-sm">
                                Personvern
                            </a>
                            <a href="/vilkar" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300 text-sm">
                                Vilkår
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 