// scripts/generate-sitemap.js (run during build)
const fs = require('fs');
const baseUrl = 'https://richharbor.com';

const staticPaths = [
  '/',
  '/allstocks',
  '/contactus',
  '/liquidate-shares',
  '/partner-with-us',
  '/unlisted-shares',
  '/loans',
  '/insurance',
  '/private-markets',
  '/bulk-deals',
  '/corporate-finance',
  '/tech-support'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPaths
    .map((path) => {
      return `
    <url>
      <loc>${baseUrl}${path}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>`;
    })
    .join('')}
</urlset>`;

fs.writeFileSync('public/sitemap.xml', sitemap);
