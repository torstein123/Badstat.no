// Run: node --test scripts/test-parsers.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { decodeEntities, stripTags } from './lib/api.js';
import {
  parseTournamentMeta,
  parseClassSelect,
  classifyTournamentClass,
  parseEventsFromResults,
  parsePlayerCell,
  parseScoreSets,
  parseMatches,
  disciplineCode,
} from './lib/parse-tournament.js';
import { parseRankingList, RANKING_LISTS } from './lib/parse-ranking.js';
import { parseSeasonPlan } from './lib/parse-season.js';
import {
  parseLeagueList,
  parseLeagueStandings,
  parseLeagueMatches,
  parseLeagueMatchDetail,
} from './lib/parse-league.js';
import {
  seasonFromSeasonId,
  seasonFromStartYear,
  ddmmyyyyToIso,
  buildTournamentName,
  disciplineToMatch,
  buildMatchRow,
  buildLeagueMatchRow,
} from './lib/mapper.js';

// ---------- api helpers ----------
test('decodeEntities handles norsk chars', () => {
  assert.equal(decodeEntities('Tr&#248;ndelag'), 'Trøndelag');
  assert.equal(decodeEntities('T&oslash;'.replace(/&oslash;/g, '&#248;')), 'Tø');
  assert.equal(decodeEntities('&amp;'), '&');
});

test('stripTags strips and decodes', () => {
  assert.equal(stripTags('<b>Bj&#248;rn</b>'), 'Bjørn');
});

// ---------- mapper helpers ----------
test('seasonFromSeasonId maps 2002025 → 2025/2026', () => {
  assert.equal(seasonFromSeasonId('2002025'), '2025/2026');
  assert.equal(seasonFromStartYear(2025), '2025/2026');
});

test('ddmmyyyyToIso', () => {
  assert.equal(ddmmyyyyToIso('20.09.2025'), '2025-09-20');
  assert.equal(ddmmyyyyToIso('3.5.2025'), '2025-05-03');
  assert.equal(ddmmyyyyToIso(null), null);
  assert.equal(ddmmyyyyToIso('garbage'), null);
});

test('buildTournamentName strips colon', () => {
  assert.equal(buildTournamentName('Alta: Alta Open 2026'), 'Alta Alta Open 2026');
  assert.equal(buildTournamentName('Djerv: Djerv Høsttreff 2025'), 'Djerv Djerv Høsttreff 2025');
});

test('disciplineToMatch', () => {
  assert.equal(disciplineToMatch('HS'), 'Herresingle');
  assert.equal(disciplineToMatch('MIX'), 'Mixeddouble');
});

// ---------- discipline code / class classify ----------
test('disciplineCode maps Norwegian', () => {
  assert.equal(disciplineCode('Herresingle'), 'HS');
  assert.equal(disciplineCode('Damesingle'), 'DS');
  assert.equal(disciplineCode('Herredouble'), 'HD');
  assert.equal(disciplineCode('Damedouble'), 'DD');
  assert.equal(disciplineCode('Mixeddouble'), 'MIX');
  assert.equal(disciplineCode('garbage'), null);
});

test('classifyTournamentClass', () => {
  assert.deepEqual(classifyTournamentClass('SEN A'), { age_group: 'SEN', skill_level: 'A' });
  assert.deepEqual(classifyTournamentClass('U13 B'), { age_group: 'U13', skill_level: 'B' });
  assert.deepEqual(classifyTournamentClass('Åpen HC'), { age_group: null, skill_level: null });
});

// ---------- score parsing ----------
test('parseScoreSets', () => {
  assert.deepEqual(parseScoreSets('21/14,21/8'), [[21, 14], [21, 8]]);
  assert.deepEqual(parseScoreSets('20/22,21/10,21/11'), [[20, 22], [21, 10], [21, 11]]);
  assert.equal(parseScoreSets('W.O.'), null);
  assert.equal(parseScoreSets(''), null);
  assert.equal(parseScoreSets(null), null);
});

