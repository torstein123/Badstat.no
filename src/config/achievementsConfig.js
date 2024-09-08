import { 
  faBabyCarriage, 
  faSeedling, 
  faGamepad, 
  faTrophy, 
  faMedal, 
  faStar, 
  faRocket, 
  faShieldAlt, 
  faGem, 
  faHourglass, 
  faChessKnight, 
  faChessKing, 
  faChessQueen, 
  faChessRook, 
  faChessPawn,
  faBrain, 
  faHands
} from '@fortawesome/free-solid-svg-icons';

const gameplayMilestones = [
  {
    header: "Just getting started",
    description: "Velkommen til badmintonverdenen! Du har nettopp tatt ditt første skritt mot å bli en mester. La reisen begynne!",
    gamesRequired: 1,
    icon: faBabyCarriage,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  },
  {
    header: "100 kamper",
    description: "Rutinert (100 kamper): Du har nå nådd et nivå av dyktighet som få oppnår. Motstanderne dine begynner å respektere deg som en verdig motstander!",
    gamesRequired: 100,
    icon: faStar,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  },
  {
    header: "150 kamper",
    description: "Erfaren (150 kamper): Med 150 kamper bak deg, har du vist en bemerkelsesverdig innsats på banen. Fortsett å dominere!",
    gamesRequired: 150,
    icon: faRocket,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  },
  {
    header: "500 kamper",
    description: "Med 500 kamper bak deg, har du bevist at du er en profesjonell innen badminton. Fortsett å skinne på banen!",
    gamesRequired: 500,
    icon: faChessKnight,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  },
  {
    header: "600 kamper",
    description: "Med 600 kamper bak deg, er du en sann legende på banen.",
    gamesRequired: 600,
    icon: faChessKing,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  },
  {
    header: "700 kamper",
    description: "Champion (700 kamper): Du har nådd det høyeste nivået av prestisje i badmintonverdenen. Du er en ekte mester!",
    gamesRequired: 700,
    icon: faChessQueen,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  },
  {
    header: "800 kamper",
    description: "Med 800 kamper bak deg, har du skrevet ditt navn i historiebøkene som en sann legende innen badminton.",
    gamesRequired: 800,
    icon: faChessRook,
    badgeColor: "#FF4500",
    animation: "none", // No animation for this milestone
  }
];

const otherAchievements = [
  {
    header: "Comeback",
    description: "Tidenes comeback: Gir seg aldri! Du har vist imponerende utholdenhet og viljestyrke ved å snu en kamp til din fordel etter å ha vært bak med over 10 poeng.",
    criteria: (playerData) => playerData.comebackWin,
    badgeColor: "#007bff",
    icon: faHands,
    animation: "none", // No animation for this achievement
  },
  {
    header: "Sjekk seiersprosent i 3.sett",
    description:"",
    criteria: (playerData) => playerData.deciderWinRate > 0,
    badgeColor: "#007bff",
    icon: faBrain,
    animation: "none", // No animation for this achievement
  },
];

const achievementsConfig = {
  gameplayMilestones,
  otherAchievements,
};

export default achievementsConfig;
