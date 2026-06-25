// Single-command stats refresh.
// Usage:
//   node scripts/update-stats.js                        # rankings + tournaments (current season)
//   node scripts/update-stats.js --rankings-only
//   node scripts/update-stats.js --tournaments-only
//   node scripts/update-stats.js --season 2024          # start year (= 2024/2025)
//   node scripts/update-stats.js --from 01.09.2025      # date floor (DD.MM.YYYY)
//   node scripts/update-stats.js --tournament 7019      # just one tournament (by id)
//   node scripts/update-stats.js --dry-run              # print intent, no DB writes

import { openSession, wsPost, sleep } from './lib/api.js';
import { parseSeasonPlan } from './lib/parse-season.js';
import {
  parseTournamentMeta,
  parseClassSelect,
  classifyTournamentClass,
  parseEventsFromResults,
  parseMatches,
} from './lib/parse-tournament.js';
import { parseRankingList, RANKING_LISTS } from './lib/parse-ranking.js';
import {
  seasonFromStartYear,
  ddmmyyyyToIso,
  buildTournamentName,
  buildMatchRow,
} from './lib/mapper.js';
import {
  fetchExistingTournamentIds,
  tournamentExistsByNameDate,
  upsertTournament,
  upsertTournamentClass,
  upsertTournamentEvent,
  insertMatchesBatch,
  upsertPlayersBatch,
  insertPlayersIfMissingBatch,
  upsertRankingsBatch,
  clearCurrentSeasonRankings,
  upsertLeague,
  upsertLeagueTeamsBatch,
  upsertLeagueTeamMatch,
  replaceMatchesForTeamTie,
} from './lib/db.js';
import {
  parseLeagueList,
  parseLeagueStandings,
  parseLeagueMatches,
  parseLeagueMatchDetail,
} from './lib/parse-league.js';
import { buildLeagueMatchRow } from './lib/mapper.js';

// ---------- CLI ----------
const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const DRY_RUN = hasFlag('--dry-run');
const ONLY_RANKINGS = hasFlag('--rankings-only');
const ONLY_TOURNAMENTS = hasFlag('--tournaments-only');
const ONLY_LEAGUES = hasFlag('--leagues-only');
const SKIP_LEAGUES = hasFlag('--no-leagues');
const ONLY_TOURNAMENT_ID = argVal('--tournament') ? +argVal('--tournament') : null;
// Full historical backfill across all seasons / regions / age groups.
const LEAGUES_ALL = hasFlag('--leagues-all');

// Current badminton season: runs Aug → Jul. Default = current-calendar-year or previous if we're in Jan-Jul.
const now = new Date();
const defaultStartYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
const SEASON_START_YEAR = argVal('--season') ? +argVal('--season') : defaultStartYear;
const SEASON_ID = `200${SEASON_START_YEAR}`;
const SEASON = seasonFromStartYear(SEASON_START_YEAR);
const FROM_DATE = argVal('--from') || `01.07.${SEASON_START_YEAR}`;

console.error(`[update-stats] season=${SEASON} id=${SEASON_ID} from=${FROM_DATE} dryRun=${DRY_RUN}`);
if (ONLY_TOURNAMENT_ID) console.error(`  single tournament mode: ${ONLY_TOURNAMENT_ID}`);

// ---------- Flow ----------

async function fetchRankingListPaginated(session, list) {
  // API pages at 100 rows. Loop pageindex until a short page arrives.
  const all = [];
  let meta = {};
  let page = 0;
  while (true) {
    const res = await wsPost(session, 'GetRankingListPlayers', {
      rankinglistid: list.rankinglistid,
      seasonid: SEASON_ID,
      agefrom: '', agegroupid: '', ageto: '',
      birthdatefromstring: '', birthdatetostring: '',
      classid: '', clubid: '',
      gender: '', getplayer: false, getversions: false,
      pageindex: page, param: '', playerid: '',
      pointsfrom: '', pointsto: '',
      rankingfrom: '', rankingto: '',
      rankinglistagegroupid: '', rankinglistversiondate: '',
      regionid: '', searchall: null, sortfield: 0,
    });
    const parsed = parseRankingList(res.Html || '');
    if (page === 0) meta = parsed.meta;
    all.push(...parsed.rows);
    if (parsed.rows.length < 100) break;
    page += 1;
    await sleep(100);
  }
  return { meta, rows: all };
}