// ---------- player cell ----------
test('parsePlayerCell singles', () => {
  const html = `<a href='http://badmintonportalen.no/NBF/Spiller/VisSpiller/#22670' title='Vis spiller'  >Gintar Rundelis</a>, Troms&#248;<br />`;
  const out = parsePlayerCell(html);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0], { playerId: 22670, name: 'Gintar Rundelis', club: 'Tromsø' });
});

test('parsePlayerCell doubles', () => {
  const html = `<a href='...#22858'>Michael White</a>, Bergen<br /><a href='...#23619'>Keveen Kumar Balasingam</a>, Sotra<br />`;
  const out = parsePlayerCell(html);
  assert.equal(out.length, 2);
  assert.equal(out[0].playerId, 22858);
  assert.equal(out[1].club, 'Sotra');
});

// ---------- matches parsing ----------
test('parseMatches: singles finale with score + phase tracking', () => {
  const html = `
<tr class='headrow'><td colspan='4'>Finale</td></tr>
<tr><td class='player winner'><a href='/x#100'>A Player</a>, Alpha<br /></td><td class='sep'>-</td><td class='player'><a href='/x#200'>B Player</a>, Beta<br /></td><td class='result'>21/14,21/8</td></tr>
<tr class='headrow'><td colspan='4'>Pulje 1</td></tr>
<tr class='alt'><td class='player'><a href='/x#100'>A Player</a>, Alpha<br /></td><td class='sep'>-</td><td class='player winner'><a href='/x#300'>C Player</a>, Gamma<br /></td><td class='result'>15/21,21/19,21/18</td></tr>
`;
  const out = parseMatches(html);
  assert.equal(out.length, 2);
  assert.equal(out[0].phase, 'Finale');
  assert.equal(out[0].winner_side, 1);
  assert.equal(out[0].score_raw, '21/14,21/8');
  assert.deepEqual(out[0].score_sets, [[21, 14], [21, 8]]);
  assert.equal(out[1].phase, 'Pulje 1');
  assert.equal(out[1].winner_side, 2);
  assert.equal(out[1].walkover, false);
});

test('parseMatches: walkover produces empty right side + walkover flag via score', () => {
  const html = `
<tr class='headrow'><td colspan='4'>1 / 8</td></tr>
<tr><td class='player winner'><a href='/x#50'>Ole Sandvik</a>, Sotra<br /></td><td class='sep'>-</td><td class='player'></td><td class='result'>W.O.</td></tr>
`;
  const out = parseMatches(html);
  assert.equal(out.length, 1);
  assert.equal(out[0].walkover, true);
  assert.equal(out[0].score_sets, null);
  assert.equal(out[0].right.length, 0);
});

test('parseMatches: doubles with two players per side', () => {
  const html = `
<tr class='headrow'><td colspan='4'>Pulje 2</td></tr>
<tr><td class='player winner'><a href='/x#1'>P1</a>, Alpha<br /><a href='/x#2'>P2</a>, Alpha<br /></td><td class='sep'>-</td><td class='player'><a href='/x#3'>P3</a>, Beta<br /><a href='/x#4'>P4</a>, Beta<br /></td><td class='result'>21/10,21/14</td></tr>
`;
  const out = parseMatches(html);
  assert.equal(out[0].left.length, 2);
  assert.equal(out[0].right.length, 2);
  assert.deepEqual(out[0].left.map((x) => x.playerId), [1, 2]);
  assert.equal(out[0].winner_side, 1);
});

