import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import PlayerDetail from './PlayerDetail';
import PlayerComparison from './components/PlayerComparison';
import Navbar from "./Navigation/Navbar.js";
import Hvorfor from './pages/Hvorfor';
import Hvordan from './pages/Hvordan';
import PlayerSearch from './components/PlayerSearch';
import { AuthenticationContextProvider, AuthenticationContext } from './Auth-Context.js';
import RegisterScreen from './RegisterScreen';
import AccountScreen from './AccountScreen.js';
import Home from './components/hjemmeside.js';
import LinkRequestScreen from './components/requestLink.js';
import AdminComponent from './components/admin.js';
import Diary from './components/diary.js';
import PlayerList from './components/PlayerList.js';
import ScrollToTop from './components/ScrollToTop';
import './App.css';
import Leaderboard from './components/MostGames.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faLock, 
    faUser, 
    faChartLine, 
    faTrophy, 
    faHandshake, 
    faBook, 
    faDatabase,
    faArrowRight,
    faArrowLeft,
    faCalendarAlt,
    faTag,
    faShare,
    faChevronRight,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import ShuttlecockIcon from './components/ShuttlecockIcon';
import OmOss from './pages/OmOss';
import Personvern from './pages/Personvern';
import Vilkar from './pages/Vilkar';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Footer from './components/Footer';
import YearInReview from './components/yearInReview/YearInReview.js';
import PremiumSubscription from './components/PremiumSubscription.js';
import PremiumGate from './components/PremiumGate.js';

const Changelog = () => {
  return (
    <div className="Oppdateringer">
      <h3>Updates 💪</h3>
      <ul>
        <li>Version 1.0.0 (2025): Premium subscription system launched</li>
        <li>Version 0.8.0 (01/2024): Turneringsoversikt(Spillerdetaljer)</li>
        <li>Version 0.2.0 (10/2023): Head to head - Kamper</li>
        <li>Version 0.2.0 (09/2023): Head to head - rankingpoeng</li>
        <li>Version 0.1.0 (05/2023): La til navigasjonsbar og sider</li>
        <li>Version 0.0.2 (05/2023): Kan se basic trender og mobilvennlighet</li>
        <li>Version 0.0.1 (05/2023): Development started</li>
      </ul>
    </div>
  );
};

const AuthRequired = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating shuttlecocks */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 text-indigo-400 opacity-40 animate-float">
          <ShuttlecockIcon className="w-full h-full" color="currentColor" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 text-teal-400 opacity-40 animate-float" style={{ animationDelay: '1s' }}>
          <ShuttlecockIcon className="w-full h-full" color="currentColor" />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-12 h-12 text-amber-400 opacity-40 animate-float" style={{ animationDelay: '2s' }}>
          <ShuttlecockIcon className="w-full h-full" color="currentColor" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faLock} className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Autentisering Kreves</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Denne funksjonen er kun tilgjengelig for innloggede brukere. Logg inn eller opprett en konto for å få tilgang.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to="/account"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 relative overflow-hidden group flex items-center justify-center"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Logg inn
                </span>
              </Link>
              
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-amber-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-teal-500/25 relative overflow-hidden group flex items-center justify-center"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  Opprett konto
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300 group-hover:rotate-6">
                  <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">Spillerstatistikk</h3>
                <p className="text-gray-300">Få tilgang til detaljert statistikk og analyser for badmintonspillere</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                <div className="h-12 w-12 bg-gradient-to-r from-teal-500 to-amber-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:rotate-6">
                  <FontAwesomeIcon icon={faHandshake} className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">Head-to-Head</h3>
                <p className="text-gray-300">Analyser historiske oppgjør mellom spillere og få detaljert innsikt</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:rotate-6">
                  <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">Badminton Dagbok</h3>
                <p className="text-gray-300">Hold oversikt over dine kamper og dokumenter din utvikling</p>
              </div>
            </div>
            
            <div className="mt-12">
              <Link
                to="/"
                className="inline-flex items-center text-indigo-300 hover:text-indigo-200 transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faArrowRight} className="mr-2 transform rotate-180" />
                Tilbake til forsiden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { isAuthenticated, user, isLoading } = useContext(AuthenticationContext);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>; // Customize as needed
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/account" element={<AccountScreen />} />
          <Route path="/premium" element={<PremiumSubscription />} />
          <Route path="/premium/callback" element={<PremiumSubscription />} />
          <Route path="/OmOss" element={<OmOss />} />
          <Route path="/Personvern" element={<Personvern />} />
          <Route path="/Vilkar" element={<Vilkar />} />
          <Route path="/" element={<Home />} />
          
          {/* Premium gated routes */}
          <Route path="/MostGames" element={<PremiumGate><Leaderboard /></PremiumGate>} />
          <Route path="/compare/:player1/:player2" element={<PremiumGate><PlayerComparison /></PremiumGate>} />
          <Route path="/player/:name" element={<PremiumGate><PlayerDetail /></PremiumGate>} />
          <Route path="/player/:name/year-in-review" element={<PremiumGate><YearInReview /></PremiumGate>} />
          <Route path="/hvorfor" element={<PremiumGate><Hvorfor /></PremiumGate>} />
          <Route path="/hvordan" element={<PremiumGate><Hvordan /></PremiumGate>} />
          <Route path="/link" element={<PremiumGate><LinkRequestScreen /></PremiumGate>} />
          <Route path="/playerlist" element={<PremiumGate><PlayerList /></PremiumGate>} />
          <Route path="/playerslist" element={<PremiumGate><PlayerList /></PremiumGate>} />
          <Route path="/headtohead" element={<PremiumGate><PlayerSearch /></PremiumGate>} />
          <Route path="/blogg" element={<PremiumGate><Blog /></PremiumGate>} />
          <Route path="/blogg/:id" element={<PremiumGate><BlogPost /></PremiumGate>} />
          <Route path="/diary" element={isAuthenticated ? <PremiumGate><Diary /></PremiumGate> : <AuthRequired />} />
          <Route path="/admin" element={isAuthenticated ? <AdminComponent /> : <AuthRequired />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthenticationContextProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthenticationContextProvider>
  );
};

export default App;