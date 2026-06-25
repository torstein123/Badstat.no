// POC: pull one tournament end-to-end from badmintonportalen.no
// Run: node scripts/scrape-poc.js

const BASE = 'https://badmintonportalen.no';
const WS = `${BASE}/SportsResults/Components/WebService1.asmx`;
const REFERER_TURNERING = `${BASE}/NBF/Turnering/VisResultater/`;
const UA = 'Mozilla/5.0';

const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

const stripTags = (s) => decodeEntities(s.replace(/<[^>]*>/g, ''));

async function openSession() {
  const res = await fetch(REFERER_TURNERING, { headers: { 'User-Agent': UA } });
  const html = await res.text();
  const m = html.match(/var\s+SR_CallbackContext\s*=\s*'([A-F0-9]+)'/);
  if (!m) throw new Error('callbackcontextkey not found on referer page');

  const setCookie = res.headers.getSetCookie?.() || [res.headers.get('set-cookie')].filter(Boolean);
  const cookie = setCookie
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ');

  return { ctxKey: m[1], cookie };
}

async function wsPost(session, method, payload) {
  const res = await fetch(`${WS}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': UA,
      Accept: '*/*',
      Origin: BASE,
      Referer: REFERER_TURNERING,
      Cookie: session.cookie,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ callbackcontextkey: session.ctxKey, ...payload }),
  });
  if (!res.ok) throw new Error(`${method} → HTTP ${res.status}`);
  const json = await res.json();
  return json.d;
}

function parseSeasonPlan(html) {
  const tournaments = [];
  const rowRe = /<tr class='row[^']*'\s+onclick='return SeasonPlan\.SelectTournament\((\d+),\s*(\d+)\);'\s*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const [, tournamentId, firstClassId, inner] = m;
    const week = (inner.match(/<td class='week'>([^<]+)<\/td>/) || [])[1] || '';
    const date = stripTags((inner.match(/<td class='date'>([\s\S]*?)<\/td>/) || [])[1] || '');
    const title = stripTags((inner.match(/<td class='title'>([\s\S]*?)<\/td>/) || [])[1] || '');
    const reg = (inner.match(/<td class='lastregistration'>([^<]+)<\/td>/) || [])[1] || '';
    tournaments.push({
      tournamentId: +tournamentId,
      firstClassId: +firstClassId,
      week: week.trim(),
      date: date.trim(),
      title,
      registrationDeadline: reg.trim(),
    });
  }
  return tournaments;
}

function parseClassSelect(classInfo) {
  const block = classInfo.match(/<select[^>]*SelectTournamentClass1[^>]*>([\s\S]*?)<\/select>/);
  if (!block) return [];
  const out = [];
  const re = /<option value="(\d+)"[^>]*>\s*<h2>([^<]+)<\/h2>/g;
  let m;
  while ((m = re.exec(block[1]))) out.push({ classId: +m[1], name: stripTags(m[2]) });
  return out;
}

function parseEventsFromResults(html) {
  // Pairs: <h2>DISCIPLINE</h2>...<a onclick="return TournamentResults.SelectEvent('classid','eventid')">
  const out = [];
  const re = /<h2>([^<]+)<\/h2>\s*<a\s+href='#'\s+onclick="return TournamentResults\.SelectEvent\('(\d+)','(\d+)'\);">/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({ discipline: decodeEntities(m[1]), classId: +m[2], eventId: +m[3] });
  }
  return out;
}

function parsePlayerCell(cellHtml) {
  // may contain multiple <a> for doubles + trailing ", Club"
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

function parseMatches(html) {
  const matches = [];
  let currentPhase = null;
  const tokenRe = /(<tr class='headrow'>\s*<td colspan='4'>([^<]+)<\/td>\s*<\/tr>)|(<tr(?:\s+class='alt')?>\s*<td class='player( winner)?'>([\s\S]*?)<\/td>\s*<td class='sep'>-<\/td>\s*<td class='player( winner)?'>([\s\S]*?)<\/td>\s*<td class='result'>([^<]*)<\/td>\s*<\/tr>)/g;
  let m;
  while ((m = tokenRe.exec(html))) {
    if (m[2]) {
      currentPhase = decodeEntities(m[2]);
    } else {
      const [, , , , , leftCell, rightWinner, rightCell, score] = m;
      const leftIsWinner = !!m[4];
      const rightIsWinner = !!m[6];
      matches.push({
        phase: currentPhase,
        left: parsePlayerCell(leftCell),
        right: parsePlayerCell(rightCell),
        winner: leftIsWinner ? 'left' : rightIsWinner ? 'right' : null,
        score: (score || '').trim(),
      });
    }
  }
  return matches;
}

async function main() {
  console.error('Opening session...');
  const session = await openSession();
  console.error('  ctxKey prefix:', session.ctxKey.slice(0, 16) + '...');

  console.error('Fetching season plan (2025/2026, from 01.09.2025)...');
  const plan = await wsPost(session, 'GetSeasonPlan', {
    seasonid: '2002025',
    strfrom: '01.09.2025',
    strto: '',
    strweekno: '',
    strweekno2: '',
    clubid: '',
    publicseasonplan: true,
    page: 0,
    selectclientfunction: 'SeasonPlan.SelectTournament',
    showleague: false,
    age: null,
    agegroupids: null,
    birthdate: null,
    classids: null,
    disciplines: null,
    gender: null,
    georegionids: null,
    playerid: null,
    points: null,
    regionids: null,
  });
  const tournaments = parseSeasonPlan(plan.html || plan.Html || '');
  console.error(`  found ${tournaments.length} tournaments`);

  if (!tournaments.length) {
    console.error('No tournaments. Abort.');
    return;
  }

  // Pick from CLI arg (tournament index or id) — default: first
  const arg = process.argv[2];
  let pick;
  if (arg?.startsWith('id:')) {
    const id = +arg.slice(3);
    pick = tournaments.find((t) => t.tournamentId === id);
  } else if (arg !== undefined) {
    pick = tournaments[+arg];
  } else {
    pick = tournaments[0];
  }
  if (!pick) throw new Error('No tournament picked');
  console.error(`\nPicking: ${pick.title} (id ${pick.tournamentId})`);

  console.error('Fetching class list + tournament info...');
  const resultsFirst = await wsPost(session, 'SearchTournamentResults', {
    tournamentclassid: String(pick.firstClassId),
    clientselectfunction: 'SelectTournamentClass1',
  });
  const classes = parseClassSelect(resultsFirst.ClassInfo || '');
  console.error(`  classes: ${classes.map((c) => c.name).join(', ')}`);

  const tournament = { ...pick, classes: [] };

  for (const cls of classes) {
    console.error(`\n  Class ${cls.name} (${cls.classId})...`);
    const clsRes =
      cls.classId === pick.firstClassId
        ? resultsFirst
        : await wsPost(session, 'SearchTournamentResults', {
            tournamentclassid: String(cls.classId),
            clientselectfunction: 'SelectTournamentClass1',
          });
    const events = parseEventsFromResults(clsRes.Html || '');
    const classOut = { ...cls, events: [] };
    for (const ev of events) {
      const mr = await wsPost(session, 'SearchTournamentMatches', {
        tournamentclassid: String(ev.classId),
        tournamenteventid: String(ev.eventId),
        clientselectfunction: 'SelectTournamentClass1',
      });
      const matches = parseMatches(mr.Html || '');
      console.error(`    ${ev.discipline}: ${matches.length} matches`);
      classOut.events.push({ ...ev, matches });
    }
    tournament.classes.push(classOut);
  }

  console.log(JSON.stringify(tournament, null, 2));
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