// ---------- season plan ----------
test('parseSeasonPlan extracts tournaments', () => {
  const html = `<tr class='row' onclick='return SeasonPlan.SelectTournament(7065, 28002);' ><td class='select'><a href='javascript:void(0)'>Velg</a></td><td class='week'>8</td><td class='date'>21.&#8209;22.</td><td class='title'>Kirkenes: Barents Open 2026</td><td class='lastregistration'>09.02.2026</td><td class='classlist'>...</td></tr>`;
  const out = parseSeasonPlan(html);
  assert.equal(out.length, 1);
  assert.equal(out[0].tournamentId, 7065);
  assert.equal(out[0].firstClassId, 28002);
  assert.equal(out[0].title, 'Kirkenes: Barents Open 2026');
  assert.equal(out[0].registrationDeadline, '09.02.2026');
});

// ---------- tournament meta + classes + events ----------
test('parseTournamentMeta extracts dates, number, contact', () => {
  const classInfo = `<div class='selectedtournamentspan'>
<h2>20.09.2025 Troms&#248; Troms&#248;palmen</h2><table>
<tr><td class='label'>Turneringsnummer:&nbsp;</td><td>S007061</td></tr>
<tr><td class='label'>Dato:&nbsp;</td><td>l&#248;r. 20.09.2025 til s&#248;n. 21.09.2025</td></tr>
<tr><td class='label'>P&#229;meldingsfrist:&nbsp;</td><td>05.09.2025</td></tr>
<tr><td class='label'>Kontakt:&nbsp;</td><td>Adrian Olsen-Loe Pedersen, 94975724, <a href='mailto:adpe3009@live.no'>adpe3009@live.no</a></td></tr>
</table>
<div class='tournamentinfo'><p>Velkommen</p></div><br /><a href='...'>Se program</a>
</div>
<br />
<select onchange="return SelectTournamentClass1(this.value);" class="selectbox" >
<option value="27958" selected='selected'><h2>SEN A</h2></option>
<option value="27959" ><h2>SEN B</h2></option>
</select>`;
  const meta = parseTournamentMeta(classInfo);
  assert.equal(meta.tournamentNumber, 'S007061');
  assert.equal(meta.startDate, '20.09.2025');
  assert.equal(meta.endDate, '21.09.2025');
  assert.equal(meta.registrationDeadline, '05.09.2025');
  assert.equal(meta.contactInfo.name, 'Adrian Olsen-Loe Pedersen');
  assert.equal(meta.contactInfo.phone, '94975724');
  assert.equal(meta.contactInfo.email, 'adpe3009@live.no');
  assert.ok(meta.descriptionHtml.includes('Velkommen'));

  const classes = parseClassSelect(classInfo);
  assert.equal(classes.length, 2);
  assert.deepEqual(classes[0], { classId: 27958, name: 'SEN A' });
});

test('parseEventsFromResults pairs h2 + SelectEvent', () => {
  const html = `
<h2>Herresingle</h2>
<a href='#' onclick="return TournamentResults.SelectEvent('27958','117805');">Vis alle kamper</a><table>...</table>
<h2>Damesingle</h2>
<a href='#' onclick="return TournamentResults.SelectEvent('27958','117806');">Vis alle kamper</a><table>...</table>
`;
  const evs = parseEventsFromResults(html);
  assert.equal(evs.length, 2);
  assert.equal(evs[0].discipline, 'HS');
  assert.equal(evs[0].eventId, 117805);
  assert.equal(evs[1].discipline, 'DS');
});

// ---------- ranking parser ----------
test('parseRankingList extracts meta + rows', () => {
  const html = `
Versjon:15.04.2026<br />
Periode:15.04.2025 til 14.04.2026<br />
Oppdatert:15.04.2026 00:20:05<br />
<table>
<tr><td class='rank'>1</td><td class='playerid'>103539</td><td class='name'><a href='...#21305,1,227160,2002025'>Amund Rikheim Huus</a>, Bergen</td><td class='clas'>E</td><td class='points points'>1120</td></tr>
<tr class='alt'><td class='rank'>2</td><td class='playerid'>116297</td><td class='name'><a href='...#49066,1,227742,2002025'>Shubham</a>, Moss</td><td class='clas'>E</td><td class='points points'>1116</td></tr>
</table>`;
  const { meta, rows } = parseRankingList(html);
  assert.equal(meta.versionDate, '15.04.2026');
  assert.equal(meta.periodFrom, '15.04.2025');
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], {
    rank: 1, spillerId: 103539, name: 'Amund Rikheim Huus',
    club: 'Bergen', classLetter: 'E', points: 1120,
  });
});

