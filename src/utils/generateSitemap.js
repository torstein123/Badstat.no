const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const generateSitemap = async () => {
  const baseUrl = 'https://badstat.no';
  
  // Read player data from CSV file
  const rankingsPath = path.join(process.cwd(), 'src', 'combined_rankings.csv');
  const fileContent = fs.readFileSync(rankingsPath, 'utf8');
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  // Extract unique players with proper name handling
  const players = [...new Set(records.map(record => record.Navn))]
    .filter(name => name && name.trim())
    .map(name => ({
      name,
      lastUpdated: new Date().toISOString() // Using current date as last updated
    }));
  
  // Static pages with their change frequencies
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/playerlist', changefreq: 'weekly', priority: '0.9' },
    { url: '/about', changefreq: 'monthly', priority: '0.7' },
    { url: '/contact', changefreq: 'monthly', priority: '0.7' },
    { url: '/privacy', changefreq: 'yearly', priority: '0.5' },
    { url: '/terms', changefreq: 'yearly', priority: '0.5' }
  ];

  // Generate player URLs with dynamic priorities based on activity
  const playerUrls = players.map(player => {
    const lastUpdated = new Date(player.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);
    
    // Calculate priority based on activity
    let priority = '0.8';
    if (daysSinceUpdate < 14) priority = '0.9';
    if (daysSinceUpdate < 7) priority = '1.0';
    
    // All pages update weekly
    const changefreq = 'weekly';
    
    return {
      url: `/player/${encodeURIComponent(player.name)}`,
      changefreq,
      priority,
      lastmod: lastUpdated.toISOString()
    };
  });

  // Combine all URLs
  const allUrls = [...staticPages, ...playerUrls];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${allUrls.map(url => `
    <url>
      <loc>${baseUrl}${url.url}</loc>
      ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>
  `).join('')}
</urlset>`;

  // Write sitemap to file
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
};

// Run the generator
generateSitemap().catch(console.error); 