const data = require('../combined_rankings.json');
const dataDD = require('../combined_rankingsDD.json');
const dataDS = require('../combined_rankingsDS.json');
const dataHS = require('../combined_rankingsHS.json');
const dataHD = require('../combined_rankingsHD.json');
const dataMIX = require('../combined_rankingsMIX.json');

const generateSitemap = () => {
  const baseUrl = 'https://badstat.no';
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/hvorfor', priority: 0.8, changefreq: 'monthly' },
    { url: '/hvordan', priority: 0.8, changefreq: 'monthly' },
    { url: '/headtohead', priority: 0.9, changefreq: 'daily' },
    { url: '/playerlist', priority: 0.9, changefreq: 'daily' },
    { url: '/MostGames', priority: 0.9, changefreq: 'daily' },
  ];

  // Get unique player names from all datasets
  const allPlayers = new Set([
    ...data.map(p => p.Navn),
    ...dataDD.map(p => p.Navn),
    ...dataDS.map(p => p.Navn),
    ...dataHS.map(p => p.Navn),
    ...dataHD.map(p => p.Navn),
    ...dataMIX.map(p => p.Navn),
  ]);

  const playerPages = Array.from(allPlayers).map(playerName => ({
    url: `/player/${encodeURIComponent(playerName)}`,
    priority: 0.8,
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...playerPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return sitemap;
};

module.exports = generateSitemap; 