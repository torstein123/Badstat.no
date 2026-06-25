// Thin client for badmintonportalen.no internal API.
// The endpoints return JSON-wrapped HTML; parsers live in sibling files.

const BASE = 'https://badmintonportalen.no';
const WS = `${BASE}/SportsResults/Components/WebService1.asmx`;
const UA = 'Mozilla/5.0';

const REFERERS = {
  tournaments: `${BASE}/NBF/Turnering/VisResultater/`,
  rankings: `${BASE}/NBF/Ranglister/`,
};

export const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

export const stripTags = (s) => decodeEntities((s || '').replace(/<[^>]*>/g, ''));

export async function openSession(kind = 'tournaments') {
  const url = REFERERS[kind];
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const html = await res.text();
  const m = html.match(/var\s+SR_CallbackContext\s*=\s*'([A-F0-9]+)'/);
  if (!m) throw new Error(`callbackcontextkey not found on ${url}`);
  const cookies = res.headers.getSetCookie?.() || [res.headers.get('set-cookie')].filter(Boolean);
  const cookie = cookies.map((c) => c.split(';')[0]).filter(Boolean).join('; ');
  return { ctxKey: m[1], cookie, referer: url };
}

export async function wsPost(session, method, payload) {
  const res = await fetch(`${WS}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': UA,
      Accept: '*/*',
      Origin: BASE,
      Referer: session.referer,
      Cookie: session.cookie,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ callbackcontextkey: session.ctxKey, ...payload }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${method} → HTTP ${res.status} ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.d;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
