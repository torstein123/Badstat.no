/**
 * Year in Review Component
 * 
 * A full-screen, story-like user interface that showcases a player's 
 * badminton achievements and statistics for the year.
 * 
 * Features:
 * - Uses real player data from matches and rankings
 * - Visualizes matches, wins, losses, and ranking distribution
 * - Mobile-optimized, full-screen interface
 * - Handles various edge cases and error states gracefully
 * - Interactive navigation with progress indicators
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faArrowDown, 
  faCalendarAlt, 
  faUsers, 
  faUserFriends,
  faSkull,
  faExclamationCircle,
  faChartLine,
  faArrowLeft,
  faArrowRight,
  faHeart,
  faLaughBeam,
  faFire,
  faMedal
} from '@fortawesome/free-solid-svg-icons';
import StatCard from './StatCard';
import BiggestWin from './BiggestWin';
import BiggestLoss from './BiggestLoss';
import MostGames from './MostGames';
import MatchTypeBreakdown from './MatchTypeBreakdown';
import TopPartner from './TopPartner';
import Nemesis from './Nemesis';
import ClosestMatch from './ClosestMatch';
import RankingDistribution from './RankingDistribution';
import SEO from '../SEO';
import processPlayerData from '../../utils/processPlayerData';
import { getPlayerRankingsByCategory, getPlayerMatches } from '../../services/databaseService';

// Fun comments for each slide
const slideComments = {
  intro: [
    "La oss se hvordan 2024/2025-sesongen din gikk! 🏸",
    "Gjør deg klar for høydepunktene fra 2024/2025-sesongen din! 🤩",
    "På tide å briljere med statistikken fra 2024/2025-sesongen! 💪"
  ],
  biggestWin: [
    "Du KNUSTE all motstand! 🔥",
    "De så det aldri komme! 👀",
    "Denne seieren fortjener applaus! 😘"
  ],
  biggestLoss: [
    "Alle har dårlige dager... dette var din! 😅",
    "La oss bare si at du hadde en dårlig dag! 🙈",
    "Kanskje ikke minn dem på denne! 🤫"
  ],
  mostGames: [
    "Maratonspiller-varsel! ⚠️",
    "Noen er hekta på badminton! 👀",
    "Beina dine må ha vært SLITNE! 🦵"
  ],
  matchTypes: [
    "Badminton-porteføljen din er diversifisert! 📊",
    "Se på deg som varierer spillet! 🎯",
    "Mester i alt, kanskje? 👑"
  ],
  topPartner: [
    "Dere to er drømmelaget! 🤝",
    "Dere er dynamitt sammen! 😍",
    "Nevn en mer ikonisk duo, jeg venter! ⏱️"
  ],
  nemesis: [
    "Din erkefiende! Bedre å trene hardere! 😤",
    "Denne spilleren hjemsøker drømmene dine! 👻",
    "Neste år skal de NED! 👇"
  ],
  closestMatch: [
    "Snakk om en neglebiter! 💅",
    "Puls: ⬆️⬆️⬆️",
    "Publikum gikk AMOK! 🎉"
  ],
  rankingDistribution: [
    "Poeng gir premier! 🏆",
    "Rangeringene lyver ikke! 📈",
    "Her vises alt det harde arbeidet ditt! 💯"
  ],
  outro: [
    "Det var alt, folkens! Sees neste sesong! 👋",
    "Fortsett å smashe i 2025/2026-sesongen! 🏆",
    "Du er offisielt en badminton-legende for 2024/2025-sesongen! 🌟"
  ]
};

// Random comment selector
const getRandomComment = (slideType) => {
  const comments = slideComments[slideType] || slideComments.intro;
  return comments[Math.floor(Math.random() * comments.length)];
};

// Add placeholders for missing data in each slide component
const getPlaceholderData = (type) => {
  switch (type) {
    case 'biggestWin':
      return {
        opponent: "Ingen kamper registrert",
        score: "0-0",
        tournament: "Data ikke tilgjengelig",
        date: ""
      };
    case 'biggestLoss':
      return {
        opponent: "Ingen kamper registrert",
        score: "0-0",
        tournament: "Data ikke tilgjengelig",
        date: ""
      };
    case 'mostGames':
      return {
        tournament: "Ingen turneringer funnet",
        date: "",
        gamesPlayed: 0
      };
    case 'matchTypes':
      return {
        singles: 0,
        doubles: 0,
        mixed: 0
      };
    case 'topPartner':
      return {
        name: "Ingen doublekamper funnet",
        gamesPlayed: 0,
        winRate: 0
      };
    case 'nemesis':
      return {
        name: "Ingen tapte kamper funnet",
        gamesPlayed: 0,
        lossRate: 0
      };
    case 'closestMatch':
      return {
        opponent: "Ingen tre-settskamper funnet",
        score: "0-0, 0-0, 0-0",
        tournament: "Data ikke tilgjengelig",
        date: ""
      };
    default:
      return null;
  }
};

// Slide components
const IntroSlide = ({ name, onNext }) => (
  <motion.div 
    className="slide-content flex flex-col items-center justify-center text-center w-full max-w-md mx-auto px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Background animated elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-400/40"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: Math.random() * 1.5 + 0.5,
          }}
          animate={{
            y: [0, -30],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mb-8 relative"
    >
      <div className="w-32 h-32 mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        <motion.div 
          className="w-full h-full flex items-center justify-center text-6xl"
          animate={{ 
            rotate: [0, 10, -5, 0],
            y: [0, -5, 5, 0] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "mirror" 
          }}
        >
          🏸
        </motion.div>
      </div>
      
      {/* Light beams */}
      <div className="absolute -inset-4 -z-10 opacity-30">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-4 bg-purple-500/30 blur-xl rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-4 bg-pink-500/30 blur-xl rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
    
    <motion.h1 
      className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {name}s 2024/2025
    </motion.h1>
    
    <motion.h2 
      className="text-3xl md:text-4xl font-bold text-white mb-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Sesonggjennomgang
    </motion.h2>
    
    <motion.p 
      className="text-xl text-purple-200 mb-12"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      {getRandomComment('intro')}
    </motion.p>
    
    <motion.button
      onClick={onNext}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg shadow-lg flex items-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9 }}
    >
      Sett i gang! <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
    </motion.button>
  </motion.div>
);

