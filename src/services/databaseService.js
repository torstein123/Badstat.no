import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://kfxdblvdunnrxhuxqvzi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeGRibHZkdW5ucnhodXhxdnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTQ5NzEsImV4cCI6MjA5Nzk5MDk3MX0.TZ6LCEIbEcqKsPUQQyGjLNsAbCZvTr2WJxBl4A-W2i8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple cache for search results
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// PostgREST caps a single response at ~1000 rows by default, which silently
// truncates full-table reads. Page through with .range() until a short page
// comes back. buildQuery(from, to) must return a Supabase query ending in
// .range(from, to); any .order() applied before .range() is preserved across
// pages, so concatenating the pages keeps the global ordering.
const PAGE_SIZE = 1000;
const fetchAllRows = async (buildQuery) => {
  const all = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return all;
};

// Rankings data functions. age_group defaults to SEN so existing callers keep
// seeing the senior list; pass a different age group (U15, U17, ...) to scope.
export const getRankingsByCategory = async (category, ageGroup = 'SEN') => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('category', category)
      .eq('age_group', ageGroup)
      .order('2025', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching rankings by category:', error);
    return [];
  }
};

// Discover which age groups a player has any current-season rankings in.
// Used by PlayerDetail to populate the age-group dropdown.
export const getPlayerAgeGroups = async (playerName) => {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('age_group')
      .eq('Navn', playerName);
    if (error) throw error;
    const set = new Set((data || []).map((r) => r.age_group).filter(Boolean));
    // Stable display order: youth → senior → veteran
    const order = ['U11','U13','U15','U17','U19','SEN','O35','O40','O45','O50','O55','O60','O65','O70','O75','O80'];
    return order.filter((g) => set.has(g));
  } catch (error) {
    console.error('Error fetching player age groups:', error);
    return [];
  }
};

export const getAllRankings = async () => {
  try {
    // Page through every ranking row — the table is well past the 1000-row
    // default cap, so a single query would silently drop most of the list.
    return await fetchAllRows((from, to) =>
      supabase
        .from('rankings')
        .select('*')
        .order('2025', { ascending: false })
        .range(from, to)
    );
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

// Matches data functions.
// PostgREST .or() with column names containing spaces is unreliable, so we run
// four equality queries in parallel and merge. Also bumps the row cap to 5000
// since Supabase's default 1000-row limit can truncate prolific players.
export const getPlayerMatches = async (playerName) => {
  try {
    const slots = ['Team 1 Player 1', 'Team 1 Player 2', 'Team 2 Player 1', 'Team 2 Player 2'];
    const results = await Promise.all(
      slots.map((col) =>
        supabase
          .from('matches')
          .select('*')
          .eq(col, playerName)
          .order('Date', { ascending: false })
          .limit(5000)
      )
    );
    const merged = new Map();
    for (const { data, error } of results) {
      if (error) throw error;
      for (const m of data || []) {
        if (m?.id != null) merged.set(m.id, m);
      }
    }
    return [...merged.values()].sort((a, b) => {
      // Norwegian-style DD.MM.YYYY date string in Date column. Parse to compare.
      const toIso = (s) => {
        const x = (s || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        return x ? `${x[3]}-${x[2].padStart(2,'0')}-${x[1].padStart(2,'0')}` : '';
      };
      return toIso(b.Date).localeCompare(toIso(a.Date));
    });
  } catch (error) {
    console.error('Error fetching player matches:', error);
    return [];
  }
};

// WARNING: the matches table has 180k+ rows. This pages through all of them,
// so it returns a complete (no longer truncated) but very large result set —
// avoid calling it on the client. Prefer a scoped query (by player, season, or
// tournament) or a server-side RPC for aggregates.
export const getAllMatches = async () => {
  try {
    return await fetchAllRows((from, to) =>
      supabase
        .from('matches')
        .select('*')
        .order('Date', { ascending: false })
        .range(from, to)
    );
  } catch (error) {
    console.error('Error fetching all matches:', error);
    return [];
  }
};

export const getCurrentSeasonMatches = async () => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('Season', '2025/2026')
      .order('Date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching current season matches:', error);
    return [];
  }
};

export const getTopPlayersByMatches = async (season = '2025/2026', category = 'Sammenlagt', limit = 10) => {
  try {
    const { data, error } = await supabase.rpc('get_top_players_by_matches', {
      p_season: season,
      p_category: category,
      p_limit: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top players by matches:', error);
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

export const getPlayerByName = async (playerName) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('Navn', playerName)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching player by name:', error);
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
  getYearStats,
  getPlayerRankingsByCategory,
  getPlayerAllRankings,
  getPlayerByName,
  getPlayerAgeGroups,
  getTopPlayersByMatches
};