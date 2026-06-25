// Parse GetSeasonPlan response → list of tournaments.
import { stripTags } from './api.js';

export function parseSeasonPlan(html) {
  if (!html) return [];
  const tournaments = [];
  const rowRe = /<tr class='row[^']*'\s+onclick='return SeasonPlan\.SelectTournament\((\d+),\s*(\d+)\);'\s*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    const [, tournamentId, firstClassId, inner] = m;
    const week = (inner.match(/<td class='week'>([^<]+)<\/td>/) || [])[1] || '';
    const dateShort = stripTags((inner.match(/<td class='date'>([\s\S]*?)<\/td>/) || [])[1] || '');
    const title = stripTags((inner.match(/<td class='title'>([\s\S]*?)<\/td>/) || [])[1] || '');
    const reg = (inner.match(/<td class='lastregistration'>([^<]+)<\/td>/) || [])[1] || '';
    tournaments.push({
      tournamentId: +tournamentId,
      firstClassId: +firstClassId,
      week: week.trim(),
      dateShort: dateShort.trim(),               // "21.‑22."
      title,                                      // "Djerv: Djerv Høsttreff 2025"
      registrationDeadline: reg.trim(),           // "02.09.2025"
    });
  }
  return tournaments;
}
