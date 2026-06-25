// Parsers for the /HoldTurnering/Stilling/ (league / team series) endpoints.
// All four subPages (1, 2, 4, 5) return JSON { d: { html: "<...>" } } — note lowercase `html`.
import { decodeEntities, stripTags } from './api.js';

// subPage=1: list of league groups available for (season, age, region).
// Structure:
//   <h2> AGE SEASON</h2>
//   <table class='selectgroup'>
//     <tr class='divisionrow'><td><h3>Eliteserien 2025/2026</h3></td></tr>
//     <tr class='grouprow'><td><a onclick="return ShowStanding('2', SEASONID, GROUPID, ...)">Grunnspill</a></td></tr>
//     ...
// We emit one league per (division, stage).
export function parseLeagueList(html) {
  if (!html) return [];
  const out = [];
  // Walk through <tr> elements in order so we can bind each group to its preceding division.
  const rowRe = /<tr class='(divisionrow|grouprow)'>[\s\S]*?<\/tr>/g;
  let division = null;
  let m;
  while ((m = rowRe.exec(html))) {
    const chunk = m[0];
    if (m[1] === 'divisionrow') {
      const h3 = chunk.match(/<h3>([\s\S]*?)<\/h3>/);
      division = h3 ? stripTags(h3[1]) : null;
    } else {
      const linkM = chunk.match(/ShowStanding\('2',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'[^)]*\);?\s*"\s*>([^<]+)<\/a>/);
      if (!linkM) continue;
      const [, seasonID, groupID, ageID, regionID, stageText] = linkM;
      const stage = decodeEntities(stageText);
      out.push({
        leagueGroupID: +groupID,
        seasonID, ageGroupID: ageID, regionID,
        division,
        stage,
        name: division ? `${division} ${stage}` : stage,
      });
    }
  }
  return out;
}

// subPage=2: standings table.
// <tr class='toprow'>...</tr>
// <tr>...<td class='rank'>1</td><td class='team'><a onclick="ShowStanding('3',...,TEAMID,...)">Bergen</a></td>
//   <td class='played'>7</td><td class='won'>6</td>...<td class='matches'>48-8</td><td class='sets'>98-24</td>
//   <td class='balls'>2434-1743</td><td class='points'>26</td></tr>
export function parseLeagueStandings(html) {
  if (!html) return [];
  const out = [];
  const rowRe = /<tr(?!\s+class='(?:toprow|headerrow)')>[\s\S]*?<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const chunk = m[0];
    const teamIdM = chunk.match(/ShowStanding\('3',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'(\d+)'/);
    if (!teamIdM) continue;
    const teamId = +teamIdM[1];
    const cells = {};
    const cellRe = /<td class='(\w+)'>([\s\S]*?)<\/td>/g;
    let c;
    while ((c = cellRe.exec(chunk))) cells[c[1]] = stripTags(c[2]);
    const nameM = chunk.match(/ShowStanding\('3'[^)]*\);?\s*"\s*>([^<]+)<\/a>/);
    const splitPair = (s) => {
      if (!s) return [null, null];
      const p = s.split('-').map((x) => parseInt(x.trim(), 10));
      return [Number.isFinite(p[0]) ? p[0] : null, Number.isFinite(p[1]) ? p[1] : null];
    };
    const [matches_won, matches_lost] = splitPair(cells.matches || '');
    const [sets_won, sets_lost] = splitPair(cells.sets || '');
    const [balls_won, balls_lost] = splitPair(cells.balls || '');
    out.push({
      id: teamId,
      club_name: nameM ? decodeEntities(nameM[1]) : null,
      rank: parseInt(cells.rank, 10) || null,
      played: parseInt(cells.played, 10) || null,
      won: parseInt(cells.won, 10) || null,
      drawn: parseInt(cells.drawn, 10) || null,
      lost: parseInt(cells.lost, 10) || null,
      matches_won, matches_lost,
      sets_won, sets_lost,
      balls_won, balls_lost,
      points: parseInt(cells.points, 10) || null,
    });
  }
  return out;
}

// subPage=4: all team ties (matches) for a league.
// <tr class='roundheader'><td colspan='9'>Lillerunden 15.11.2025</td></tr>
// <tr><td class='time'>...</td><td class='matchno'><a onclick="ShowStanding('5',...,'','13061','','')">13061</a></td>
//   <td class='team'><a onclick="ShowStanding('3',...,'4983','','','')">Frogner</a></td>
//   <td class='team'><a onclick="ShowStanding('3',...,'4987','','','')">Moss</a></td>
//   <td class='team'>Haugerud</td><td class='venue'>Haugerudhallen</td>
//   <td class='score'>4-4</td><td class='points'>2-2</td><td class='wo'></td>...
export function parseLeagueMatches(html) {
  if (!html) return [];
  const out = [];
  let currentRound = null;
  const rowRe = /<tr(?:\s+class='[^']*')?>[\s\S]*?<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const chunk = m[0];
    const roundM = chunk.match(/<tr class='roundheader'><td colspan='9'>([\s\S]*?)<\/td>/);
    if (roundM) { currentRound = stripTags(roundM[1]); continue; }
    const matchNoM = chunk.match(/ShowStanding\('5'[^)]*,\s*'(\d+)',\s*''/);
    if (!matchNoM) continue;
    const matchId = +matchNoM[1];

    const timeM = chunk.match(/<td class='time'>([\s\S]*?)<\/td>/);
    const timeStr = timeM ? stripTags(timeM[1]) : null;

    // Home/away team cells: each has an anchor with the team ID; find them in order.
    const teamAnchors = [];
    const teamRe = /<td class='team'>\s*<a[^>]*ShowStanding\('3'[^)]*,\s*'(\d+)',\s*''[^)]*\);?\s*"\s*>([^<]+)<\/a>/g;
    let t;
    while ((t = teamRe.exec(chunk))) teamAnchors.push({ teamId: +t[1], name: decodeEntities(t[2]) });

    // Arranger + venue: remaining <td class='team'> (no anchor) and <td class='venue'>
    const arrangerM = chunk.match(/<td class='team'>([^<]+?)<\/td>/);
    const arranger = arrangerM ? decodeEntities(arrangerM[1]).trim() : null;
    const venueM = chunk.match(/<td class='venue'>([\s\S]*?)<\/td>/);
    const venue = venueM ? decodeEntities(venueM[1]).replace(/&shy;/g, '').trim() : null;

    const scoreM = chunk.match(/<td class='score'>([^<]*)<\/td>/);
    const result_raw = scoreM ? stripTags(scoreM[1]) : null;
    const pointsM = chunk.match(/<td class='points'>([^<]*)<\/td>/);
    const pointsPair = pointsM ? stripTags(pointsM[1]) : null;

    const splitIntPair = (s) => {
      if (!s) return [null, null];
      const p = s.split('-').map((x) => parseInt(x.trim(), 10));
      return [Number.isFinite(p[0]) ? p[0] : null, Number.isFinite(p[1]) ? p[1] : null];
    };
    const [home_score, away_score] = splitIntPair(result_raw);
    const [home_points, away_points] = splitIntPair(pointsPair);

    // Parse Norwegian date: "lør. 15.11.2025 12:00" → "15.11.2025"
    const dateM = timeStr ? timeStr.match(/(\d{1,2}\.\d{1,2}\.\d{4})/) : null;
    const matchDateDisplay = dateM ? dateM[1] : null;

    out.push({
      id: matchId,
      round_name: currentRound,
      time_display: timeStr,
      match_date_display: matchDateDisplay,
      home_team_id: teamAnchors[0]?.teamId || null,
      away_team_id: teamAnchors[1]?.teamId || null,
      home_club: teamAnchors[0]?.name || null,
      away_club: teamAnchors[1]?.name || null,
      arranger,
      venue,
      result_raw,
      home_score, away_score,
      home_points, away_points,
    });
  }
  return out;
}

