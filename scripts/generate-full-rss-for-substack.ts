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

interface MDXPost {
  slug: string;
  frontmatter: {
    title: string;
    publishedAt: string;
    author: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featured?: boolean;
    source?: string;
    linkedinUrl?: string;
    externalUrl?: string;
  };
  content: string;
}

function parseMDXFile(filePath: string): MDXPost | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const slug = path.basename(filePath, '.mdx');

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) return null;

    const frontmatterStr = frontmatterMatch[1];
    const bodyContent = frontmatterMatch[2];

    // Parse frontmatter (simple YAML parsing)
    const frontmatter: any = {};
    const lines = frontmatterStr.split('\n');
    let currentKey = '';
    let currentArray: string[] | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const colonIndex = line.indexOf(':');
      if (colonIndex > 0 && !line.startsWith(' ')) {
        // New key-value pair
        if (currentArray) {
          frontmatter[currentKey] = currentArray;
          currentArray = null;
        }

        currentKey = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Check if this starts an array
        if (value === '') {
          // Look ahead for array items
          currentArray = [];
          continue;
        }

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        frontmatter[currentKey] = value;
      } else if (currentArray && line.startsWith('- ')) {
        // Array item
        const item = line.substring(1).trim();
        currentArray.push(item.replace(/"/g, ''));
      }
    }

    // Handle final array if exists
    if (currentArray) {
      frontmatter[currentKey] = currentArray;
    }

    return {
      slug,
      frontmatter,
      content: bodyContent.trim()
    };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
    return null;
  }
}

function generateFullContentRSSFeed(posts: MDXPost[]): string {
  const buildDate = new Date().toUTCString();

  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime()
  );

  const items = sortedPosts.map((post) => {
    const pubDate = new Date(post.frontmatter.publishedAt).toUTCString();
    const postUrl = `${SITE_URL}/${post.slug}`;
    const categories = Array.isArray(post.frontmatter.tags)
      ? post.frontmatter.tags.map(tag => `    <category>${escapeXml(tag)}</category>`).join('\n')
      : '';

    // Convert markdown content to basic HTML for RSS
    let htmlContent = post.content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      // Clean up
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<ul>)/g, '$1')
      .replace(/(<\/ul>)<\/p>/g, '$1');

    return `  <item>
    <title>${escapeXml(post.frontmatter.title)}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>${AUTHOR_EMAIL} (${AUTHOR_NAME})</author>
    <description>${escapeXml(post.frontmatter.excerpt || '')}</description>
    <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
${categories}
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/full-content-rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>${AUTHOR_EMAIL} (${AUTHOR_NAME})</managingEditor>
    <webMaster>${AUTHOR_EMAIL} (${AUTHOR_NAME})</webMaster>
${items}
  </channel>
</rss>`;
}

async function main() {
  try {
    console.log('📡 Generating full-content RSS feed for Substack import...');

    // Read all MDX files
    const blogDir = path.join(__dirname, '../src/content/blog');
    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.mdx'));

    console.log(`📂 Found ${files.length} MDX files`);

    const posts: MDXPost[] = [];
    for (const file of files) {
      const filePath = path.join(blogDir, file);
      const post = parseMDXFile(filePath);
      if (post) {
        posts.push(post);
      }
    }

    console.log(`✅ Parsed ${posts.length} posts successfully`);

    // Generate full-content RSS
    const rss = generateFullContentRSSFeed(posts);

    // Write to public directory
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const rssPath = path.join(publicDir, 'full-content-rss.xml');
    fs.writeFileSync(rssPath, rss, 'utf-8');

    console.log(`✅ Full-content RSS feed generated successfully!`);
    console.log(`   📊 ${posts.length} posts included with full content`);
    console.log(`   💾 Saved to: public/full-content-rss.xml`);
    console.log(`   🔗 Use this URL for Substack import: ${SITE_URL}/full-content-rss.xml`);

  } catch (error) {
    console.error('❌ Failed to generate full-content RSS feed:', error);
    process.exit(1);
  }
}

main();