async function refreshRankings() {
  const session = await openSession('rankings');

  // Zero out current-season fields so players who dropped off the official ranking
  // reset to 0 (otherwise we'd keep stale rank + points for players the API no longer returns).
  if (!DRY_RUN) {
    console.error(`\n  Clearing current-season (${SEASON_START_YEAR}) ranking fields...`);
    await clearCurrentSeasonRankings(String(SEASON_START_YEAR));
    console.error(`    cleared`);
  }

  // Accumulate then batch-upsert. Cuts DB round-trips from ~20k to ~50.
  const rankingRowsByKey = new Map();   // "category:spillerId" → ranking row (for MIX dedupe)
  const playerRowsById = new Map();     // spillerId → player row

  for (const list of RANKING_LISTS) {
    console.error(`\n  Ranking: ${list.label} (list ${list.rankinglistid} → ${list.category})`);
    const { meta, rows } = await fetchRankingListPaginated(session, list);
    console.error(`    fetched rows=${rows.length} version=${meta.versionDate || '?'}`);

    const versionDateIso = ddmmyyyyToIso(meta.versionDate);
    for (const r of rows) {
      const rankingRow = {
        'Spiller-Id': String(r.spillerId),
        Navn: r.name,
        'Current Club': r.club,
        'All Clubs': r.club,
        category: list.category,
        age_group: list.ageGroup,
        rank: r.rank,
        class_letter: r.classLetter,
        version_date: versionDateIso,
        season: SEASON,
        [String(SEASON_START_YEAR)]: r.points,
        last_updated_at: new Date().toISOString(),
      };
      // Keep the higher-points entry per (age_group, category, spillerId) — matters for MIX (two source lists).
      const key = `${list.ageGroup}:${list.category}:${r.spillerId}`;
      const existing = rankingRowsByKey.get(key);
      if (existing && (+existing[String(SEASON_START_YEAR)] || 0) >= r.points) continue;
      rankingRowsByKey.set(key, rankingRow);

      // Player row: prefer SEN singles for canonical name/club. Skip youth/veteran for the player aggregate
      // so legacy {year} columns stay anchored to SEN ranking points.
      if (list.ageGroup !== 'SEN') continue;
      const playerRow = {
        'Spiller-Id': String(r.spillerId),
        Navn: r.name,
        'Current Club': r.club,
        [String(SEASON_START_YEAR)]: r.points,
        last_updated_at: new Date().toISOString(),
      };
      const existingPlayer = playerRowsById.get(r.spillerId);
      if (list.category === 'HS' || list.category === 'DS' || !existingPlayer) {
        playerRowsById.set(r.spillerId, playerRow);
      }
    }
  }

  const rankingRows = [...rankingRowsByKey.values()];
  const playerRows = [...playerRowsById.values()];
  console.error(`\n  Rankings to upsert: ${rankingRows.length}`);
  console.error(`  Players to upsert:  ${playerRows.length}`);
  if (!DRY_RUN) {
    const n1 = await upsertRankingsBatch(rankingRows);
    console.error(`    rankings upserted: ${n1}`);
    const n2 = await upsertPlayersBatch(playerRows);
    console.error(`    players upserted:  ${n2}`);
  }
  console.error(`  done rankings + players`);
}