// subPage=5: detail for one team match — 8 individual matches.
// Returns { meta, individualMatches: [...] } where individualMatches have the same shape
// as parseMatches() output so they can feed into buildMatchRow() with minor tweaks.
// Example discipline cell: "1. HS", "2. HD", "1. MD"
const DISCIPLINE_BY_SUFFIX = { HS: 'HS', DS: 'DS', HD: 'HD', DD: 'DD', MD: 'MIX' };

export function parseLeagueMatchDetail(html) {
  if (!html) return { meta: {}, individualMatches: [] };
  // Meta from matchinfo table
  const meta = {};
  const metaCell = (label) => {
    const re = new RegExp(`<tr><td class='lbl'>${label}</td><td class='val'>([\\s\\S]*?)</td></tr>`);
    const m = html.match(re);
    return m ? stripTags(m[1]) : null;
  };
  meta.matchNo = metaCell('Kampnr');
  meta.round = metaCell('Runde');
  meta.time = metaCell('Tid');
  meta.venue = metaCell('Spillested');
  meta.homeTeamRaw = metaCell('Hjemmelag');
  meta.awayTeamRaw = metaCell('Bortelag');
  meta.result = metaCell('Resultat');
  meta.points = metaCell('Point');

  // Extract just the club part from "Frogner Kim Christensen kim.christensen@ncc.no 95963324"
  // (Club name is always the first token up to first space)
  const firstToken = (s) => (s ? s.trim().split(/\s+/)[0] : null);
  meta.homeClub = firstToken(meta.homeTeamRaw);
  meta.awayClub = firstToken(meta.awayTeamRaw);

  // Individual match rows
  const individualMatches = [];
  const rowRe = /<tr>\s*<td class='discipline'>([^<]+)<\/td>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const [, discRaw, rest] = m;
    const label = decodeEntities(discRaw).trim();               // "1. HS"
    const parts = label.match(/^(\d+)\.\s*(HS|DS|HD|DD|MD)$/);
    if (!parts) continue;
    const [, slotNum, suffix] = parts;
    const discipline = DISCIPLINE_BY_SUFFIX[suffix];

    // Two player cells (class='player' or 'playerwinner')
    const cellRe = /<td class='(player|playerwinner)'>([\s\S]*?)<\/td>/g;
    const players = [];
    let c;
    while ((c = cellRe.exec(rest))) {
      const winner = c[1] === 'playerwinner';
      const cellHtml = c[2];
      const teamHdr = (cellHtml.match(/<div class='teamhdr'>([^<]+)<\/div>/) || [])[1] || null;
      const anchorRe = /<a\s+href='[^#]*#(\d+)'[^>]*>([^<]+)<\/a>/g;
      const list = [];
      let a;
      while ((a = anchorRe.exec(cellHtml))) list.push({ playerId: +a[1], name: decodeEntities(a[2]), club: teamHdr });
      players.push({ winner, players: list, club: teamHdr });
    }
    if (players.length < 2) continue;

    // 3 result cells
    const resultRe = /<td class='result'>([\s\S]*?)<\/td>/g;
    const sets = [];
    let sMatch;
    let setsRawParts = [];
    while ((sMatch = resultRe.exec(rest))) {
      const raw = sMatch[1];
      if (!raw || !raw.trim()) continue;
      // Strip <b> tags, decode &nbsp; then split "12&nbsp;-&nbsp;<b>21</b>"
      const clean = decodeEntities(raw.replace(/<b>([^<]*)<\/b>/g, '$1'));
      const pair = clean.split('-').map((x) => parseInt(x.trim(), 10));
      if (pair.length === 2 && pair.every((n) => Number.isFinite(n))) {
        sets.push(pair);
        setsRawParts.push(`${pair[0]}/${pair[1]}`);
      }
    }

    // W.O. / forfeit marker — <td class='wo'><span title='Frogner'>F</span></td>
    const woM = rest.match(/<td class='wo'>\s*<span[^>]*>([^<]+)<\/span>/);
    const walkover = !!woM;

    const winner_side = players[0].winner ? 1 : players[1].winner ? 2 : null;

    individualMatches.push({
      label,                             // "1. HS"
      slot_num: +slotNum,
      discipline,                        // "HS" etc.
      left: players[0].players,          // array of {playerId, name, club}
      right: players[1].players,
      home_club: players[0].club,
      away_club: players[1].club,
      winner_side,
      score_sets: sets.length ? sets : null,
      score_raw: setsRawParts.join(','),
      walkover,
    });
  }

  return { meta, individualMatches };
}
