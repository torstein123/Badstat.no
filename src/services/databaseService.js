import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://pzlqcweunxxcavyzxopg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bHFjd2V1bnh4Y2F2eXp4b3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODcyNzYsImV4cCI6MjA2OTQ2MzI3Nn0.fMki9KkLeaJc4xH3a3BlnbO_baG_h5FEv8yTcQEk9XY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple cache for search results
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Rankings data functions
export const getRankingsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('category', category)
      .order('2024', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching rankings by category:', error);
    return [];
  }
};

export const getAllRankings = async () => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('2024', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all rankings:', error);
    return [];
  }
};

export const getPlayerRankings = async (playerName) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('Navn', playerName);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player rankings:', error);
    return [];
  }
};

export const getPlayerBySpillerId = async (spillerId) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('Spiller-Id', spillerId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player by Spiller-Id:', error);
    return null;
  }
};

export const searchPlayers = async (searchTerm) => {
  // Check cache first
  const cacheKey = searchTerm.toLowerCase().trim();
  const cachedResult = searchCache.get(cacheKey);
  
  if (cachedResult && isCacheValid(cachedResult.timestamp)) {
    return cachedResult.data;
  }
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .ilike('Navn', `%${searchTerm}%`)
      .limit(50);
    
    if (error) throw error;
    
    // Cache the result
    searchCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
};

// Matches data functions
export const getPlayerMatches = async (playerName) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`Team 1 Player 1.eq.${playerName},Team 1 Player 2.eq.${playerName},Team 2 Player 1.eq.${playerName},Team 2 Player 2.eq.${playerName}`)
      .order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player matches:', error);
    return [];
  }
};

export const getAllMatches = async () => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all matches:', error);
    return [];
  }
};

export const getMatchesByTournament = async (tournamentName) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('Tournament Name', tournamentName)
      .order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching matches by tournament:', error);
    return [];
  }
};

// Head-to-head functions
export const getHeadToHeadMatches = async (player1, player2) => {
  try {
    console.log('Database: Fetching matches for player1:', player1, 'player2:', player2);
    
    // First, get all matches where both players are involved
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`Team 1 Player 1.eq.${player1},Team 1 Player 2.eq.${player1},Team 2 Player 1.eq.${player1},Team 2 Player 2.eq.${player1}`)
      .order('Date', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Database: Found', data.length, 'matches involving player1');
    
    // Then filter for matches where both players are involved AND on opposite teams
    const headToHeadMatches = data.filter(match => {
      const player1InMatch = 
        match['Team 1 Player 1'] === player1 || 
        match['Team 1 Player 2'] === player1 ||
        match['Team 2 Player 1'] === player1 || 
        match['Team 2 Player 2'] === player1;
      
      const player2InMatch = 
        match['Team 1 Player 1'] === player2 || 
        match['Team 1 Player 2'] === player2 ||
        match['Team 2 Player 1'] === player2 || 
        match['Team 2 Player 2'] === player2;
      
      // Both players must be in the match
      if (!player1InMatch || !player2InMatch) return false;
      
      // Check if they're on opposite teams (playing against each other)
      const player1InTeam1 = match['Team 1 Player 1'] === player1 || match['Team 1 Player 2'] === player1;
      const player2InTeam1 = match['Team 1 Player 1'] === player2 || match['Team 1 Player 2'] === player2;
      const player1InTeam2 = match['Team 2 Player 1'] === player1 || match['Team 2 Player 2'] === player1;
      const player2InTeam2 = match['Team 2 Player 1'] === player2 || match['Team 2 Player 2'] === player2;
      
      // They must be on opposite teams (one in Team 1, one in Team 2)
      const onOppositeTeams = (player1InTeam1 && player2InTeam2) || (player1InTeam2 && player2InTeam1);
      
      return onOppositeTeams;
    });
    
    console.log('Database: Found', headToHeadMatches.length, 'head-to-head matches');
    if (headToHeadMatches.length > 0) {
      console.log('Database: Sample head-to-head match:', headToHeadMatches[0]);
    }
    
    return headToHeadMatches;
  } catch (error) {
    console.error('Error fetching head-to-head matches:', error);
    return [];
  }
};

// Statistics functions
export const getPlayerStats = async (playerName) => {
  try {
    const matches = await getPlayerMatches(playerName);
    
    let wins = 0;
    let totalMatches = matches.length;
    
    matches.forEach(match => {
      const isPlayer1 = match['Team 1 Player 1'] === playerName || match['Team 1 Player 2'] === playerName;
      const isPlayer2 = match['Team 2 Player 1'] === playerName || match['Team 2 Player 2'] === playerName;
      
      if (isPlayer1 && match['Winner Player 1']) wins++;
      if (isPlayer2 && match['Winner Player 2']) wins++;
    });
    
    return {
      totalMatches,
      wins,
      losses: totalMatches - wins,
      winRate: totalMatches > 0 ? (wins / totalMatches * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error calculating player stats:', error);
    return { totalMatches: 0, wins: 0, losses: 0, winRate: 0 };
  }
};

// Year in review functions
export const getYearStats = async (year) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .like('Season', `%${year}%`);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching year stats:', error);
    return [];
  }
};

export const getPlayerRankingsByCategory = async (playerName, category) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('Navn', playerName)
      .eq('category', category)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player rankings by category:', error);
    return null;
  }
};

export const getPlayerAllRankings = async (playerName) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('Navn', playerName);
    
    if (error) throw error;
    
    // Group by category
    const rankingsByCategory = {
      HS: data.find(r => r.category === 'HS'),
      DS: data.find(r => r.category === 'DS'),
      HD: data.find(r => r.category === 'HD'),
      DD: data.find(r => r.category === 'DD'),
      MIX: data.find(r => r.category === 'MIX')
    };
    
    return rankingsByCategory;
  } catch (error) {
    console.error('Error fetching all player rankings:', error);
    return {
      HS: null,
      DS: null,
      HD: null,
      DD: null,
      MIX: null
    };
  }
};

export default {
  getRankingsByCategory,
  getAllRankings,
  getPlayerRankings,
  getPlayerBySpillerId,
  searchPlayers,
  getPlayerMatches,
  getAllMatches,
  getMatchesByTournament,
  getHeadToHeadMatches,
  getPlayerStats,
  getYearStats,
  getPlayerRankingsByCategory,
  getPlayerAllRankings
}; 