const OutroSlide = ({ name, onPrev, onRestart }) => (
  <motion.div 
    className="slide-content flex flex-col items-center justify-center text-center w-full max-w-md mx-auto px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Background confetti effect */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            backgroundColor: `hsl(${Math.random() * 60 + 270}, ${Math.random() * 40 + 60}%, ${Math.random() * 40 + 60}%)`,
            rotate: `${Math.random() * 360}deg`,
          }}
          animate={{
            y: [0, Math.random() * 100 + 100],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, Math.random() * 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: [0, 5, -5, 0] }}
      transition={{ duration: 0.6, rotate: { repeat: Infinity, duration: 2 } }}
      className="mb-8 relative"
    >
      <div className="w-32 h-32 mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="w-full h-full flex items-center justify-center text-6xl">🏆</div>
        
        {/* Animated ring around trophy */}
        <div className="absolute -inset-4 -z-10">
          <motion.div 
            className="w-full h-full rounded-full border-2 border-dashed border-purple-500/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
    
    <motion.h1 
      className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Sesongen er fullført!
    </motion.h1>
    
    <motion.p 
      className="text-xl text-purple-200 mb-12"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {getRandomComment('outro')}
    </motion.p>
    
    <div className="flex flex-col sm:flex-row gap-4">
      <motion.button
        onClick={onPrev}
        className="px-6 py-3 bg-gray-700 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Forrige
      </motion.button>
      
      <motion.button
        onClick={onRestart}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Start på nytt <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
      </motion.button>
    </div>
    
    <motion.div
      className="mt-12"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <Link 
        to={`/player/${name}`}
        className="text-purple-300 hover:text-white transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Tilbake til profil
      </Link>
    </motion.div>
  </motion.div>
);

const SlideComment = ({ type }) => (
  <motion.div 
    className="absolute bottom-8 md:bottom-10 left-0 right-0 flex justify-center pointer-events-none z-10"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full text-white font-medium shadow-lg border border-white/10 max-w-[90%]">
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></span>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center"
      >
        <FontAwesomeIcon icon={faLaughBeam} className="mr-2 text-yellow-400" />
        <span className="relative z-10">{getRandomComment(type)}</span>
      </motion.div>
    </div>
  </motion.div>
);

const ProgressBar = ({ currentIndex, totalSlides }) => (
  <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-20">
    <motion.div 
      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
      initial={{ width: 0 }}
      animate={{ width: `${(currentIndex / (totalSlides - 1)) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
);

// Story Navigation indicators - dots at top
const StoryNav = ({ currentIndex, totalSlides, onDotClick }) => (
  <div className="fixed top-4 left-0 right-0 z-20 flex justify-center gap-1.5">
    {Array.from({ length: totalSlides }).map((_, i) => (
      <motion.button
        key={i}
        onClick={() => onDotClick(i)}
        className={`w-12 h-1 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      />
    ))}
  </div>
);

