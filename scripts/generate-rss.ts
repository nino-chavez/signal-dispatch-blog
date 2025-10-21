import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BlogManifest } from '../src/utils/mdx-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://blog.ninochavez.co';
const SITE_TITLE = 'Signal Dispatch';
const SITE_DESCRIPTION = 'Architecture, commerce, and the signals that matter in the age of AI.';
const AUTHOR_NAME = 'Nino Chavez';
const AUTHOR_EMAIL = 'nino@signalreflex.studio';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSSFeed(manifest: BlogManifest): string {
  const buildDate = new Date().toUTCString();

  // Sort posts by date (newest first)
  const sortedPosts = [...manifest.posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Take most recent 50 posts
  const recentPosts = sortedPosts.slice(0, 50);

  const items = recentPosts.map((post) => {
    const pubDate = new Date(post.publishedAt).toUTCString();
    const postUrl = `${SITE_URL}/${post.slug}`;
    const categories = post.tags?.map(tag => `    <category>${escapeXml(tag)}</category>`).join('\n') || '';

    return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>${AUTHOR_EMAIL} (${AUTHOR_NAME})</author>
    <description>${escapeXml(post.excerpt || '')}</description>
${categories}
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>${AUTHOR_EMAIL} (${AUTHOR_NAME})</managingEditor>
    <webMaster>${AUTHOR_EMAIL} (${AUTHOR_NAME})</webMaster>
${items}
  </channel>
</rss>`;
}

async function main() {
  try {
    console.log('📡 Generating RSS feed...');

    // Read manifest
    const manifestPath = path.join(__dirname, '../src/data/blog-manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: BlogManifest = JSON.parse(manifestContent);

    // Generate RSS
    const rss = generateRSSFeed(manifest);

    // Write to public directory
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const rssPath = path.join(publicDir, 'rss.xml');
    fs.writeFileSync(rssPath, rss, 'utf-8');

    console.log(`✅ RSS feed generated successfully!`);
    console.log(`   📊 ${manifest.posts.length} total posts`);
    console.log(`   📄 50 most recent included in feed`);
    console.log(`   💾 Saved to: public/rss.xml`);
  } catch (error) {
    console.error('❌ Failed to generate RSS feed:', error);
    process.exit(1);
  }
}

main();
