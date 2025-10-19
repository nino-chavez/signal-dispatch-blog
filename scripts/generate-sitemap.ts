#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://signal-dispatch-blog.vercel.app';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function formatDate(date: string | Date): string {
  return new Date(date).toISOString().split('T')[0];
}

function generateXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');

  const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const urls: SitemapUrl[] = [];

  // Add homepage
  urls.push({
    loc: SITE_URL,
    lastmod: formatDate(new Date()),
    changefreq: 'daily',
    priority: '1.0',
  });

  // Add blog index
  urls.push({
    loc: `${SITE_URL}/blog`,
    lastmod: formatDate(new Date()),
    changefreq: 'daily',
    priority: '0.9',
  });

  // Read all MDX files
  const files = fs.readdirSync(contentDir).filter((file) => file.endsWith('.mdx'));

  console.log(`📄 Found ${files.length} blog posts`);

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(fileContent);

    const slug = file.replace('.mdx', '');

    // Skip posts without required fields
    if (!frontmatter.title || !frontmatter.publishedAt) {
      console.warn(`⚠️  Skipping ${slug}: missing required fields`);
      continue;
    }

    // Add blog post to sitemap
    urls.push({
      loc: `${SITE_URL}/blog/${slug}`,
      lastmod: formatDate(frontmatter.publishedAt),
      changefreq: 'monthly',
      priority: frontmatter.featured ? '0.8' : '0.7',
    });
  }

  // Sort by priority (highest first), then by lastmod (newest first)
  urls.sort((a, b) => {
    const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime();
  });

  // Generate XML
  const xml = generateXml(urls);

  // Write to file
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`✅ Sitemap generated successfully!`);
  console.log(`   📊 ${urls.length} URLs`);
  console.log(`   📝 ${files.length} blog posts`);
  console.log(`   💾 Saved to: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`   🌐 URL: ${SITE_URL}/sitemap.xml`);
}

generateSitemap().catch((error) => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
