const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mapmotion.app';

// Define static routes
const staticRoutes = [
  '/',
  '/templates',
  '/blog',
  '/editor',
  '/projects'
];

// Duplicate minimal blog data for sitemap generation (since we can't easily import TS in simple Node script without setup)
// In a real CI/CD pipeline, we would compile the TS or use ts-node.
const blogPosts = [
  'how-to-animate-travel-route-web',
  'geolayers-alternative-comparison',
  'visualizing-data-on-3d-globe'
];

// Duplicate template IDs for sitemap
const templateIds = ['1', '2', '3', '4', '5', '6', '7', '8'];

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];

  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static routes
  staticRoutes.forEach(route => {
    sitemapContent += `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Add Blog Posts
  blogPosts.forEach(slug => {
    sitemapContent += `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });
  
  // Add Template Pages (if we had individual template pages, which we link to editor)
  // Linking to editor with query param is usually not indexed well as separate pages, 
  // but if we had /templates/:id, we would add them here.
  // For now, let's assume we might want to index them if we build a detail page later.
  // We'll skip for now as per current architecture they open in editor.

  sitemapContent += `
</urlset>`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent);
  console.log(`Sitemap generated at ${outputPath}`);
}

generateSitemap();
