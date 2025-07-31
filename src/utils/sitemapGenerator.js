const { getAllRankings } = require('../services/databaseService');

const generateSitemap = async () => {
  const baseUrl = 'https://badstat.no';
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/hvorfor', priority: 0.8, changefreq: 'monthly' },
    { url: '/hvordan', priority: 0.8, changefreq: 'monthly' },
    { url: '/headtohead', priority: 0.9, changefreq: 'daily' },
    { url: '/playerlist', priority: 0.9, changefreq: 'daily' },
    { url: '/MostGames', priority: 0.9, changefreq: 'daily' },
  ];

  try {
    // Get all players from database
    const allRankings = await getAllRankings();
    
    // Get unique player names from database
    const allPlayers = new Set(
      allRankings.map(p => p.Navn).filter(Boolean)
    );

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
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap with static pages only if database fails
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;
    return basicSitemap;
  }
};

module.exports = generateSitemap; 