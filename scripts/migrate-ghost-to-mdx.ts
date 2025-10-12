/**
 * Ghost CMS to MDX Migration Script
 *
 * Converts Ghost JSON export to MDX files with frontmatter.
 * Includes HTML to Markdown conversion and analytics data integration.
 *
 * Usage:
 *   npm install turndown  # HTML to Markdown converter
 *   tsx scripts/migrate-ghost-to-mdx.ts
 *
 * Decision Reference: 2025-10-12-bsbr (Content Ownership Strategy)
 * Schema Reference: .agent-os/product/blog-mdx-schema.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  ghostExportPath: path.resolve(process.env.HOME!, 'Downloads/signal-dispatch.ghost.2025-10-12-06-07-29.json'),
  analyticsPath: path.resolve(process.env.HOME!, 'Downloads/post-analytics.2025-10-12.csv'),
  outputDir: path.resolve(__dirname, '../src/content/blog'),
  dryRun: process.argv.includes('--dry-run'),
  limit: process.argv.includes('--limit')
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10)
    : undefined,
};

// ============================================================================
// Type Definitions
// ============================================================================

interface GhostPost {
  id: string;
  title: string;
  slug: string;
  html: string | null;
  plaintext: string;
  feature_image: string | null;
  featured: number;
  status: string;
  published_at: string | null;
  updated_at: string;
  custom_excerpt: string | null;
}

interface GhostTag {
  id: string;
  name: string;
  slug: string;
}

interface GhostPostTag {
  post_id: string;
  tag_id: string;
}

interface GhostAuthor {
  id: string;
  name: string;
}

interface GhostPostAuthor {
  post_id: string;
  author_id: string;
}

interface AnalyticsData {
  sends: number;
  opens: number;
  clicks: number;
  signups: number;
}

interface PostMetadata {
  post: GhostPost;
  author: string;
  tags: string[];
  analytics?: AnalyticsData;
}

// ============================================================================
// HTML to Markdown Conversion (Simple)
// ============================================================================

/**
 * Simple HTML to Markdown converter
 * For production, consider using 'turndown' library
 */
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Convert headings
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
  markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1\n\n');
  markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, '##### $1\n\n');
  markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, '###### $1\n\n');

  // Convert paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/gs, '$1\n\n');

  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');

  // Convert bold
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');

  // Convert italic
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');

  // Convert links
  markdown = markdown.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)');

  // Convert images
  markdown = markdown.replace(/<img src="(.*?)" alt="(.*?)".*?>/g, '![$2]($1)');
  markdown = markdown.replace(/<img src="(.*?)".*?>/g, '![]($1)');

  // Convert unordered lists
  markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/gs) || [];
    return items.map((item: string) => {
      const text = item.replace(/<\/?li>/g, '').trim();
      return `- ${text}`;
    }).join('\n') + '\n\n';
  });

  // Convert ordered lists
  markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/gs) || [];
    return items.map((item: string, index: number) => {
      const text = item.replace(/<\/?li>/g, '').trim();
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n\n';
  });

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gs, (match, content) => {
    return content.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
  });

  // Convert code blocks
  markdown = markdown.replace(/<pre><code.*?>(.*?)<\/code><\/pre>/gs, '```\n$1\n```\n\n');
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<\/?[^>]+(>|$)/g, '');

  // Decode HTML entities
  markdown = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
}

// ============================================================================
// Category Mapping
// ============================================================================

const TAG_TO_CATEGORY_MAP: Record<string, string> = {
  'commerce': 'Commerce',
  'ai': 'AI & Automation',
  'consulting-in-practice': 'Consulting',
  'field-notes': 'Field Notes',
  'reflection': 'Reflections',
  'meta-on-meta': 'Meta',
  'leadership': 'Leadership',
  'grid-level-thinking': 'Strategy',
  'philosophy': 'Philosophy',
  'commerce-drift': 'Commerce',
};

function deriveCategory(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_TO_CATEGORY_MAP[tag]) {
      return TAG_TO_CATEGORY_MAP[tag];
    }
  }
  return 'Insights';
}

// ============================================================================
// CSV Parsing
// ============================================================================

function parseCSV(csvPath: string): Map<string, AnalyticsData> {
  const analyticsMap = new Map<string, AnalyticsData>();

  if (!fs.existsSync(csvPath)) {
    console.warn(`Analytics CSV not found: ${csvPath}`);
    return analyticsMap;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',');
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    analyticsMap.set(row.id, {
      sends: parseInt(row.sends, 10) || 0,
      opens: parseInt(row.opens, 10) || 0,
      clicks: parseInt(row.clicks, 10) || 0,
      signups: parseInt(row.signups, 10) || 0,
    });
  }

  return analyticsMap;
}

// ============================================================================
// Ghost Data Loading
// ============================================================================