// ---------- mapper integration: buildMatchRow ----------
test('buildMatchRow singles preserves legacy slot-2 convention', () => {
  const row = buildMatchRow({
    match: {
      phase: 'Finale',
      left: [{ playerId: 1, name: 'A Player', club: 'Alpha' }],
      right: [{ playerId: 2, name: 'B Player', club: 'Beta' }],
      winner_side: 1,
      score_raw: '21/14,21/8',
      score_sets: [[21, 14], [21, 8]],
      walkover: false,
    },
    tournament: { id: 1, name: 'Test', season: '2025/2026', start_date_display: '20.09.2025' },
    tournamentClass: { id: 10, name: 'SEN A' },
    event: { eventId: 100, discipline: 'HS' },
  });
  assert.equal(row['Team 1 Player 1'], 'NaN');
  assert.equal(row['Team 1 Player 2'], 'A Player');
  assert.equal(row['Team 2 Player 1'], 'NaN');
  assert.equal(row['Team 2 Player 2'], 'B Player');
  assert.equal(row['Winner Player 1'], 'A Player');
  assert.equal(row['Winner Player 2'], 'NaN');
  assert.equal(row['Tab'], 'NaN');
  assert.equal(row.Match, 'Herresingle');
  assert.equal(row['Tournament Class'], 'SEN A');
  assert.equal(row.Date, '20.09.2025');
  // rich columns
  assert.equal(row.tournament_id, 1);
  assert.equal(row.event_id, 100);
  assert.equal(row.phase, 'Finale');
  assert.equal(row.winner_side, 1);
  assert.deepEqual(row.score_sets, [[21, 14], [21, 8]]);
  assert.equal(row.team1_player2_spiller_id, 1);
  assert.equal(row.team2_player2_spiller_id, 2);
  assert.equal(row.team1_player1_spiller_id, null);
});

test('buildMatchRow doubles fills both slots + Tab=Team1Player1', () => {
  const row = buildMatchRow({
    match: {
      phase: 'Semifinaler',
      left: [{ playerId: 1, name: 'A1', club: 'Alpha' }, { playerId: 2, name: 'A2', club: 'Alpha' }],
      right: [{ playerId: 3, name: 'B1', club: 'Beta' }, { playerId: 4, name: 'B2', club: 'Beta' }],
      winner_side: 2,
      score_raw: '21/10,21/14',
      score_sets: [[21, 10], [21, 14]],
      walkover: false,
    },
    tournament: { id: 1, name: 'T', season: '2025/2026', start_date_display: '20.09.2025' },
    tournamentClass: { id: 10, name: 'SEN A' },
    event: { eventId: 101, discipline: 'HD' },
  });
  assert.equal(row['Team 1 Player 1'], 'A1');
  assert.equal(row['Team 1 Player 2'], 'A2');
  assert.equal(row['Team 2 Player 1'], 'B1');
  assert.equal(row['Team 2 Player 2'], 'B2');
  assert.equal(row['Winner Player 1'], 'B1');
  assert.equal(row['Winner Player 2'], 'B2');
  assert.equal(row['Tab'], 'A1');
  assert.equal(row.Match, 'Herredouble');
  assert.equal(row.team1_player1_spiller_id, 1);
  assert.equal(row.team1_player2_spiller_id, 2);
  assert.equal(row.team2_player1_spiller_id, 3);
  assert.equal(row.team2_player2_spiller_id, 4);
});

