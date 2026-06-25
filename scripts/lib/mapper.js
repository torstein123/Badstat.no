// Map scraped shapes → DB row shapes. Handles the legacy "NaN"/slot-2 convention
// for singles so the React app keeps working unchanged.

// seasonid "2002025" → "2025/2026"
export function seasonFromSeasonId(seasonid) {
  const s = String(seasonid);
  // Pattern observed: "200" + YYYY where YYYY is start year
  const m = s.match(/^200(\d{4})$/);
  if (!m) return null;
  const start = +m[1];
  return `${start}/${start + 1}`;
}

// Start year e.g. 2025 → "2025/2026"
export function seasonFromStartYear(year) {
  return `${year}/${year + 1}`;
}

// "DD.MM.YYYY" → "YYYY-MM-DD" for Postgres DATE columns.
export function ddmmyyyyToIso(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

// Build the Tournament Name string used by the existing UI.
// Title from season plan is "Arranger: Event Name". App shows "Arranger Event Name".
export function buildTournamentName(title) {
  return (title || '').replace(/:\s*/, ' ').replace(/\s+/g, ' ').trim();
}

// Discipline code ("HS"/"HD"/...) → Norwegian word stored in legacy Match column.
export function disciplineToMatch(code) {
  return ({
    HS: 'Herresingle',
    DS: 'Damesingle',
    HD: 'Herredouble',
    DD: 'Damedouble',
    MIX: 'Mixeddouble',
  })[code] || null;
}

// "DD.MM.YYYY" convert for display — just pass through but sanity-check.
export function normalizeDateDisplay(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return `${m[1].padStart(2, '0')}.${m[2].padStart(2, '0')}.${m[3]}`;
}

// Build a matches-table row for ONE individual match inside a team tie.
// Mirrors buildMatchRow's legacy-slot convention so the React app treats these like tournament rows.
export function buildLeagueMatchRow({ indMatch, league, teamMatch }) {
  const isSingles = indMatch.discipline === 'HS' || indMatch.discipline === 'DS';
  const l = indMatch.left;
  const r = indMatch.right;

  let t1p1 = 'NaN', t1p2 = 'NaN', t2p1 = 'NaN', t2p2 = 'NaN';
  if (isSingles) {
    t1p2 = l[0]?.name || 'NaN';
    t2p2 = r[0]?.name || 'NaN';
  } else {
    t1p1 = l[0]?.name || 'NaN';
    t1p2 = l[1]?.name || 'NaN';
    t2p1 = r[0]?.name || 'NaN';
    t2p2 = r[1]?.name || 'NaN';
  }

  const winningSide = indMatch.winner_side === 1 ? l : indMatch.winner_side === 2 ? r : null;
  let wp1 = 'NaN', wp2 = 'NaN';
  if (winningSide) {
    if (isSingles) wp1 = winningSide[0]?.name || 'NaN';
    else { wp1 = winningSide[0]?.name || 'NaN'; wp2 = winningSide[1]?.name || 'NaN'; }
  }

  const tab = isSingles ? 'NaN' : t1p1;

  return {
    // Legacy flat columns (frontend reads these)
    Season: league.season,
    'Tournament Name': league.name,            // e.g. "Eliteserien 2025/2026 Grunnspill"
    Date: teamMatch.match_date_display,        // "DD.MM.YYYY"
    'Tournament Class': league.age_group || null,
    Match: disciplineToMatch(indMatch.discipline),
    Tab: tab,
    'Team 1 Player 1': t1p1,
    'Team 1 Player 2': t1p2,
    'Team 2 Player 1': t2p1,
    'Team 2 Player 2': t2p2,
    Result: indMatch.score_raw || '',
    'Winner Player 1': wp1,
    'Winner Player 2': wp2,
    // Rich / league-specific columns
    league_id: league.id,
    league_team_match_id: teamMatch.id,
    league_match_type: indMatch.label,         // "1. HS", "2. HD", ...
    phase: indMatch.label,                     // re-use phase for readability in existing queries
    winner_side: indMatch.winner_side,
    score_sets: indMatch.score_sets,
    team1_player1_spiller_id: isSingles ? null : (l[0]?.playerId || null),
    team1_player2_spiller_id: isSingles ? (l[0]?.playerId || null) : (l[1]?.playerId || null),
    team2_player1_spiller_id: isSingles ? null : (r[0]?.playerId || null),
    team2_player2_spiller_id: isSingles ? (r[0]?.playerId || null) : (r[1]?.playerId || null),
    walkover: indMatch.walkover,
    scraped_at: new Date().toISOString(),
  };
}

// Convert a scraped match into a row compatible with the matches table (both old + new columns).
export function buildMatchRow({ match, tournament, tournamentClass, event }) {
  const isSingles = event.discipline === 'HS' || event.discipline === 'DS';

  // Flatten left/right for old columns, preserving the legacy slot-2-for-singles convention.
  const l = match.left;
  const r = match.right;
  let t1p1 = 'NaN', t1p2 = 'NaN', t2p1 = 'NaN', t2p2 = 'NaN';
  if (isSingles) {
    t1p2 = l[0]?.name || 'NaN';
    t2p2 = r[0]?.name || 'NaN';
  } else {
    t1p1 = l[0]?.name || 'NaN';
    t1p2 = l[1]?.name || 'NaN';
    t2p1 = r[0]?.name || 'NaN';
    t2p2 = r[1]?.name || 'NaN';
  }

  // Winner columns match the legacy convention: singles → Winner Player 1 = the winning name,
  // Winner Player 2 = "NaN". Doubles → both Winner Player 1/2 = winning team members.
  const winningSide = match.winner_side === 1 ? l : match.winner_side === 2 ? r : null;
  let wp1 = 'NaN', wp2 = 'NaN';
  if (winningSide) {
    if (isSingles) {
      wp1 = winningSide[0]?.name || 'NaN';
    } else {
      wp1 = winningSide[0]?.name || 'NaN';
      wp2 = winningSide[1]?.name || 'NaN';
    }
  }

  // Legacy Tab column: for doubles, contains Team 1 Player 1 name (per observed data); else NaN.
  const tab = isSingles ? 'NaN' : t1p1;

  return {
    // Legacy flat columns (UI reads these)
    Season: tournament.season,
    'Tournament Name': tournament.name,
    Date: tournament.start_date_display,    // "DD.MM.YYYY"
    'Tournament Class': tournamentClass.name,
    Match: disciplineToMatch(event.discipline),
    Tab: tab,
    'Team 1 Player 1': t1p1,
    'Team 1 Player 2': t1p2,
    'Team 2 Player 1': t2p1,
    'Team 2 Player 2': t2p2,
    Result: match.score_raw || '',
    'Winner Player 1': wp1,
    'Winner Player 2': wp2,
    // New rich columns
    tournament_id: tournament.id,
    class_id: tournamentClass.id,
    event_id: event.eventId,
    phase: match.phase,
    winner_side: match.winner_side,
    score_sets: match.score_sets,
    team1_player1_spiller_id: isSingles ? null : (l[0]?.playerId || null),
    team1_player2_spiller_id: isSingles ? (l[0]?.playerId || null) : (l[1]?.playerId || null),
    team2_player1_spiller_id: isSingles ? null : (r[0]?.playerId || null),
    team2_player2_spiller_id: isSingles ? (r[0]?.playerId || null) : (r[1]?.playerId || null),
    walkover: match.walkover,
    scraped_at: new Date().toISOString(),
  };
}
