import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthenticationContext } from "../Auth-Context.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate, faCrown, faUpgrade } from '@fortawesome/free-solid-svg-icons';
import VippsPaymentButton from '../components/VippsPaymentButton';

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { isAuthenticated, onLogout, hasPremiumAccess, userData } = useContext(AuthenticationContext);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const handleLinkClick = () => setIsCollapsed(true);
  const handleLogoutClick = async () => {
    await onLogout();
    handleLinkClick();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinkClasses = (path) => 
    `relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 no-underline
    ${isActivePath(path) 
      ? 'text-white bg-white/10 no-underline' 
      : 'text-gray-300 hover:text-white hover:bg-white/5 no-underline'}`;

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/85 backdrop-blur-lg shadow-lg' 
        : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={handleLinkClick}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent group-hover:to-blue-300 transition-all duration-300">
              BadStat
            </span>
            {hasPremiumAccess && (
              <FontAwesomeIcon 
                icon={faCrown} 
                className="text-amber-400 text-sm animate-pulse" 
                title="Premium subscriber"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/blogg" className={navLinkClasses('/blogg')} onClick={handleLinkClick}>
              Blogg
            </Link>
            <Link to="/headtohead" className={navLinkClasses('/headtohead')} onClick={handleLinkClick}>
              Head to Head
            </Link>
            <Link to="/PlayerList" className={navLinkClasses('/PlayerList')} onClick={handleLinkClick}>
              Spillersøk
            </Link>
            <Link to="/Diary" className={navLinkClasses('/Diary')} onClick={handleLinkClick}>
              BadmintonDagbok
            </Link>
            <Link to="/MostGames" className={navLinkClasses('/MostGames')} onClick={handleLinkClick}>
              Topplisten
            </Link>
            <div className="relative group">
              <button className={navLinkClasses('')}>
                Mer
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link to="/OmOss" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={handleLinkClick}>
                    Om Oss
                  </Link>
                  <Link to="/Personvern" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={handleLinkClick}>
                    Personvern
                  </Link>
                  <Link to="/Vilkar" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" onClick={handleLinkClick}>
                    Vilkår
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Premium Status / Upgrade Button */}
            {isAuthenticated && !hasPremiumAccess && (
              <VippsPaymentButton 
                size="small"
                variant="text"
                showText={true}
              />
            )}
            
            {isAuthenticated ? (
              <button
                onClick={handleLogoutClick}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Logg ut
              </button>
            ) : (
              <Link
                to="/account"
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                onClick={handleLinkClick}
              >
                Logg inn
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleNavbar}
            className="md:hidden relative w-10 h-10 text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-6 transform transition-all duration-300 ${isCollapsed ? '' : 'rotate-45 translate-y-0'}`}>
                <span className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${isCollapsed ? '-translate-y-2' : ''}`}></span>
                <span className={`absolute h-0.5 bg-white transform transition-all duration-300 ${isCollapsed ? 'w-6' : 'w-0'}`}></span>
                <span className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${isCollapsed ? 'translate-y-2' : '-rotate-90'}`}></span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden absolute inset-x-0 top-16 transform transition-all duration-300 ease-in-out ${
        isCollapsed ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        } ${scrolled ? 'bg-gray-900/85 backdrop-blur-lg' : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'}`}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          {/* Premium Status in Mobile */}
          {isAuthenticated && hasPremiumAccess && (
            <div className="px-4 py-2 mb-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCrown} className="text-amber-400 text-sm" />
                <span className="text-amber-300 text-sm font-medium">Premium aktiv</span>
              </div>
            </div>
          )}
          
          <Link
            to="/blogg"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/blogg') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Blogg
          </Link>
          <Link
            to="/headtohead"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/headtohead') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Head to Head
          </Link>
          <Link
            to="/PlayerList"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/PlayerList') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Spillersøk
          </Link>
          <Link
            to="/Diary"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/Diary') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            BadmintonDagbok
          </Link>
          <Link
            to="/MostGames"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/MostGames') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Topplisten
          </Link>
          <Link
            to="/OmOss"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/OmOss') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Om Oss
          </Link>
          <Link
            to="/Personvern"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/Personvern') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Personvern
          </Link>
          <Link
            to="/Vilkar"
            className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 no-underline ${
              isActivePath('/Vilkar') 
                ? 'bg-blue-500/20 text-white' 
                : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'
            }`}
            onClick={handleLinkClick}
          >
            Vilkår
          </Link>
          
          {/* Premium Upgrade Button for Mobile */}
          {isAuthenticated && !hasPremiumAccess && (
            <div className="mt-4 flex justify-center">
              <VippsPaymentButton 
                size="normal"
                variant="primary"
              />
            </div>
          )}
          
          {isAuthenticated ? (
            <button
              onClick={handleLogoutClick}
              className="w-full mt-4 px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              Logg ut
            </button>
          ) : (
            <Link
              to="/account"
              className="block w-full mt-4 px-4 py-3 text-base font-medium text-center text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              onClick={handleLinkClick}
            >
              Logg inn
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
