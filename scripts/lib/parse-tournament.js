// Parsers for SearchTournamentResults and SearchTournamentMatches responses.
import { decodeEntities, stripTags } from './api.js';

// ClassInfo contains: tournament header <h2>DATE ARRANGER TITLE</h2>, meta table, description, class <select>.
export function parseTournamentMeta(classInfo) {
  if (!classInfo) return null;
  // Header: "20.09.2025 Tromsø Tromsøpalmen"
  const headerMatch = classInfo.match(/<h2>([\s\S]*?)<\/h2>/);
  const headerText = headerMatch ? decodeEntities(headerMatch[1]) : '';
  const headerParts = headerText.match(/^(\d{1,2}\.\d{1,2}\.\d{4})\s+(.+)$/);
  const firstDate = headerParts ? headerParts[1] : null;
  const arrangerPlusTitle = headerParts ? headerParts[2] : headerText;

  // Meta table: Turneringsnummer, Dato range, Påmeldingsfrist, Kontakt
  // Labels may contain HTML entities (e.g. "P&#229;meldingsfrist"). Pass regex fragments that allow entity chars.
  const getCell = (labelPattern) => {
    const re = new RegExp(`<td class='label'>${labelPattern}[\\s\\S]*?<td[^>]*>([\\s\\S]*?)<\\/td>`);
    const m = classInfo.match(re);
    return m ? stripTags(m[1]) : null;
  };
  const tournamentNumber = getCell('Turneringsnummer') || null;
  const dateRangeStr = getCell('Dato') || null;
  const registrationDeadline = getCell('P(?:&#229;|å)meldingsfrist') || null;
  const contactRaw = getCell('Kontakt') || null;

  // Parse date range → startDate, endDate ("DD.MM.YYYY")
  let startDate = null, endDate = null;
  if (dateRangeStr) {
    const dm = dateRangeStr.match(/(\d{1,2}\.\d{1,2}\.\d{4})\s+til\s+[^\s]*\s+(\d{1,2}\.\d{1,2}\.\d{4})/);
    if (dm) { startDate = dm[1]; endDate = dm[2]; }
    else {
      const single = dateRangeStr.match(/(\d{1,2}\.\d{1,2}\.\d{4})/);
      if (single) { startDate = single[1]; endDate = single[1]; }
    }
  }
  if (!startDate && firstDate) startDate = firstDate;

  // Contact: "Adrian Olsen-Loe Pedersen, 94975724, adpe3009@live.no"
  let contactInfo = null;
  if (contactRaw) {
    const parts = contactRaw.split(',').map((s) => s.trim());
    contactInfo = {
      name: parts[0] || null,
      phone: parts[1] || null,
      email: (parts[2] || '').replace(/^mailto:/, '') || null,
    };
  }

  // Description HTML lives in <div class='tournamentinfo'>...</div>
  const descM = classInfo.match(/<div class='tournamentinfo'>([\s\S]*?)<\/div>\s*<br \/>\s*<a/);
  const descriptionHtml = descM ? descM[1].trim() : null;

  return {
    headerText,
    arrangerPlusTitle,   // "Tromsø Tromsøpalmen"
    tournamentNumber,
    startDate, endDate,
    registrationDeadline,
    contactInfo,
    descriptionHtml,
  };
}

// Extract classes from the <select> inside ClassInfo
export function parseClassSelect(classInfo) {
  if (!classInfo) return [];
  const block = classInfo.match(/<select[^>]*SelectTournamentClass1[^>]*>([\s\S]*?)<\/select>/);
  if (!block) return [];
  const out = [];
  const re = /<option value="(\d+)"[^>]*>\s*<h2>([^<]+)<\/h2>/g;
  let m;
  while ((m = re.exec(block[1]))) out.push({ classId: +m[1], name: stripTags(m[2]) });
  return out;
}

// Classify a class name like "SEN A" → { age_group, skill_level }
export function classifyTournamentClass(name) {
  const m = name.match(/^(U\d+|SEN)\s+([A-Z])/i);
  if (!m) return { age_group: null, skill_level: null };
  return { age_group: m[1].toUpperCase(), skill_level: m[2].toUpperCase() };
}