function loadGhostData(): PostMetadata[] {
  console.log(`Loading Ghost export: ${CONFIG.ghostExportPath}`);

  const ghostData = JSON.parse(fs.readFileSync(CONFIG.ghostExportPath, 'utf-8'));
  const db = ghostData.db[0].data;

  // Load analytics
  const analyticsMap = parseCSV(CONFIG.analyticsPath);

  // Build lookup maps
  const tagsById = new Map(db.tags.map((tag: GhostTag) => [tag.id, tag]));
  const authorsById = new Map(db.users.map((author: GhostAuthor) => [author.id, author]));

  // Get published posts
  const publishedPosts = db.posts.filter((post: GhostPost) => post.status === 'published');

  console.log(`Found ${publishedPosts.length} published posts`);

  // Build post metadata
  const postsMetadata: PostMetadata[] = publishedPosts.map((post: GhostPost) => {
    // Get author
    const postAuthor = db.posts_authors.find((pa: GhostPostAuthor) => pa.post_id === post.id);
    const author = postAuthor ? authorsById.get(postAuthor.author_id) : null;

    // Get tags
    const postTags = db.posts_tags
      .filter((pt: GhostPostTag) => pt.post_id === post.id)
      .map((pt: GhostPostTag) => tagsById.get(pt.tag_id))
      .filter((tag: GhostTag | undefined) => tag !== undefined)
      .map((tag: GhostTag) => tag.slug);

    // Get analytics
    const analytics = analyticsMap.get(post.id);

    return {
      post,
      author: author?.name || 'Nino Chavez',
      tags: postTags,
      analytics,
    };
  });

  // Sort by published date (newest first)
  postsMetadata.sort((a, b) => {
    const dateA = new Date(a.post.published_at || 0).getTime();
    const dateB = new Date(b.post.published_at || 0).getTime();
    return dateB - dateA;
  });

  // Apply limit if specified
  if (CONFIG.limit) {
    return postsMetadata.slice(0, CONFIG.limit);
  }

  return postsMetadata;
}

// ============================================================================
// MDX File Generation
// ============================================================================

function generateMDX(metadata: PostMetadata): string {
  const { post, author, tags, analytics } = metadata;

  // Convert HTML to Markdown
  const content = post.html ? htmlToMarkdown(post.html) : post.plaintext;

  // Build frontmatter
  const frontmatter: Record<string, any> = {
    title: post.title,
    slug: post.slug,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    author,
    status: 'published',
  };

  if (post.custom_excerpt) {
    frontmatter.excerpt = post.custom_excerpt;
  }

  if (post.featured === 1) {
    frontmatter.featured = true;
  }

  if (post.feature_image) {
    frontmatter.featureImage = post.feature_image;
  }

  if (tags.length > 0) {
    frontmatter.tags = tags;
    frontmatter.category = deriveCategory(tags);
  }

  // Add SEO metadata
  frontmatter.seo = {
    metaTitle: post.title,
    metaDescription: post.custom_excerpt || content.substring(0, 160),
  };

  if (post.feature_image) {
    frontmatter.seo.ogImage = post.feature_image;
  }

  // Add analytics if available
  if (analytics && (analytics.sends > 0 || analytics.opens > 0)) {
    frontmatter.analytics = analytics;
  }

  // Generate YAML frontmatter
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = Object.entries(value)
          .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
          .join('\n');
        return `${key}:\n${nested}`;
      } else if (Array.isArray(value)) {
        const items = value.map((item) => `  - ${item}`).join('\n');
        return `${key}:\n${items}`;
      } else {
        return `${key}: ${JSON.stringify(value)}`;
      }
    })
    .join('\n');

  return `---\n${yaml}\n---\n\n${content}\n`;
}

// ============================================================================
// File Writing
// ============================================================================

function writePost(metadata: PostMetadata): void {
  const { post } = metadata;
  const mdxContent = generateMDX(metadata);
  const filename = `${post.slug}.mdx`;
  const filepath = path.join(CONFIG.outputDir, filename);

  if (CONFIG.dryRun) {
    console.log(`[DRY RUN] Would write: ${filepath}`);
    console.log(`Preview (first 200 chars):\n${mdxContent.substring(0, 200)}...\n`);
    return;
  }

  fs.writeFileSync(filepath, mdxContent, 'utf-8');
  console.log(`✓ Written: ${filename}`);
}

// ============================================================================
// Main Migration Function
// ============================================================================

function migrate(): void {
  console.log('==========================================');
  console.log('Ghost CMS to MDX Migration');
  console.log('==========================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`Created output directory: ${CONFIG.outputDir}\n`);
  }

  // Load Ghost data
  const postsMetadata = loadGhostData();

  console.log(`\nMigrating ${postsMetadata.length} posts...`);
  if (CONFIG.dryRun) {
    console.log('(DRY RUN MODE - No files will be written)\n');
  }

  // Migrate posts
  let successCount = 0;
  let errorCount = 0;

  for (const metadata of postsMetadata) {
    try {
      writePost(metadata);
      successCount++;
    } catch (error) {
      console.error(`✗ Error migrating "${metadata.post.title}":`, error);
      errorCount++;
    }
  }

  // Summary
  console.log('\n==========================================');
  console.log('Migration Complete');
  console.log('==========================================');
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log(`Total: ${postsMetadata.length}`);

  if (CONFIG.dryRun) {
    console.log('\nRun without --dry-run to write files.');
  } else {
    console.log(`\nOutput directory: ${CONFIG.outputDir}`);
  }
}

// ============================================================================
// Run Migration
// ============================================================================

migrate();