test('buildMatchRow walkover keeps left player + NaN opponent', () => {
  const row = buildMatchRow({
    match: {
      phase: '1 / 8',
      left: [{ playerId: 50, name: 'Ole', club: 'Sotra' }],
      right: [],
      winner_side: 1,
      score_raw: 'W.O.',
      score_sets: null,
      walkover: true,
    },
    tournament: { id: 1, name: 'T', season: '2025/2026', start_date_display: '20.09.2025' },
    tournamentClass: { id: 10, name: 'U15 A' },
    event: { eventId: 102, discipline: 'HS' },
  });
  assert.equal(row['Team 1 Player 2'], 'Ole');
  assert.equal(row['Team 2 Player 2'], 'NaN');
  assert.equal(row.walkover, true);
  assert.equal(row.Result, 'W.O.');
});

// ---------- rank list coverage sanity ----------
test('RANKING_LISTS has one list per category + MIX split', () => {
  const cats = RANKING_LISTS.map((x) => x.category);
  assert.ok(cats.includes('HS'));
  assert.ok(cats.includes('DS'));
  assert.ok(cats.includes('HD'));
  assert.ok(cats.includes('DD'));
  assert.equal(cats.filter((c) => c === 'MIX').length, 2);
});

// ---------- league parsers ----------
test('parseLeagueList extracts (division, stage) pairs', () => {
  const html = `<h2> SEN 2025/2026</h2><table class='selectgroup' >
<tr class='divisionrow'><td><h3>Eliteserien 2025/2026</h3></td></tr>
<tr class='grouprow'><td><a href="#" onclick="return ShowStanding('2', '2002025', '1537', '2001', '200001', '', '', '', '');">Grunnspill</a></td></tr>
<tr class='grouprow'><td><a href="#" onclick="return ShowStanding('2', '2002025', '1538', '2001', '200001', '', '', '', '');">Sluttspill 1-4</a></td></tr>
</table>`;
  const out = parseLeagueList(html);
  assert.equal(out.length, 2);
  assert.equal(out[0].division, 'Eliteserien 2025/2026');
  assert.equal(out[0].stage, 'Grunnspill');
  assert.equal(out[0].leagueGroupID, 1537);
  assert.equal(out[0].name, 'Eliteserien 2025/2026 Grunnspill');
  assert.equal(out[1].leagueGroupID, 1538);
});

test('parseLeagueStandings extracts team rows', () => {
  const html = `<table>
<tr class='toprow'><td></td><td class='team'>Lag</td><td class='played'>Spilt</td></tr>
<tr><td class='rank'>1</td><td class='team'><a href="#" onclick="return ShowStanding('3', '2002025', '1537', '2001', '200001', '4983', '', '', '');">Bergen</a></td><td class='played'>7</td><td class='won'>6</td><td class='drawn'>1</td><td class='lost'>0</td><td class='matches'>48-8</td><td class='sets'>98-24</td><td class='balls'>2434-1743</td><td class='points'>26</td></tr>
</table>`;
  const out = parseLeagueStandings(html);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 4983);
  assert.equal(out[0].club_name, 'Bergen');
  assert.equal(out[0].rank, 1);
  assert.equal(out[0].matches_won, 48);
  assert.equal(out[0].matches_lost, 8);
  assert.equal(out[0].points, 26);
});

