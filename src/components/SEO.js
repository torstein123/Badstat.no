import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title, 
  description, 
  playerName = '', 
  currentClub = '', 
  currentRank = 0, 
  currentPoints = 0,
  playerClass = '',
  playerImage = '',
  thirdSetWinRate = 0
}) => {
  // Generate a more search-friendly title
  const searchTitle = title || (playerName ? `${playerName} - Badminton Statistikk | Badstat` : 'Badstat');
  
  // Create a detailed meta description
  const metaDescription = description || `${playerName || 'Spiller'} er en badmintonspiller${currentClub ? ` fra ${currentClub}` : ''}. 
    ${currentRank ? `Nåværende ranking: ${currentRank}.` : ''} 
    ${playerClass ? `${playerClass} klasse spiller` : ''}${currentPoints ? ` med ${currentPoints} poeng.` : ''} 
    ${thirdSetWinRate ? `Vinner ${thirdSetWinRate}% av kampene i 3. sett.` : ''}
    Statistikk oppdateres ukentlig på Badstat.`;

  // Parse player first name and last name safely
  const playerNameParts = playerName ? playerName.split(' ') : ['', ''];
  const firstName = playerNameParts[0] || '';
  const lastName = playerNameParts.length > 1 ? playerNameParts.slice(1).join(' ') : '';
  const username = playerName ? playerName.replace(/\s+/g, '').toLowerCase() : '';

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": playerName || 'Badminton Player',
    "affiliation": {
      "@type": "SportsTeam",
      "name": currentClub || 'Badminton Club'
    },
    "description": metaDescription,
    "image": playerImage || '',
    "sport": "Badminton",
    "award": {
      "@type": "Award",
      "name": `${playerClass || ''} klasse`,
      "awardedFor": "Badminton ranking"
    },
    "performanceStats": {
      "@type": "SportsStats",
      "name": "Badminton Performance Statistics",
      "ranking": currentRank || 0,
      "points": currentPoints || 0,
      "thirdSetWinRate": thirdSetWinRate || 0
    },
    "knowsAbout": ["Badminton", "Sports Statistics", "Player Rankings"],
    "sameAs": [
      `https://badstat.no/player/${encodeURIComponent(playerName || '')}`
    ],
    "updatePolicy": {
      "@type": "UpdatePolicy",
      "updateFrequency": "Weekly"
    }
  };

  // Generate breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Badstat",
        "item": "https://badstat.no"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Spillere",
        "item": "https://badstat.no/playerlist"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": playerName || 'Player',
        "item": `https://badstat.no/player/${encodeURIComponent(playerName || '')}`
      }
    ]
  };

  return (
    <Helmet>
      <title>{searchTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={`${playerName || 'badminton'}, badminton, norsk badminton, ${currentClub || ''}, ${playerClass || ''} klasse, badminton statistikk, badmintonportalen, cup2000`} />
      <meta name="author" content="Badstat" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph meta tags */}
      <meta property="og:title" content={searchTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="profile" />
      <meta property="og:image" content={playerImage || ''} />
      <meta property="og:url" content={`https://badstat.no/player/${encodeURIComponent(playerName || '')}`} />
      
      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={searchTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={playerImage || ''} />
      
      {/* Profile meta tags */}
      <meta property="profile:first_name" content={firstName} />
      <meta property="profile:last_name" content={lastName} />
      <meta property="profile:username" content={username} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://badstat.no/player/${encodeURIComponent(playerName || '')}`} />
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};

export default SEO; 