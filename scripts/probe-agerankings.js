// Probe the GetRankingListPlayers endpoint with age group filters
// to discover which age-group ranking lists exist (U15/U17/etc.)
import { openSession, wsPost } from './lib/api.js';
import { parseRankingList } from './lib/parse-ranking.js';

const SEASON_ID = '2002025';
// Per the RankingListTable in /NBF/Ranglister/ HTML: each age group has 6 list IDs.
// HS list ids: SEN=1, U13=7, U15=13, U17=19, U19=25, O35=31, ...
const PROBES = [
  { name: 'SEN HS',  id: 1 },
  { name: 'U13 HS',  id: 7 },
  { name: 'U15 HS',  id: 13 },
  { name: 'U17 HS',  id: 19 },
  { name: 'U19 HS',  id: 25 },
];

const session = await openSession('rankings');

for (const p of PROBES) {
  const res = await wsPost(session, 'GetRankingListPlayers', {
    rankinglistid: p.id,
    seasonid: SEASON_ID,
    rankinglistagegroupid: '', agegroupid: '',
    agefrom: '', ageto: '',
    birthdatefromstring: '', birthdatetostring: '',
    classid: '', clubid: '',
    gender: '', getplayer: false, getversions: false,
    pageindex: 0, param: '', playerid: '',
    pointsfrom: '', pointsto: '',
    rankingfrom: '', rankingto: '',
    rankinglistversiondate: '',
    regionid: '', searchall: null, sortfield: 0,
  });
  const { meta, rows } = parseRankingList(res.Html || '');
  console.log(`${p.name.padEnd(8)} (list ${p.id}): rows=${rows.length} version=${meta.versionDate || '?'}${rows[0] ? `  top=${rows[0].name} (${rows[0].club}, ${rows[0].points}p)` : ''}`);
}