async function refreshTournaments() {
  const session = await openSession('tournaments');

  // 1. Get season plan
  console.error(`\n  Fetching season plan (from ${FROM_DATE})...`);
  const plan = await wsPost(session, 'GetSeasonPlan', {
    seasonid: SEASON_ID,
    strfrom: FROM_DATE,
    strto: '', strweekno: '', strweekno2: '',
    clubid: '', publicseasonplan: true, page: 0,
    selectclientfunction: 'SeasonPlan.SelectTournament',
    showleague: false,
    age: null, agegroupids: null, birthdate: null, classids: null,
    disciplines: null, gender: null, georegionids: null,
    playerid: null, points: null, regionids: null,
  });
  const tournaments = parseSeasonPlan(plan.html || plan.Html || '');
  console.error(`  found ${tournaments.length} tournaments`);

  // 2. Find which are already ingested (via new rich columns) to skip.
  console.error(`  Checking existing tournament_ids in matches...`);
  const existingIds = DRY_RUN ? new Set() : await fetchExistingTournamentIds();
  console.error(`    already have ${existingIds.size} tournament_ids in matches`);

  // Filter list
  let queue = tournaments;
  if (ONLY_TOURNAMENT_ID) queue = queue.filter((t) => t.tournamentId === ONLY_TOURNAMENT_ID);
  else queue = queue.filter((t) => !existingIds.has(t.tournamentId));
  console.error(`    to process: ${queue.length}`);

  let stats = { tournaments: 0, classes: 0, events: 0, matches: 0, skipped_legacy: 0 };
  // {Spiller-Id → {Navn, Current Club}} harvested from match player cells. Inserted
  // after all tournaments to cover players who never appeared on a ranking list.
  const playersFromMatches = new Map();

  for (const stub of queue) {
    console.error(`\n  → ${stub.title} (id ${stub.tournamentId})`);
    // Fetch first class to get ClassInfo (meta + class list)
    const firstResults = await wsPost(session, 'SearchTournamentResults', {
      tournamentclassid: String(stub.firstClassId),
      clientselectfunction: 'SelectTournamentClass1',
    });
    const meta = parseTournamentMeta(firstResults.ClassInfo || '');
    const classes = parseClassSelect(firstResults.ClassInfo || '');

    const tournamentName = buildTournamentName(stub.title);
    const startDateDisplay = meta?.startDate || null;

    // Legacy duplicate check: same (Tournament Name, Date) exists? Skip to avoid double insert.
    // Bypassed in single-tournament mode so the operator can force a re-scrape.
    if (!DRY_RUN && !ONLY_TOURNAMENT_ID && tournamentName && startDateDisplay) {
      const exists = await tournamentExistsByNameDate(tournamentName, startDateDisplay);
      if (exists) {
        console.error(`    ↺ already in DB by (name, date), skipping`);
        stats.skipped_legacy += 1;
        continue;
      }
    }

    const tournamentRow = {
      id: stub.tournamentId,
      name: tournamentName,
      arranger: (stub.title.split(':')[0] || '').trim(),
      tournament_number: meta?.tournamentNumber || null,
      season: SEASON,
      start_date: ddmmyyyyToIso(meta?.startDate),
      end_date: ddmmyyyyToIso(meta?.endDate),
      registration_deadline: ddmmyyyyToIso(meta?.registrationDeadline || stub.registrationDeadline),
      location: null,
      description_html: meta?.descriptionHtml || null,
      contact_info: meta?.contactInfo || null,
      scraped_at: new Date().toISOString(),
    };

    if (!DRY_RUN) await upsertTournament(tournamentRow);
    stats.tournaments += 1;

    // Process each class
    const matchRows = [];
    for (const cls of classes) {
      const { age_group, skill_level } = classifyTournamentClass(cls.name);
      const classRow = { id: cls.classId, tournament_id: tournamentRow.id, name: cls.name, age_group, skill_level };
      if (!DRY_RUN) await upsertTournamentClass(classRow);
      stats.classes += 1;

      const clsRes = cls.classId === stub.firstClassId
        ? firstResults
        : await wsPost(session, 'SearchTournamentResults', {
            tournamentclassid: String(cls.classId),
            clientselectfunction: 'SelectTournamentClass1',
          });
      const events = parseEventsFromResults(clsRes.Html || '');

      for (const ev of events) {
        if (!ev.discipline) continue; // unknown discipline name, skip
        const eventRow = { id: ev.eventId, class_id: cls.classId, discipline: ev.discipline };
        if (!DRY_RUN) await upsertTournamentEvent(eventRow);
        stats.events += 1;

        const mr = await wsPost(session, 'SearchTournamentMatches', {
          tournamentclassid: String(cls.classId),
          tournamenteventid: String(ev.eventId),
          clientselectfunction: 'SelectTournamentClass1',
        });
        const matches = parseMatches(mr.Html || '');

        for (const m of matches) {
          const row = buildMatchRow({
            match: m,
            tournament: { ...tournamentRow, start_date_display: startDateDisplay },
            tournamentClass: classRow,
            event: ev,
          });
          matchRows.push(row);
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
        await sleep(80);
      }
    }

    console.error(`    matches parsed: ${matchRows.length}`);
    if (!DRY_RUN && matchRows.length) {
      const n = await insertMatchesBatch(matchRows);
      stats.matches += n;
    } else {
      stats.matches += matchRows.length;
    }
  }

  if (!DRY_RUN && playersFromMatches.size) {
    const n = await insertPlayersIfMissingBatch([...playersFromMatches.values()]);
    console.error(`\n  match-derived player rows considered: ${n} (new only — existing rows untouched)`);
  } else if (playersFromMatches.size) {
    console.error(`\n  match-derived player rows (dry run): ${playersFromMatches.size}`);
  }

  console.error(`\n  done tournaments:`, stats);
}

// ---------- Leagues (team series) ----------

// Age group ID map from the page source (note: Åpen=2017, O80=2018 — not sequential).
const AGE_GROUP_IDS = {
  SEN: '2001', U9: '2002', U11: '2003', U13: '2004', U15: '2005',
  U17: '2006', U19: '2007',
  O35: '2008', O40: '2009', O45: '2010', O50: '2011', O55: '2012',
  O60: '2013', O65: '2014', O70: '2015', O75: '2016', O80: '2018',
  'Åpen': '2017',
};

// Region IDs from the page source. 200001 is national (NBF).
const ALL_REGIONS = [
  { id: '200001', name: 'Norges Badminton Forbund' },
  { id: '200002', name: 'Badmintonkretsen Sør' },
  { id: '200003', name: 'Badmintonkretsen Vest' },
  { id: '200004', name: 'Finnmark Badmintonkrets' },
  { id: '200005', name: 'Innlandet Badmintonkrets' },
  { id: '200006', name: 'Hålogaland Badmintonkrets' },
  { id: '200007', name: 'Midtnorsk Badmintonkrets Nord' },
  { id: '200008', name: 'Midtnorsk Badmintonkrets Sør' },
  { id: '200009', name: 'Oslofjorden Badmintonkrets' },
  { id: '200011', name: 'VBT Badmintonkrets' },
];

// Seasons visible in the dropdown (2013/2014 through 2026/2027).
const ALL_SEASON_IDS = Array.from({ length: 14 }, (_, i) => `20020${String(13 + i).padStart(2, '0')}`);

async function refreshLeagues() {
  let session = await openSession('tournaments');
  session.referer = 'https://badmintonportalen.no/NBF/HoldTurnering/Stilling/';

  // Scope options:
  //   --seasons 2013,2014,...  → comma list of start-years (for parallel workers)
  //   --leagues-all            → every season × region × age group
  //   --season YYYY            → single season (already handled by SEASON_ID default)
  //   default                  → current SEASON_ID + national + SEN/U17/U19
  const seasonsArg = argVal('--seasons');
  const seasonsToScan = seasonsArg
    ? seasonsArg.split(',').map((y) => `200${y.trim()}`)
    : LEAGUES_ALL ? ALL_SEASON_IDS : [SEASON_ID];
  const regionsToScan = (seasonsArg || LEAGUES_ALL) ? ALL_REGIONS : [ALL_REGIONS[0]];
  const ageGroupsToScan = (seasonsArg || LEAGUES_ALL)
    ? Object.keys(AGE_GROUP_IDS)
    : ['SEN', 'U17', 'U19'];

  const totalCombos = seasonsToScan.length * regionsToScan.length * ageGroupsToScan.length;
  console.error(`  scope: ${seasonsToScan.length} seasons × ${regionsToScan.length} regions × ${ageGroupsToScan.length} age groups = ${totalCombos} combinations`);

  const stats = { leagues: 0, teams: 0, team_ties: 0, matches: 0, empty_combos: 0 };
  let comboIdx = 0;
  const t0 = Date.now();
  const playersFromMatches = new Map();

  for (const seasonID of seasonsToScan) {
    const seasonLabel = `${seasonID.slice(-4)}/${+seasonID.slice(-4) + 1}`;
    for (const region of regionsToScan) {
      for (const ageGroup of ageGroupsToScan) {
        comboIdx += 1;
        const ageGroupID = AGE_GROUP_IDS[ageGroup];
        const listRes = await wsPost(session, 'GetLeagueStanding', {
          subPage: 1, seasonID, leagueGroupID: null,
          ageGroupID, regionID: region.id,
          leagueGroupTeamID: null, leagueMatchID: null, clubID: null, playerID: null,
        });
        const leagues = parseLeagueList(listRes.html || listRes.Html || '');
        if (!leagues.length) {
          stats.empty_combos += 1;
          if (comboIdx % 25 === 0) {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
            console.error(`  [${comboIdx}/${totalCombos}] ${seasonLabel} ${region.name.slice(0, 15)} ${ageGroup}: empty (${elapsed}s)`);
          }
          await sleep(40);
          continue;
        }
        console.error(`\n  [${comboIdx}/${totalCombos}] ${seasonLabel} / ${region.name} / ${ageGroup}: ${leagues.length} league(s)`);

        for (const lg of leagues) {
          console.error(`    → ${lg.name} (id ${lg.leagueGroupID})`);
          const leagueRow = {
            id: lg.leagueGroupID,
            name: lg.name,
            division: lg.division,
            stage: lg.stage,
            season: seasonLabel,
            age_group_id: ageGroupID,
            age_group: ageGroup,
            region_id: region.id,
            region_name: region.name,
            scraped_at: new Date().toISOString(),
          };
          if (!DRY_RUN) await upsertLeague(leagueRow);
          stats.leagues += 1;

          // Standings → teams
          const standingsRes = await wsPost(session, 'GetLeagueStanding', {
            subPage: '2', seasonID, leagueGroupID: String(lg.leagueGroupID),
            ageGroupID, regionID: region.id,
            leagueGroupTeamID: '', leagueMatchID: '', clubID: '', playerID: '',
          });
          const teams = parseLeagueStandings(standingsRes.html || standingsRes.Html || '');
          const teamRows = teams.map((t) => ({ ...t, league_id: lg.leagueGroupID, scraped_at: new Date().toISOString() }));
          if (!DRY_RUN && teamRows.length) await upsertLeagueTeamsBatch(teamRows);
          stats.teams += teamRows.length;

          // All team ties
          const matchesRes = await wsPost(session, 'GetLeagueStanding', {
            subPage: '4', seasonID, leagueGroupID: String(lg.leagueGroupID),
            ageGroupID, regionID: region.id,
            leagueGroupTeamID: '', leagueMatchID: '', clubID: '', playerID: '',
          });
          const ties = parseLeagueMatches(matchesRes.html || matchesRes.Html || '');
          if (ties.length) console.error(`      team ties: ${ties.length}`);

            for (const tie of ties) {
           try {
            const played = !!tie.result_raw && tie.result_raw !== '0-0' && tie.result_raw.trim() !== '';
            const tieRow = {
              id: tie.id,
              league_id: lg.leagueGroupID,
              home_team_id: tie.home_team_id,
              away_team_id: tie.away_team_id,
              home_club: tie.home_club,
              away_club: tie.away_club,
              round_name: tie.round_name,
              match_date: ddmmyyyyToIso(tie.match_date_display),
              match_time_display: tie.time_display,
              arranger: tie.arranger,
              venue: tie.venue,
              result_raw: tie.result_raw,
              home_score: tie.home_score,
              away_score: tie.away_score,
              home_points: tie.home_points,
              away_points: tie.away_points,
              walkover: false,
              scraped_at: new Date().toISOString(),
            };
            if (!DRY_RUN) await upsertLeagueTeamMatch(tieRow);
            stats.team_ties += 1;

            if (!played) { await sleep(40); continue; }

            const detRes = await wsPost(session, 'GetLeagueStanding', {
              subPage: '5', seasonID, leagueGroupID: String(lg.leagueGroupID),
              ageGroupID, regionID: region.id,
              leagueGroupTeamID: '', leagueMatchID: String(tie.id),
              clubID: '', playerID: '',
            });
            const { individualMatches } = parseLeagueMatchDetail(detRes.html || detRes.Html || '');
            for (const im of individualMatches) {
              for (const p of [...(im.left || []), ...(im.right || [])]) {
                if (!p?.playerId) continue;
                playersFromMatches.set(p.playerId, {
                  'Spiller-Id': String(p.playerId),
                  Navn: p.name,
                  'Current Club': p.club,
                  last_updated_at: new Date().toISOString(),
                });
              }
            }
            const matchRows = individualMatches.map((im) => buildLeagueMatchRow({
              indMatch: im,
              league: leagueRow,
              teamMatch: { ...tieRow, match_date_display: tie.match_date_display },
            }));
            if (!DRY_RUN && matchRows.length) {
              const n = await replaceMatchesForTeamTie(tie.id, matchRows);
              stats.matches += n;
            } else {
              stats.matches += matchRows.length;
            }
            await sleep(80);
           } catch (e) {
            console.error(`      ! tie ${tie.id} skipped: ${e.message}`);
           }
          }
        } // for (lg of leagues)
      } // for (ageGroup)
    } // for (region)
  } // for (seasonID)
  if (!DRY_RUN && playersFromMatches.size) {
    const n = await insertPlayersIfMissingBatch([...playersFromMatches.values()]);
    console.error(`\n  match-derived player rows considered: ${n} (new only — existing rows untouched)`);
  } else if (playersFromMatches.size) {
    console.error(`\n  match-derived player rows (dry run): ${playersFromMatches.size}`);
  }
  console.error(`\n  done leagues:`, stats);
}

// ---------- Main ----------

async function main() {
  if (!ONLY_RANKINGS && !ONLY_TOURNAMENT_ID) {
    // Skip standalone rankings run when doing single-tournament mode
  }

  if (ONLY_LEAGUES) {
    console.error(`\n=== LEAGUES ===`);
    await refreshLeagues();
    console.error(`\nAll done.`);
    return;
  }

  if (!ONLY_TOURNAMENTS && !ONLY_TOURNAMENT_ID) {
    console.error(`\n=== RANKINGS ===`);
    await refreshRankings();
  }

  if (!ONLY_RANKINGS) {
    console.error(`\n=== TOURNAMENTS ===`);
    await refreshTournaments();
  }

  if (!ONLY_RANKINGS && !ONLY_TOURNAMENT_ID && !SKIP_LEAGUES) {
    console.error(`\n=== LEAGUES ===`);
    await refreshLeagues();
  }

  console.error(`\nAll done.`);
}

main().catch((e) => {
  console.error(`FATAL: ${e.stack || e}`);
  process.exit(1);
});