test('parseLeagueMatches extracts team ties grouped by round', () => {
  const html = `<table>
<tr class='roundheader'><td colspan='9'>Lillerunden 15.11.2025</td></tr>
<tr><td class='time'>l&#248;r. 15.11.2025 12:00</td><td class='matchno'><a href="#" onclick="return ShowStanding('5', '2002025', '1537', '2001', '200001', '', '13061', '', '');">13061</a></td><td class='team'><a href="#" onclick="return ShowStanding('3', '2002025', '1537', '2001', '200001', '4983', '', '', '');">Frogner</a></td><td class='team'><a href="#" onclick="return ShowStanding('3', '2002025', '1537', '2001', '200001', '4987', '', '', '');">Moss</a></td><td class='team'>Haugerud</td><td class='venue'>Haugerudhallen</td><td class='score'>4-4</td><td class='points'>2-2</td><td class='wo'></td></tr>
</table>`;
  const out = parseLeagueMatches(html);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, 13061);
  assert.equal(out[0].round_name, 'Lillerunden 15.11.2025');
  assert.equal(out[0].home_club, 'Frogner');
  assert.equal(out[0].away_club, 'Moss');
  assert.equal(out[0].home_score, 4);
  assert.equal(out[0].away_score, 4);
  assert.equal(out[0].home_points, 2);
  assert.equal(out[0].match_date_display, '15.11.2025');
});

test('parseLeagueMatchDetail handles singles + doubles + walkover marker', () => {
  const html = `<table class='matchinfo'>
<tr><td class='lbl'>Kampnr</td><td class='val'>13061</td></tr>
<tr><td class='lbl'>Hjemmelag</td><td class='val'>Frogner Kim Christensen kim@a.com 123</td></tr>
<tr><td class='lbl'>Bortelag</td><td class='val'>Moss Fredrik Kristensen fk@a.com 123</td></tr>
</table>
<table class='matchresultschema showmatch'>
<tr class='toprow'><td></td><td>Frogner</td><td>Moss</td><td>1</td><td>2</td><td>3</td><td class='wo'>Vinner W.O.</td></tr>
<tr><td class='discipline'>1. HS</td>
<td class='player'><div class='teamhdr'>Frogner</div><div><a href='http://badmintonportalen.no/NBF/Spiller/VisSpiller/#18971' title='Vis spiller'>Nikolai Svensson</a></div></td>
<td class='playerwinner'><div class='teamhdr'>Moss</div><div><a href='http://badmintonportalen.no/NBF/Spiller/VisSpiller/#49066' title='Vis spiller'>Shubham</a></div></td>
<td class='result'>12&nbsp;-&nbsp;<b>21</b></td><td class='result'>6&nbsp;-&nbsp;<b>21</b></td><td class='result'></td><td class='wo'></td></tr>
<tr><td class='discipline'>1. HD</td>
<td class='player'><div class='teamhdr'>Frogner</div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#20266'>Vegard Rikheim</a></div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#18971'>Nikolai Svensson</a></div></td>
<td class='playerwinner'><div class='teamhdr'>Moss</div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#18543'>Fredrik Kristensen</a></div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#49066'>Shubham</a></div></td>
<td class='result'>21&nbsp;-&nbsp;<b>8</b></td><td class='result'>14&nbsp;-&nbsp;<b>21</b></td><td class='result'>21&nbsp;-&nbsp;<b>23</b></td><td class='wo'></td></tr>
<tr><td class='discipline'>1. DD</td>
<td class='playerwinner'><div class='teamhdr'>Frogner</div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#1'>A1</a></div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#2'>A2</a></div></td>
<td class='player'><div class='teamhdr'>Moss</div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#3'>B1</a></div><div><a href='http://a.no/NBF/Spiller/VisSpiller/#4'>B2</a></div></td>
<td class='result'><b>21</b>&nbsp;-&nbsp;18</td><td class='result'><b>13</b>&nbsp;-&nbsp;21</td><td class='result'><b>9</b>&nbsp;-&nbsp;10</td><td class='wo'><span title='Frogner'>F</span></td></tr>
</table>`;
  const { meta, individualMatches } = parseLeagueMatchDetail(html);
  assert.equal(meta.matchNo, '13061');
  assert.equal(meta.homeClub, 'Frogner');
  assert.equal(meta.awayClub, 'Moss');

  assert.equal(individualMatches.length, 3);
  // Singles 1. HS
  assert.equal(individualMatches[0].label, '1. HS');
  assert.equal(individualMatches[0].discipline, 'HS');
  assert.equal(individualMatches[0].left.length, 1);
  assert.equal(individualMatches[0].right.length, 1);
  assert.equal(individualMatches[0].winner_side, 2);
  assert.deepEqual(individualMatches[0].score_sets, [[12, 21], [6, 21]]);
  assert.equal(individualMatches[0].walkover, false);

  // Doubles 1. HD
  assert.equal(individualMatches[1].label, '1. HD');
  assert.equal(individualMatches[1].discipline, 'HD');
  assert.equal(individualMatches[1].left.length, 2);
  assert.equal(individualMatches[1].right.length, 2);
  assert.equal(individualMatches[1].winner_side, 2);

  // Doubles 1. DD with "F" walkover marker
  assert.equal(individualMatches[2].walkover, true);
  assert.equal(individualMatches[2].winner_side, 1);
});

