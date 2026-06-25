// Parse GetRankingListPlayers response → array of ranking rows + meta.
import { decodeEntities, stripTags } from './api.js';

// Each age group has 6 consecutive list ids (HS, HD, DS, DD, MIX(D), MIX(H)).
// Bases discovered from the RankingListTable on /NBF/Ranglister/ source.
const AGE_GROUP_BASES = [
  { ageGroup: 'SEN', base: 1 },
  { ageGroup: 'U13', base: 7 },
  { ageGroup: 'U15', base: 13 },
  { ageGroup: 'U17', base: 19 },
  { ageGroup: 'U19', base: 25 },
  { ageGroup: 'O35', base: 31 },
  { ageGroup: 'O40', base: 37 },
  { ageGroup: 'O45', base: 43 },
  { ageGroup: 'O50', base: 49 },
  { ageGroup: 'O55', base: 55 },
  { ageGroup: 'O60', base: 61 },
  { ageGroup: 'O65', base: 67 },
  { ageGroup: 'O70', base: 73 },
  { ageGroup: 'O75', base: 79 },
  { ageGroup: 'O80', base: 85 },
];

const DISCIPLINE_OFFSETS = [
  { offset: 0, category: 'HS',  label: 'Herresingel' },
  { offset: 1, category: 'HD',  label: 'Herredouble' },
  { offset: 2, category: 'DS',  label: 'Damesingle' },
  { offset: 3, category: 'DD',  label: 'Damedouble' },
  { offset: 4, category: 'MIX', label: 'Mixeddouble (D)' },
  { offset: 5, category: 'MIX', label: 'Mixeddouble (H)' },
];

// Flattened 15 × 6 = 90 ranking lists across all age groups.
export const RANKING_LISTS = AGE_GROUP_BASES.flatMap((ag) =>
  DISCIPLINE_OFFSETS.map((d) => ({
    rankinglistid: ag.base + d.offset,
    category: d.category,
    ageGroup: ag.ageGroup,
    label: `${ag.ageGroup} ${d.label}`,
  }))
);

// Parse the ranking HTML. Meta (version date, period, update time) + rows.
export function parseRankingList(html) {
  if (!html) return { meta: {}, rows: [] };

  const meta = {};
  const versionM = html.match(/Versjon:(\d{1,2}\.\d{1,2}\.\d{4})/);
  if (versionM) meta.versionDate = versionM[1];
  const periodM = html.match(/Periode:(\d{1,2}\.\d{1,2}\.\d{4})\s*til\s*(\d{1,2}\.\d{1,2}\.\d{4})/);
  if (periodM) { meta.periodFrom = periodM[1]; meta.periodTo = periodM[2]; }
  const updatedM = html.match(/Oppdatert:(\d{1,2}\.\d{1,2}\.\d{4}[^<]*)/);
  if (updatedM) meta.updatedAt = updatedM[1].trim();

  const rows = [];
  // Row format:
  // <tr[ class='alt']><td class='rank'>RANK</td><td class='playerid'>SPILLERID</td><td class='name'><a href='...#INT,...'>NAME</a>, CLUB</td><td class='clas'>CLASSLETTER</td><td class='points points'>POINTS</td></tr>
  const rowRe = /<tr(?:\s+class='alt')?>\s*<td class='rank'>([^<]*)<\/td>\s*<td class='playerid'>([^<]*)<\/td>\s*<td class='name'>\s*<a[^>]*>([^<]+)<\/a>\s*,\s*([^<]+?)<\/td>\s*<td class='clas'>([^<]*)<\/td>\s*<td class='points points'>([^<]*)<\/td>\s*<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const [, rank, spillerId, name, club, classLetter, points] = m;
    rows.push({
      rank: parseInt(rank, 10) || null,
      spillerId: parseInt(spillerId, 10),
      name: decodeEntities(name).trim(),
      club: decodeEntities(club).trim(),
      classLetter: stripTags(classLetter) || null,
      points: parseFloat(points) || 0,
    });
  }
  return { meta, rows };
}
