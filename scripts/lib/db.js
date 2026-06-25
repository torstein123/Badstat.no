// Supabase write layer. Uses the anon key (RLS is off on data tables).
// Override via SUPABASE_SERVICE_ROLE_KEY env var for server-side scheduled runs.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kfxdblvdunnrxhuxqvzi.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeGRibHZkdW5ucnhodXhxdnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTQ5NzEsImV4cCI6MjA5Nzk5MDk3MX0.TZ6LCEIbEcqKsPUQQyGjLNsAbCZvTr2WJxBl4A-W2i8';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// Fetch the set of tournament_ids already present in matches (skip re-scrape).
export async function fetchExistingTournamentIds() {
  const ids = new Set();
  let from = 0, size = 1000;
  while (true) {
    const { data, error } = await sb
      .from('matches')
      .select('tournament_id')
      .not('tournament_id', 'is', null)
      .range(from, from + size - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) if (r.tournament_id != null) ids.add(r.tournament_id);
    if (data.length < size) break;
    from += size;
  }
  return ids;
}

// Check legacy matches (tournament_id IS NULL) for a (Tournament Name, Date) pair.
// Lets us skip scraping tournaments that are already in DB as legacy rows.
export async function tournamentExistsByNameDate(name, dateDDMMYYYY) {
  const { count, error } = await sb
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('Tournament Name', name)
    .eq('Date', dateDDMMYYYY);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function upsertTournament(row) {
  const { error } = await sb.from('tournaments').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`tournaments upsert ${row.id}: ${error.message}`);
}

export async function upsertTournamentClass(row) {
  const { error } = await sb.from('tournament_classes').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`tournament_classes upsert ${row.id}: ${error.message}`);
}

export async function upsertTournamentEvent(row) {
  const { error } = await sb.from('tournament_events').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`tournament_events upsert ${row.id}: ${error.message}`);
}

// League tables
export async function upsertLeague(row) {
  const { error } = await sb.from('leagues').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`leagues upsert ${row.id}: ${error.message}`);
}

export async function upsertLeagueTeamsBatch(rows) {
  if (!rows.length) return 0;
  const { error } = await sb.from('league_teams').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`league_teams upsert: ${error.message}`);
  return rows.length;
}

export async function upsertLeagueTeamMatch(row) {
  const { error } = await sb.from('league_team_matches').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`league_team_matches upsert ${row.id}: ${error.message}`);
}

// Replace individual matches for a team tie (idempotent: safe to re-scrape).
export async function replaceMatchesForTeamTie(leagueTeamMatchId, rows) {
  const { error: delErr } = await sb
    .from('matches')
    .delete()
    .eq('league_team_match_id', leagueTeamMatchId);
  if (delErr) throw new Error(`matches delete for tie ${leagueTeamMatchId}: ${delErr.message}`);
  if (rows.length) {
    const { error } = await sb.from('matches').insert(rows);
    if (error) throw new Error(`matches insert for tie ${leagueTeamMatchId}: ${error.message}`);
  }
  return rows.length;
}

export async function insertMatchesBatch(rows) {
  if (!rows.length) return 0;
  // chunk 500 at a time (Supabase REST limit)
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await sb.from('matches').insert(chunk);
    if (error) throw new Error(`matches insert: ${error.message}`);
    inserted += chunk.length;
  }
  return inserted;
}

// Zero out current-season ranking fields before a refresh so players who dropped off
// the official list end up at 0 instead of keeping stale points/rank.
export async function clearCurrentSeasonRankings(yearColumn) {
  const { error: e1 } = await sb
    .from('rankings')
    .update({ [yearColumn]: 0, rank: null, class_letter: null, version_date: null })
    .in('category', ['HS', 'DS', 'HD', 'DD', 'MIX']);
  if (e1) throw new Error(`clear rankings: ${e1.message}`);

  const { error: e2 } = await sb
    .from('players')
    .update({ [yearColumn]: 0 })
    .gt(yearColumn, 0);
  if (e2) throw new Error(`clear players: ${e2.message}`);
}

// Batched player upserts (unique key: "Spiller-Id").
export async function upsertPlayersBatch(rows) {
  if (!rows.length) return 0;
  let ok = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await sb.from('players').upsert(chunk, { onConflict: '"Spiller-Id"' });
    if (error) throw new Error(`players upsert chunk: ${error.message}`);
    ok += chunk.length;
  }
  return ok;
}

// Insert players only if not already present. Used for match-derived rows so
// stale tournament/league club info doesn't overwrite the canonical record
// produced by the ranking refresh.
export async function insertPlayersIfMissingBatch(rows) {
  if (!rows.length) return 0;
  let ok = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await sb
      .from('players')
      .upsert(chunk, { onConflict: '"Spiller-Id"', ignoreDuplicates: true });
    if (error) throw new Error(`players insert-if-missing chunk: ${error.message}`);
    ok += chunk.length;
  }
  return ok;
}

// Patch NULL "Current Club" cells with the supplied value, leaving non-NULL
// rows untouched. Used by the backfill script to repair placeholder rows.
export async function fillPlayerClubIfNull(rows) {
  if (!rows.length) return 0;
  let updated = 0;
  for (const r of rows) {
    if (!r['Current Club']) continue;
    const { data, error } = await sb
      .from('players')
      .update({ 'Current Club': r['Current Club'], last_updated_at: new Date().toISOString() })
      .eq('Spiller-Id', r['Spiller-Id'])
      .is('Current Club', null)
      .select('id');
    if (error) throw new Error(`players club-fill ${r['Spiller-Id']}: ${error.message}`);
    if (data?.length) updated += data.length;
  }
  return updated;
}

// Batched ranking upserts (unique key: "Spiller-Id", category, age_group).
export async function upsertRankingsBatch(rows) {
  if (!rows.length) return 0;
  let ok = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await sb.from('rankings').upsert(chunk, { onConflict: '"Spiller-Id",category,age_group' });
    if (error) throw new Error(`rankings upsert chunk: ${error.message}`);
    ok += chunk.length;
  }
  return ok;
}