const YearInReview = () => {
  const { name } = useParams();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Initialiserer...');
  
  // Total number of slides including intro and outro
  const totalSlides = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Update loading status
        setLoadingStatus('Laster kampdata...');
        
        // Get match data from database
        const matchData = await getPlayerMatches(name);
        
        // Filter matches for the current season (2024/2025)
        const playerMatches = matchData.filter(match => {
          // Check if player is in the match and player names are valid
          const playerInMatch = match["Team 1 Player 1"] === name || 
                                match["Team 1 Player 2"] === name ||
                                match["Team 2 Player 1"] === name || 
                                match["Team 2 Player 2"] === name;
          
          // Validate all player names in the match to avoid "NaN" issues
          const hasValidPlayers = 
            (!match["Team 1 Player 1"] || typeof match["Team 1 Player 1"] === 'string') &&
            (!match["Team 1 Player 2"] || typeof match["Team 1 Player 2"] === 'string') &&
            (!match["Team 2 Player 1"] || typeof match["Team 2 Player 1"] === 'string') &&
            (!match["Team 2 Player 2"] || typeof match["Team 2 Player 2"] === 'string');
          
          // Check if match is from current season
          let isCurrentSeason = false;
          
          // Try to determine season from the Season field if available
          if (match.Season) {
            isCurrentSeason = match.Season === '2024/2025' || 
                             match.Season === '2024-2025' || 
                             match.Season === '2024/25' ||
                             match.Season.includes('2024/2025');
          } 
          // If no Season field, try to determine from date
          else if (match.Date) {
            try {
              // Parse date (assuming format DD.MM.YYYY)
              const dateParts = match.Date.split('.');
              if (dateParts.length === 3) {
                const year = parseInt(dateParts[2]);
                const month = parseInt(dateParts[1]) - 1; // 0-based month
                const day = parseInt(dateParts[0]);
                
                // Define season boundaries: July 1, 2024 to June 30, 2025
                const isCurrentSeason2024_2025 = 
                  // July 1, 2024 to December 31, 2024
                  (year === 2024 && month >= 6) || 
                  // January 1, 2025 to June 30, 2025
                  (year === 2025 && month <= 5);
                
                isCurrentSeason = isCurrentSeason2024_2025;
              }
            } catch (error) {
              console.error("Error parsing date:", error);
            }
          }
          
          return playerInMatch && hasValidPlayers && isCurrentSeason;
        });
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`YearInReview: Found ${matchData.length} total matches for ${name}`);
          console.log(`YearInReview: Filtered to ${playerMatches.length} matches for 2024/2025 season`);
          if (playerMatches.length > 0) {
            console.log('YearInReview: Sample match:', {
              season: playerMatches[0].Season,
              date: playerMatches[0].Date,
              tournament: playerMatches[0]['Tournament Name'],
              result: playerMatches[0].Result
            });
          }
        }
        
        setLoadingStatus('Analyserer kamper...');
        
        // Get player statistics using the existing utility function
        const playerStats = await processPlayerData(name);
        
        setLoadingStatus('Beregner rangeringer...');
        
        // Get ranking data
        const currentYear = '2024';
        const previousYear = '2023';
        
        // Get player data from all categories
        const playerHS = await getPlayerRankingsByCategory(name, 'HS');
        const playerDS = await getPlayerRankingsByCategory(name, 'DS');
        const playerHD = await getPlayerRankingsByCategory(name, 'HD');
        const playerDD = await getPlayerRankingsByCategory(name, 'DD');
        const playerMIX = await getPlayerRankingsByCategory(name, 'MIX');
        
        // Determine if player is male or female based on which category has more points
        const isMale = (playerHS ? parseFloat(playerHS[currentYear] || 0) : 0) > 
                      (playerDS ? parseFloat(playerDS[currentYear] || 0) : 0);
        
        // Calculate match types statistics with improved categorization
        // First, let's log some sample matches to see what fields are available
        if (process.env.NODE_ENV === 'development') {
          console.log('Sample matches (first 5):', playerMatches.slice(0, 5).map(match => ({
            match: match.Match,
            category: match.Category,
            event: match.Event,
            type: match.Type,
            matchType: match.MatchType,
            team1: [match["Team 1 Player 1"], match["Team 1 Player 2"]],
            team2: [match["Team 2 Player 1"], match["Team 2 Player 2"]],
            result: match.Result
          })));
        }
        
        // Match type detection functions
        const isSinglesMatch = (match) => {
          const fields = [match.Match, match.Category, match.Event, match.Type, match.MatchType]
            .filter(f => typeof f === 'string')
            .map(f => f.toLowerCase());
        
          // 1. Check for explicit singles labels
          const singlesKeywords = ['Herresingle', 'Damesingle'];
          const hasSinglesKeyword = fields.some(f =>
            singlesKeywords.some(keyword => f === keyword.toLowerCase() || f.includes(keyword.toLowerCase()))
          );
        
          const hasDoublesOrMixedKeyword = fields.some(f =>
            f.includes('double') || f.includes('dobbel') || f.includes('mixed') || f.includes('mix')
          );
        
          if (hasSinglesKeyword && !hasDoublesOrMixedKeyword) {
            return true;
          }
        
          // 2. Fallback: if both teams only have one player each
          const t1p1 = match["Team 1 Player 1"];
          const t1p2 = match["Team 1 Player 2"];
          const t2p1 = match["Team 2 Player 1"];
          const t2p2 = match["Team 2 Player 2"];
        
          const team1Count = (t1p1 && t1p1 !== 'NaN' ? 1 : 0) + (t1p2 && t1p2 !== 'NaN' ? 1 : 0);
          const team2Count = (t2p1 && t2p1 !== 'NaN' ? 1 : 0) + (t2p2 && t2p2 !== 'NaN' ? 1 : 0);
        
          return team1Count === 1 && team2Count === 1;
        };
        
        const isDoublesMatch = (match) => {
          // This function assumes isSinglesMatch(match) was false
          const fields = [match.Match, match.Category, match.Event, match.Type, match.MatchType].filter(f => f && typeof f === 'string');
          const lcFields = fields.map(f => f.toLowerCase());
        
          if (match.Match === 'Herredouble' || match.Match === 'Damedouble') return true;
        
          const hasDoublesKeyword = lcFields.some(f => (f.includes('double') || f.includes('dobbel')) && !f.includes('mixed'));
          if (hasDoublesKeyword) return true;
        
          let team1PlayerCount = 0;
          let team2PlayerCount = 0;
          if (match["Team 1 Player 1"] && match["Team 1 Player 1"] !== "NaN") team1PlayerCount++;
          if (match["Team 1 Player 2"] && match["Team 1 Player 2"] !== "NaN") team1PlayerCount++;
          if (match["Team 2 Player 1"] && match["Team 2 Player 1"] !== "NaN") team2PlayerCount++;
          if (match["Team 2 Player 2"] && match["Team 2 Player 2"] !== "NaN") team2PlayerCount++;
        
          if (team1PlayerCount === 2 && team2PlayerCount === 2) {
            const isExplicitlyMixed = match.Match === 'Mixeddouble' || lcFields.some(f => f.includes('mixed') || f.includes('mix'));
            return !isExplicitlyMixed;
          }
          return false;
        };
        
        const isMixedMatch = (match) => {
          // This function assumes isSinglesMatch(match) and isDoublesMatch(match) were false
          const fields = [match.Match, match.Category, match.Event, match.Type, match.MatchType].filter(f => f && typeof f === 'string');
          const lcFields = fields.map(f => f.toLowerCase());
        
          if (match.Match === 'Mixeddouble') return true;
          if (lcFields.some(f => f.includes('mixed') || f.includes('mix'))) return true;
          
          let team1PlayerCount = 0;
          let team2PlayerCount = 0;
          if (match["Team 1 Player 1"] && match["Team 1 Player 1"] !== "NaN") team1PlayerCount++;
          if (match["Team 1 Player 2"] && match["Team 1 Player 2"] !== "NaN") team1PlayerCount++;
          if (match["Team 2 Player 1"] && match["Team 2 Player 1"] !== "NaN") team2PlayerCount++;
          if (match["Team 2 Player 2"] && match["Team 2 Player 2"] !== "NaN") team2PlayerCount++;
        
          if (team1PlayerCount === 2 && team2PlayerCount === 2) {
            return true; 
          }
          return false;
        };
        
        let singlesMatchesCount = 0;
        let doublesMatchesCount = 0;
        let mixedMatchesCount = 0;
        let fullyUncategorizedMatches = [];

        playerMatches.forEach(match => {
          if (isSinglesMatch(match)) {
            singlesMatchesCount++;
          } else if (isDoublesMatch(match)) {
            doublesMatchesCount++;
          } else if (isMixedMatch(match)) {
            mixedMatchesCount++;
          } else {
            if (process.env.NODE_ENV === 'development') {
              fullyUncategorizedMatches.push(match);
            }
          }
        });
        
        // Add diagnostic logging for match types
        if (process.env.NODE_ENV === 'development') {
          // Count uncategorized matches
          // const uncategorizedMatches = playerMatches.filter( // This was the old way
          //   match => !isSinglesMatch(match) && !isDoublesMatch(match) && !isMixedMatch(match)
          // );
          
          console.log('Match type counts (new logic):', {
            singles: singlesMatchesCount,
            doubles: doublesMatchesCount,
            mixed: mixedMatchesCount,
            total: playerMatches.length,
            uncategorized_after_all_rules: fullyUncategorizedMatches.length
          });

          if (fullyUncategorizedMatches.length > 0) {
            console.log('Fully Uncategorized matches (first 5):', fullyUncategorizedMatches.slice(0, 5).map(m => ({ Match: m.Match, T1P1: m["Team 1 Player 1"], T1P2: m["Team 1 Player 2"], T2P1: m["Team 2 Player 1"], T2P2: m["Team 2 Player 2"] })));
          }
          
          // Log sample singles matches to verify detection
          const singleMatches = playerMatches.filter(isSinglesMatch);
          if (singleMatches.length > 0) {
            console.log('Sample singles matches (first 5):', singleMatches.slice(0, 5).map(match => ({
              match: match.Match,
              category: match.Category,
              event: match.Event,
              type: match.Type,
              matchType: match.MatchType,
              team1: [match["Team 1 Player 1"], match["Team 1 Player 2"]],
              team2: [match["Team 2 Player 1"], match["Team 2 Player 2"]]
            })));
          } else {
            console.log('No singles matches detected!');
          }
          
          // Log all unique match types for debugging
          const uniqueMatchTypes = new Set();
          const uniqueCategories = new Set();
          const uniqueEvents = new Set();
          const uniqueTypes = new Set();
          
          playerMatches.forEach(match => {
            if (match.Match) uniqueMatchTypes.add(match.Match);
            if (match.Category) uniqueCategories.add(match.Category);
            if (match.Event) uniqueEvents.add(match.Event);
            if (match.Type) uniqueTypes.add(match.Type);
            if (match.MatchType) uniqueTypes.add(match.MatchType);
          });
          
          console.log('Unique match fields found:', {
            Match: Array.from(uniqueMatchTypes),
            Category: Array.from(uniqueCategories),
            Event: Array.from(uniqueEvents),
            Type: Array.from(uniqueTypes)
          });
          
          // Specific check for Herresingle matches
          const herresingleMatches = playerMatches.filter(match => match.Match === "Herresingle");
          console.log(`Found ${herresingleMatches.length} exact "Herresingle" matches`);
          if (herresingleMatches.length > 0) {
            console.log('Sample Herresingle match:', {
              match: herresingleMatches[0].Match,
              exactMatch: herresingleMatches[0].Match === "Herresingle",
              length: herresingleMatches[0].Match ? herresingleMatches[0].Match.length : 0,
              charCodes: herresingleMatches[0].Match ? Array.from(herresingleMatches[0].Match).map(c => c.charCodeAt(0)) : []
            });
          }
        }
        
        // Find biggest win - match with largest point differential where player won
        const getMatchPointDifferential = (match) => {
          try {
            const sets = match.Result.split(',');
            let totalDiff = 0;
            
            // Check if player is in team 1 or team 2
            const isTeam1 = match["Team 1 Player 1"] === name || match["Team 1 Player 2"] === name;
            
            sets.forEach(set => {
              // Different formats possible, try both slash and dash
              const scores = set.includes('/') 
                ? set.split('/').map(Number) 
                : set.split('-').map(Number);
              
              if (scores.length === 2) {
                if (isTeam1) {
                  totalDiff += scores[0] - scores[1];
                } else {
                  totalDiff += scores[1] - scores[0];
                }
              }
            });
            
            return totalDiff;
          } catch (error) {
            console.error("Error calculating point differential:", error);
            return 0;
          }
        };
        
        // Check if player won the match
        const didPlayerWin = (match) => {
          return match["Winner Player 1"] === name || match["Winner Player 2"] === name;
        };
        
        // Sort matches by point differential
        const winningMatches = playerMatches.filter(didPlayerWin);
        winningMatches.sort((a, b) => getMatchPointDifferential(b) - getMatchPointDifferential(a));
        
        // Get the biggest win
        const biggestWin = winningMatches.length > 0 ? winningMatches[0] : null;
        
        // Find biggest loss - match with largest negative point differential
        const losingMatches = playerMatches.filter(match => !didPlayerWin(match));
        losingMatches.sort((a, b) => getMatchPointDifferential(a) - getMatchPointDifferential(b));
        
        // Get the biggest loss
        const biggestLoss = losingMatches.length > 0 ? losingMatches[0] : null;
        
        // Find most active tournament - count all matches (singles, doubles, mixed) per tournament
        const tournamentCounts = {};
        const tournamentDetails = {};
        
        // Count matches per tournament, ensure we have valid tournament names
        playerMatches.forEach(match => {
          const tournament = match["Tournament Name"];
          if (tournament && typeof tournament === 'string' && tournament.trim() !== '') {
            // Count total matches
            tournamentCounts[tournament] = (tournamentCounts[tournament] || 0) + 1;
            
            // Track match types per tournament for debugging
            if (!tournamentDetails[tournament]) {
              tournamentDetails[tournament] = {
                singles: 0,
                doubles: 0,
                mixed: 0,
                other: 0,
                date: match.Date || '',
                matches: []
              };
            }
            
            // Categorize the match using the same detection functions
            if (isSinglesMatch(match)) {
              tournamentDetails[tournament].singles++;
            } else if (isDoublesMatch(match)) {
              tournamentDetails[tournament].doubles++;
            } else if (isMixedMatch(match)) {
              tournamentDetails[tournament].mixed++;
            } else {
              tournamentDetails[tournament].other++;
            }
            
            // Store match info for debugging (limit to 3 per tournament)
            if (tournamentDetails[tournament].matches.length < 3) {
              tournamentDetails[tournament].matches.push({
                type: match.Match || match.Category || match.Event || match.Type || 'Unknown',
                result: match.Result,
                team1: [match["Team 1 Player 1"], match["Team 1 Player 2"]],
                team2: [match["Team 2 Player 1"], match["Team 2 Player 2"]]
              });
            }
          }
        });
        
        // Get tournament with most games
        let mostActiveTourn = null;
        let maxGames = 0;
        Object.entries(tournamentCounts).forEach(([tournament, count]) => {
          if (count > maxGames) {
            mostActiveTourn = tournament;
            maxGames = count;
          }
        });
        
        // Find tournament date from the first match at this tournament
        const tournamentMatch = playerMatches.find(m => m["Tournament Name"] === mostActiveTourn);
        const tournamentDate = tournamentMatch ? tournamentMatch.Date || '' : '';
        
        // Add diagnostic logging for tournament counts
        if (process.env.NODE_ENV === 'development') {
          console.log('Tournament counts:', tournamentCounts);
          console.log('Tournament details:', tournamentDetails);
          console.log('Most active tournament:', {
            name: mostActiveTourn,
            games: maxGames,
            date: tournamentDate,
            details: tournamentDetails[mostActiveTourn] || 'No details available'
          });
        }
        
        // Find top partner - player whom this player has played doubles with the most
        const partnerCounts = {};
        playerMatches.forEach(match => {
          let partner = null;
          
          // Check if player is in team 1
          if (match["Team 1 Player 1"] === name && match["Team 1 Player 2"] && match["Team 1 Player 2"] !== name) {
            partner = match["Team 1 Player 2"];
          } else if (match["Team 1 Player 2"] === name && match["Team 1 Player 1"] && match["Team 1 Player 1"] !== name) {
            partner = match["Team 1 Player 1"];
          }
          // Check if player is in team 2
          else if (match["Team 2 Player 1"] === name && match["Team 2 Player 2"] && match["Team 2 Player 2"] !== name) {
            partner = match["Team 2 Player 2"];
          } else if (match["Team 2 Player 2"] === name && match["Team 2 Player 1"] && match["Team 2 Player 1"] !== name) {
            partner = match["Team 2 Player 1"];
          }
          
          // Only count valid partner names and exclude "NaN" string
          if (partner && typeof partner === 'string' && partner.trim() !== '' && partner !== "NaN") {
            partnerCounts[partner] = (partnerCounts[partner] || 0) + 1;
          }
        });
        
        // Get partner with most matches
        let topPartner = null;
        let maxMatches = 0;
        Object.entries(partnerCounts).forEach(([partner, count]) => {
          if (count > maxMatches && partner && typeof partner === 'string' && partner.trim() !== '' && partner !== "NaN") {
            topPartner = partner;
            maxMatches = count;
          }
        });
        
        // Calculate win rate with top partner
        let topPartnerWins = 0;
        if (topPartner) {
          playerMatches.forEach(match => {
            // Check if match includes top partner
            const hasTopPartner = 
              (match["Team 1 Player 1"] === topPartner || match["Team 1 Player 2"] === topPartner ||
               match["Team 2 Player 1"] === topPartner || match["Team 2 Player 2"] === topPartner);
              
            if (hasTopPartner && didPlayerWin(match)) {
              topPartnerWins++;
            }
          });
        }
        
        const topPartnerWinRate = (maxMatches > 0 && !isNaN(maxMatches) && !isNaN(topPartnerWins)) 
          ? Math.round((topPartnerWins / maxMatches) * 100) 
          : 0;
        
        // Find nemesis - player who has defeated this player the most
        const nemesisCounts = {};
        losingMatches.forEach(match => {
          // Determine if player is in team 1 or team 2
          const isInTeam1 = match["Team 1 Player 1"] === name || match["Team 1 Player 2"] === name;
          const isInTeam2 = match["Team 2 Player 1"] === name || match["Team 2 Player 2"] === name;
          
          // Get actual opponents (players from the opposing team only)
          let opponents = [];
          if (isInTeam1) {
            // Player is in team 1, so opponents are from team 2
            if (match["Team 2 Player 1"] && match["Team 2 Player 1"] !== "NaN") {
              opponents.push(match["Team 2 Player 1"]);
            }
            if (match["Team 2 Player 2"] && match["Team 2 Player 2"] !== "NaN") {
              opponents.push(match["Team 2 Player 2"]);
            }
          } else if (isInTeam2) {
            // Player is in team 2, so opponents are from team 1
            if (match["Team 1 Player 1"] && match["Team 1 Player 1"] !== "NaN") {
              opponents.push(match["Team 1 Player 1"]);
            }
            if (match["Team 1 Player 2"] && match["Team 1 Player 2"] !== "NaN") {
              opponents.push(match["Team 1 Player 2"]);
            }
          }
          
          // Filter valid opponents
          opponents = opponents.filter(player => 
            player && 
            typeof player === 'string' && 
            player.trim() !== '' && 
            player !== name && 
            player !== "NaN"
          );
          
          // Count losses against each opponent
          opponents.forEach(opponent => {
            nemesisCounts[opponent] = (nemesisCounts[opponent] || 0) + 1;
          });
        });
        
        // Get opponent with most wins against player
        let nemesis = null;
        let maxLosses = 0;
        Object.entries(nemesisCounts).forEach(([opponent, count]) => {
          if (count > maxLosses && opponent && typeof opponent === 'string' && opponent.trim() !== '' && opponent !== "NaN") {
            nemesis = opponent;
            maxLosses = count;
          }
        });
        
        // Find total matches against nemesis to calculate loss rate
        let nemesisMatches = 0;
        if (nemesis && typeof nemesis === 'string') {
          playerMatches.forEach(match => {
            // Determine if player is in team 1 or team 2
            const isInTeam1 = match["Team 1 Player 1"] === name || match["Team 1 Player 2"] === name;
            const isInTeam2 = match["Team 2 Player 1"] === name || match["Team 2 Player 2"] === name;
            
            // Check if nemesis is on the opposing team
            let isNemesisOpponent = false;
            if (isInTeam1) {
              // Player is in team 1, nemesis should be in team 2
              isNemesisOpponent = match["Team 2 Player 1"] === nemesis || match["Team 2 Player 2"] === nemesis;
            } else if (isInTeam2) {
              // Player is in team 2, nemesis should be in team 1
              isNemesisOpponent = match["Team 1 Player 1"] === nemesis || match["Team 1 Player 2"] === nemesis;
            }
            
            if (isNemesisOpponent) {
              nemesisMatches++;
            }
          });
        }
        
        const nemesisLossRate = (nemesisMatches > 0 && !isNaN(maxLosses) && !isNaN(nemesisMatches)) 
          ? Math.round((maxLosses / nemesisMatches) * 100) 
          : 0;
        
        // Find closest match - match with smallest point differential in the final set
        const getMatchCloseness = (match) => {
          try {
            const sets = match.Result.split(',');
            
            // Only consider 3-set matches
            if (sets.length !== 3) return Infinity;
            
            // Get the final set
            const finalSet = sets[2];
            
            // Different formats possible, try both slash and dash
            const scores = finalSet.includes('/') 
              ? finalSet.split('/').map(Number) 
              : finalSet.split('-').map(Number);
            
            if (scores.length === 2) {
              return Math.abs(scores[0] - scores[1]);
            }
            
            return Infinity;
          } catch (error) {
            console.error("Error calculating match closeness:", error);
            return Infinity;
          }
        };
        
        // Get three-set matches
        const threeSetMatches = playerMatches.filter(match => {
          try {
            const sets = match.Result.split(',');
            return sets.length === 3;
          } catch {
            return false;
          }
        });
        
        // Sort by closeness
        threeSetMatches.sort((a, b) => getMatchCloseness(a) - getMatchCloseness(b));
        
        // Get closest match
        const closestMatch = threeSetMatches.length > 0 ? threeSetMatches[0] : null;
        
        // Function to format opponent string
        const formatOpponent = (match) => {
          const isTeam1 = match["Team 1 Player 1"] === name || match["Team 1 Player 2"] === name;
          
          if (isTeam1) {
            // Opponent is in team 2
            const player1 = match["Team 2 Player 1"] && match["Team 2 Player 1"] !== "NaN" ? match["Team 2 Player 1"] : null;
            const player2 = match["Team 2 Player 2"] && match["Team 2 Player 2"] !== "NaN" ? match["Team 2 Player 2"] : null;
            
            if (player1 && player2) {
              return `${player1} & ${player2}`;
            } else {
              return player1 || player2 || "Ukjent";
            }
          } else {
            // Opponent is in team 1
            const player1 = match["Team 1 Player 1"] && match["Team 1 Player 1"] !== "NaN" ? match["Team 1 Player 1"] : null;
            const player2 = match["Team 1 Player 2"] && match["Team 1 Player 2"] !== "NaN" ? match["Team 1 Player 2"] : null;
            
            if (player1 && player2) {
              return `${player1} & ${player2}`;
            } else {
              return player1 || player2 || "Ukjent";
            }
          }
        };
        
        setLoadingStatus('Bygger din 2024/2025 sesonggjennomgang...');
        
        // Create the data object with real data
        const realData = {
          biggestWin: biggestWin ? {
            opponent: formatOpponent(biggestWin),
            score: biggestWin.Result,
            tournament: biggestWin["Tournament Name"],
            date: biggestWin.Date
          } : null,
          biggestLoss: biggestLoss ? {
            opponent: formatOpponent(biggestLoss),
            score: biggestLoss.Result,
            tournament: biggestLoss["Tournament Name"],
            date: biggestLoss.Date
          } : null,
          mostGames: {
            tournament: mostActiveTourn || "Ingen turneringer funnet",
            date: tournamentDate,
            gamesPlayed: maxGames,
            breakdown: mostActiveTourn ? {
              singles: tournamentDetails[mostActiveTourn]?.singles || 0,
              doubles: tournamentDetails[mostActiveTourn]?.doubles || 0,
              mixed: tournamentDetails[mostActiveTourn]?.mixed || 0,
              other: tournamentDetails[mostActiveTourn]?.other || 0
            } : null
          },
          matchTypes: {
            singles: singlesMatchesCount,
            doubles: doublesMatchesCount,
            mixed: mixedMatchesCount
          },
          topPartner: topPartner ? {
            name: (topPartner === "NaN" || !topPartner) ? "Ukjent" : topPartner,
            gamesPlayed: maxMatches || 0,
            winRate: isNaN(topPartnerWinRate) ? 0 : topPartnerWinRate
          } : null,
          nemesis: nemesis ? {
            name: (nemesis === "NaN" || !nemesis) ? "Ukjent" : nemesis,
            gamesPlayed: nemesisMatches || 0,
            lossRate: isNaN(nemesisLossRate) ? 0 : nemesisLossRate
          } : null,
          closestMatch: closestMatch ? {
            opponent: formatOpponent(closestMatch),
            score: closestMatch.Result,
            tournament: closestMatch["Tournament Name"],
            date: closestMatch.Date
          } : null,
          rankingData: {
            year: currentYear,
            previousYear: previousYear
          }
        };
        
        // Set the player data with real values
        setPlayerData(realData);

        // Debug log for diagnoing NaN issues
        if (process.env.NODE_ENV === 'development') {
          console.log('============ DIAGNOSTICS ============');
          if (topPartner) {
            console.log('Top Partner:', {
              rawName: topPartner,
              isString: typeof topPartner === 'string',
              games: maxMatches,
              wins: topPartnerWins,
              winRate: topPartnerWinRate,
              hasNaN: isNaN(topPartnerWinRate)
            });
          }
          
          if (nemesis) {
            console.log('Nemesis:', {
              rawName: nemesis,
              isString: typeof nemesis === 'string',
              games: nemesisMatches,
              losses: maxLosses,
              lossRate: nemesisLossRate,
              hasNaN: isNaN(nemesisLossRate)
            });
            
            // Log all nemesis candidates for debugging
            console.log('All potential nemeses:', nemesisCounts);
            
            // Check if nemesis is also a partner (which would be incorrect)
            const isAlsoPartner = Object.keys(partnerCounts).includes(nemesis);
            console.log('Nemesis is also a partner?', isAlsoPartner);
            
            // Log some sample matches with this nemesis
            console.log('Sample matches with nemesis:');
            let matchesSampled = 0;
            playerMatches.forEach(match => {
              if (matchesSampled < 3) {
                const isInTeam1 = match["Team 1 Player 1"] === name || match["Team 1 Player 2"] === name;
                const isInTeam2 = match["Team 2 Player 1"] === name || match["Team 2 Player 2"] === name;
                
                let isNemesisOpponent = false;
                if (isInTeam1) {
                  isNemesisOpponent = match["Team 2 Player 1"] === nemesis || match["Team 2 Player 2"] === nemesis;
                } else if (isInTeam2) {
                  isNemesisOpponent = match["Team 1 Player 1"] === nemesis || match["Team 1 Player 2"] === nemesis;
                }
                
                if (isNemesisOpponent) {
                  console.log('Match:', {
                    team1: [match["Team 1 Player 1"], match["Team 1 Player 2"]],
                    team2: [match["Team 2 Player 1"], match["Team 2 Player 2"]],
                    result: match.Result,
                    playerTeam: isInTeam1 ? 1 : 2,
                    nemesisTeam: isInTeam1 ? 2 : 1
                  });
                  matchesSampled++;
                }
              }
            });
          }
          
          console.log('Final Data:', {
            topPartner: realData.topPartner,
            nemesis: realData.nemesis
          });
          console.log('====================================');
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Beklager, vi kunne ikke generere din sesonggjennomgang. Feil: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  // Navigation functions
  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const restartShow = () => {
    setDirection(1);
    setCurrentSlide(0);
  };

  // Handle touch/swipe
  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX;
    document.touchStartX = touchDown;
  };

  const handleTouchMove = (e) => {
    if (!document.touchStartX) return;
    
    const touchUp = e.touches[0].clientX;
    const diff = document.touchStartX - touchUp;
    
    if (diff > 50) { // Swipe left, go to next slide
      goToNextSlide();
    } else if (diff < -50) { // Swipe right, go to previous slide
      goToPrevSlide();
    }
    
    document.touchStartX = null;
  };

  // Handle key press for navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Auto-progress timer (optional)
  useEffect(() => {
    // Uncomment if you want auto-progress
    /*
    const timer = setTimeout(() => {
      if (currentSlide < totalSlides - 1) {
        goToNextSlide();
      }
    }, 15000);
    
    return () => clearTimeout(timer);
    */
  }, [currentSlide]);

  // Update the useEffect to also add a class to the body element
  useEffect(() => {
    // Hide the footer when component mounts
    const footer = document.querySelector('footer');
    const body = document.body;
    
    if (footer) {
      footer.style.display = 'none';
    }
    
    // Add class to prevent scrolling and ensure full coverage
    body.classList.add('year-review-active');
    
    // Add inline style for the specific case
    const style = document.createElement('style');
    style.innerHTML = `
      .year-review-active {
        overflow: hidden;
        position: relative;
      }
      .year-review-container {
        z-index: 9999;
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
      }
      footer {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Show the footer again when component unmounts
    return () => {
      if (footer) {
        footer.style.display = '';
      }
      
      body.classList.remove('year-review-active');
      document.head.removeChild(style);
    };
  }, []);

  const title = name ? `${name}s 2024/2025 sesonggjennomgang | BadmintonStats` : '2024/2025 sesonggjennomgang | BadmintonStats';
  const description = name ? `Sjekk ut ${name}s badmintonhøydepunkter fra 2024/2025-sesongen` : 'Sjekk ut badmintonhøydepunktene fra 2024/2025-sesongen';

  // Add an error display component
  const ErrorDisplay = ({ message }) => (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative p-8 bg-red-900/30 backdrop-blur-lg rounded-xl border border-red-500/30 max-w-lg mx-auto shadow-lg">
        <FontAwesomeIcon icon={faExclamationCircle} className="text-red-400 text-4xl mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Noe gikk galt</h2>
        <p className="text-red-200 mb-6">{message}</p>
        <Link 
          to={`/player/${name}`}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg inline-flex items-center transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Tilbake til profil
        </Link>
      </div>
    </div>
  );

  // Update the loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-purple-500/30 animate-spin"></div>
          <div className="w-24 h-24 rounded-full border-t-4 border-purple-500 absolute top-0 animate-spin"></div>
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="text-4xl">🏸</div>
          </motion.div>
        </div>
        <motion.p 
          className="mt-8 text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Genererer din 2024/2025 sesonggjennomgang
        </motion.p>
        <motion.div
          className="mt-4 max-w-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-purple-300 mb-3">{loadingStatus}</p>
          <div className="w-full bg-gray-700/30 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
            />
          </div>
          <motion.p 
            className="mt-1 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            Finner dine beste øyeblikk fra 2024/2025-sesongen...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Display error if one occurred
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden year-review-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <SEO 
        title={title}
        description={description}
        playerName={name || ''}
        currentClub={''}
        currentRank={0}
        currentPoints={0}
        playerClass={''}
        playerImage={''}
        thirdSetWinRate={0}
      />

      {/* Navigation indicators */}
      <ProgressBar currentIndex={currentSlide} totalSlides={totalSlides} />
      <StoryNav currentIndex={currentSlide} totalSlides={totalSlides} onDotClick={goToSlide} />
      
      {/* Swipe instruction indicator - only shows on first slide for mobile */}
      {currentSlide === 0 && (
        <motion.div 
          className="absolute bottom-20 left-0 right-0 flex justify-center items-center md:hidden z-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-white/80 text-sm font-medium"
            >
              <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
              Sveip for å navigere
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Left/Right Navigation Areas - make touch targets bigger on mobile */}
      <div className="fixed inset-y-0 left-0 w-1/4 z-10 md:w-1/3" onClick={goToPrevSlide}></div>
      <div className="fixed inset-y-0 right-0 w-1/4 z-10 md:w-1/3" onClick={goToNextSlide}></div>
      
      {/* Main content - make it truly full-screen */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div 
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center px-4 py-16 md:py-20"
          >
            {/* Content based on current slide */}
            {currentSlide === 0 && (
              <IntroSlide name={name} onNext={goToNextSlide} />
            )}
            
            {currentSlide === 1 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <BiggestWin data={playerData.biggestWin || getPlaceholderData('biggestWin')} />
                <SlideComment type="biggestWin" />
              </div>
            )}
            
            {currentSlide === 2 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <BiggestLoss data={playerData.biggestLoss || getPlaceholderData('biggestLoss')} />
                <SlideComment type="biggestLoss" />
              </div>
            )}
            
            {currentSlide === 3 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <MostGames data={playerData.mostGames || getPlaceholderData('mostGames')} />
                <SlideComment type="mostGames" />
              </div>
            )}
            
            {currentSlide === 4 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <MatchTypeBreakdown data={playerData.matchTypes || getPlaceholderData('matchTypes')} />
                <SlideComment type="matchTypes" />
              </div>
            )}
            
            {currentSlide === 5 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <TopPartner data={playerData.topPartner || getPlaceholderData('topPartner')} />
                <SlideComment type="topPartner" />
              </div>
            )}
            
            {currentSlide === 6 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <Nemesis data={playerData.nemesis || getPlaceholderData('nemesis')} />
                <SlideComment type="nemesis" />
              </div>
            )}
            
            {currentSlide === 7 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <ClosestMatch data={playerData.closestMatch || getPlaceholderData('closestMatch')} />
                <SlideComment type="closestMatch" />
              </div>
            )}
            
            {currentSlide === 8 && (
              <div className="slide-content w-full h-full flex items-center justify-center">
                <RankingDistribution 
                  playerName={name} 
                  year={playerData.rankingData?.year} 
                />
                <SlideComment type="rankingDistribution" />
              </div>
            )}
            
            {currentSlide === 9 && (
              <OutroSlide name={name} onPrev={goToPrevSlide} onRestart={restartShow} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Bottom navigation buttons - Only visible on larger screens */}
      <div className="fixed bottom-4 left-0 right-0 z-20 hidden md:flex justify-center gap-4">
        <motion.button
          onClick={goToPrevSlide}
          className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'}`}
          whileHover={currentSlide > 0 ? { scale: 1.1 } : {}}
          whileTap={currentSlide > 0 ? { scale: 0.9 } : {}}
          disabled={currentSlide === 0}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
        </motion.button>
        
        <motion.button
          onClick={goToNextSlide}
          className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${currentSlide === totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30'}`}
          whileHover={currentSlide < totalSlides - 1 ? { scale: 1.1 } : {}}
          whileTap={currentSlide < totalSlides - 1 ? { scale: 0.9 } : {}}
          disabled={currentSlide === totalSlides - 1}
        >
          <FontAwesomeIcon icon={faArrowRight} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default YearInReview; 