test('buildLeagueMatchRow maps to legacy flat cols for singles', () => {
  const indMatch = {
    label: '1. HS', slot_num: 1, discipline: 'HS',
    left: [{ playerId: 10, name: 'A Home', club: 'Frogner' }],
    right: [{ playerId: 20, name: 'B Away', club: 'Moss' }],
    winner_side: 2,
    score_sets: [[12, 21], [6, 21]],
    score_raw: '12/21,6/21',
    walkover: false,
    home_club: 'Frogner', away_club: 'Moss',
  };
  const league = { id: 1537, name: 'Eliteserien 2025/2026 Grunnspill', season: '2025/2026', age_group: 'SEN' };
  const teamMatch = { id: 13061, match_date_display: '15.11.2025' };
  const row = buildLeagueMatchRow({ indMatch, league, teamMatch });
  assert.equal(row['Team 1 Player 1'], 'NaN');
  assert.equal(row['Team 1 Player 2'], 'A Home');
  assert.equal(row['Team 2 Player 2'], 'B Away');
  assert.equal(row['Winner Player 1'], 'B Away');
  assert.equal(row['Match'], 'Herresingle');
  assert.equal(row['Tournament Name'], 'Eliteserien 2025/2026 Grunnspill');
  assert.equal(row['Tournament Class'], 'SEN');
  assert.equal(row.league_id, 1537);
  assert.equal(row.league_team_match_id, 13061);
  assert.equal(row.league_match_type, '1. HS');
  assert.equal(row.phase, '1. HS');
  assert.equal(row.winner_side, 2);
  assert.equal(row.team1_player2_spiller_id, 10);
  assert.equal(row.team2_player2_spiller_id, 20);
});

test('buildLeagueMatchRow doubles fills all 4 slots', () => {
  const indMatch = {
    label: '1. HD', slot_num: 1, discipline: 'HD',
    left: [{ playerId: 1, name: 'A1', club: 'Frogner' }, { playerId: 2, name: 'A2', club: 'Frogner' }],
    right: [{ playerId: 3, name: 'B1', club: 'Moss' }, { playerId: 4, name: 'B2', club: 'Moss' }],
    winner_side: 1, score_sets: [[21, 8], [14, 21], [21, 23]],
    score_raw: '21/8,14/21,21/23', walkover: false,
    home_club: 'Frogner', away_club: 'Moss',
  };
  const row = buildLeagueMatchRow({
    indMatch,
    league: { id: 1537, name: 'X', season: '2025/2026', age_group: 'SEN' },
    teamMatch: { id: 13061, match_date_display: '15.11.2025' },
  });
  assert.equal(row['Team 1 Player 1'], 'A1');
  assert.equal(row['Team 1 Player 2'], 'A2');
  assert.equal(row['Team 2 Player 1'], 'B1');
  assert.equal(row['Team 2 Player 2'], 'B2');
  assert.equal(row['Tab'], 'A1');
  assert.equal(row['Match'], 'Herredouble');
  assert.equal(row.team1_player1_spiller_id, 1);
  assert.equal(row.team2_player2_spiller_id, 4);
});
