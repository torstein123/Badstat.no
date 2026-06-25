// Re-scrape tournament match cells for player {id, name, club} only.
// Does NOT re-insert matches — purely populates the `players` table with the
// canonical club for players who were originally captured from match data only
// (no ranking) and therefore landed in `players` with NULL Current Club.
//
// Usage:
//   node scripts/backfill-players.js                 # every tournament in DB
//   node scripts/backfill-players.js --tournament 6984
//   node scripts/backfill-players.js --dry-run

import { openSession, wsPost, sleep } from './lib/api.js';
import { parseMatches } from './lib/parse-tournament.js';
import { sb, insertPlayersIfMissingBatch, fillPlayerClubIfNull } from './lib/db.js';

const args = process.argv.slice(2);
const argVal = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const DRY_RUN = args.includes('--dry-run');
const ONLY_ID = argVal('--tournament') ? +argVal('--tournament') : null;

async function pickTournamentIds() {
  if (ONLY_ID) return [ONLY_ID];
  // Default = ALL because the work is proportional to events scraped, not
  // matches in DB, and we want to harvest clubs uniformly. The actual writes
  // are guarded by NULL-only update, so re-running is safe.
  const { data, error } = await sb.from('tournaments').select('id');
  if (error) throw error;
  return data.map((r) => r.id);
}

async function fetchClassesAndEvents(tournamentId) {
  const { data: cls, error: e1 } = await sb.from('tournament_classes').select('id').eq('tournament_id', tournamentId);
  if (e1) throw e1;
  if (!cls?.length) return [];
  const classIds = cls.map((c) => c.id);
  const { data: evs, error: e2 } = await sb.from('tournament_events').select('id, class_id').in('class_id', classIds);
  if (e2) throw e2;
  return evs || [];
}

async function main() {
  console.error(`[backfill-players] dryRun=${DRY_RUN} ${ONLY_ID ? `tournament=${ONLY_ID}` : 'mode=ALL'}`);
  const session = await openSession('tournaments');
  const tournamentIds = await pickTournamentIds();
  console.error(`  tournaments to scan: ${tournamentIds.length}`);

  const playersFromMatches = new Map();
  let calls = 0, t0 = Date.now();

  for (const tid of tournamentIds) {
    const events = await fetchClassesAndEvents(tid);
    if (!events.length) { console.error(`  → ${tid}: no events on file, skipping`); continue; }
    for (const ev of events) {
      try {
        const mr = await wsPost(session, 'SearchTournamentMatches', {
          tournamentclassid: String(ev.class_id),
          tournamenteventid: String(ev.id),
          clientselectfunction: 'SelectTournamentClass1',
        });
        const matches = parseMatches(mr.Html || '');
        for (const m of matches) {
          for (const p of [...(m.left || []), ...(m.right || [])]) {
            if (!p?.playerId) continue;
            playersFromMatches.set(p.playerId, {
              'Spiller-Id': String(p.playerId),
              Navn: p.name,
              'Current Club': p.club,
              last_updated_at: new Date().toISOString(),
            });
          }
        }
        calls += 1;
        await sleep(80);
      } catch (e) {
        console.error(`    ! tid=${tid} class=${ev.class_id} ev=${ev.id} skipped: ${e.message}`);
      }
    }
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    console.error(`  ✓ tid=${tid}: ${events.length} events, ${playersFromMatches.size} players seen so far (${calls} calls, ${elapsed}s)`);
  }

  console.error(`\n  total unique players harvested: ${playersFromMatches.size}`);
  if (!DRY_RUN && playersFromMatches.size) {
    const rows = [...playersFromMatches.values()];
    const inserted = await insertPlayersIfMissingBatch(rows);
    console.error(`  insert-if-missing considered: ${inserted} rows`);
    const filled = await fillPlayerClubIfNull(rows);
    console.error(`  club-fill on NULL rows:       ${filled} rows updated`);
  }
  console.error(`\nAll done.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