// Extract discipline-specific events from SearchTournamentResults Html.
// Structure: <h2>DISCIPLINE</h2>\r\n<a ... onclick="return TournamentResults.SelectEvent('classid','eventid')">
export function parseEventsFromResults(html) {
  if (!html) return [];
  const out = [];
  const re = /<h2>([^<]+)<\/h2>\s*<a\s+href='#'\s+onclick="return TournamentResults\.SelectEvent\('(\d+)','(\d+)'\);">/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({
      disciplineNo: decodeEntities(m[1]),                // "Herresingle"
      discipline: disciplineCode(decodeEntities(m[1])),  // "HS"
      classId: +m[2],
      eventId: +m[3],
    });
  }
  return out;
}

// Norwegian discipline name → two-letter code used by rankings & frontend
export function disciplineCode(norwegianName) {
  const n = (norwegianName || '').toLowerCase();
  if (n.includes('herresingle')) return 'HS';
  if (n.includes('damesingle')) return 'DS';
  if (n.includes('herredouble')) return 'HD';
  if (n.includes('damedouble')) return 'DD';
  if (n.includes('mixeddouble') || n.includes('mixed') || n === 'mix') return 'MIX';
  return null;
}

// Parse one "player cell" → array of {playerId, name, club}. Handles singles (1 anchor) & doubles (2).
// Anchor format: <a href='http://.../VisSpiller/#22670' title='Vis spiller' >Name</a>, Club<br/>
export function parsePlayerCell(cellHtml) {
  if (!cellHtml) return [];
  const players = [];
  const anchorRe = /<a\s+href='[^#]*#(\d+)'[^>]*>([^<]+)<\/a>\s*(?:,\s*([^<]+?))?\s*<br/g;
  let m;
  while ((m = anchorRe.exec(cellHtml))) {
    players.push({
      playerId: +m[1],
      name: decodeEntities(m[2]),
      club: m[3] ? decodeEntities(m[3]) : null,
    });
  }
  return players;
}

// Parse score string "21/14,21/8" into [[21,14],[21,8]]. Empty or W.O. → null.
export function parseScoreSets(scoreRaw) {
  if (!scoreRaw) return null;
  const s = scoreRaw.trim();
  if (!s || s.toUpperCase() === 'W.O.' || s.toUpperCase() === 'WO') return null;
  const sets = s.split(',').map((set) => {
    const p = set.split('/').map((x) => parseInt(x.trim(), 10));
    if (p.length !== 2 || p.some((n) => Number.isNaN(n))) return null;
    return p;
  });
  return sets.some((x) => x === null) ? null : sets;
}

// Parse SearchTournamentMatches Html → array of matches in order.
// Phase rows: <tr class='headrow'><td colspan='4'>Finale</td></tr>
// Match rows: two <td class='player'/'player winner'> cells + <td class='sep'>-</td> + <td class='result'>21/14,21/8</td>
export function parseMatches(html) {
  if (!html) return [];
  const out = [];
  let currentPhase = null;
  const tokenRe = /(<tr class='headrow'>\s*<td colspan='4'>([^<]+)<\/td>\s*<\/tr>)|(<tr(?:\s+class='alt')?>\s*<td class='player( winner)?'>([\s\S]*?)<\/td>\s*<td class='sep'>-<\/td>\s*<td class='player( winner)?'>([\s\S]*?)<\/td>\s*<td class='result'>([^<]*)<\/td>\s*<\/tr>)/g;
  let m;
  while ((m = tokenRe.exec(html))) {
    if (m[2]) {
      currentPhase = decodeEntities(m[2]);
      continue;
    }
    const leftWinner = !!m[4];
    const leftCell = m[5];
    const rightWinner = !!m[6];
    const rightCell = m[7];
    const score = (m[8] || '').trim();
    const left = parsePlayerCell(leftCell);
    const right = parsePlayerCell(rightCell);
    const walkover = score.toUpperCase() === 'W.O.' || score.toUpperCase() === 'WO';
    const winner_side = leftWinner ? 1 : rightWinner ? 2 : null;
    out.push({
      phase: currentPhase,
      left, right,
      winner_side,
      score_raw: score,
      score_sets: parseScoreSets(score),
      walkover,
    });
  }
  return out;
}
