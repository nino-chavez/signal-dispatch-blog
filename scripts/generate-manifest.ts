#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlogPostMetadata {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  author?: string;
  readTime?: string;
  featureImage?: string;
  source?: 'ghost' | 'linkedin' | 'medium' | 'devto';
  linkedinUrl?: string;
  externalUrl?: string;
}

interface BlogManifest {
  posts: BlogPostMetadata[];
  categories: string[];
  tags: string[];
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  totalPosts: number;
  lastGenerated: string;
}

async function generateManifest() {
  console.log('🔨 Generating blog manifest...');

  const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'blog-manifest.json');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all MDX files
  const files = fs.readdirSync(contentDir).filter((file) => file.endsWith('.mdx'));

  console.log(`📄 Found ${files.length} MDX files`);

  const posts: BlogPostMetadata[] = [];
  const categorySet = new Set<string>();
  const tagSet = new Set<string>();
  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter } = matter(fileContent);

    const slug = file.replace('.mdx', '');

    // Validate required fields
    if (!frontmatter.title || !frontmatter.publishedAt) {
      console.warn(`⚠️  Skipping ${slug}: missing required fields (title or publishedAt)`);
      continue;
    }

    // Extract metadata
    const post: BlogPostMetadata = {
      slug,
      title: frontmatter.title,
      publishedAt: frontmatter.publishedAt,
      excerpt: frontmatter.excerpt,
      category: frontmatter.category,
      tags: frontmatter.tags || [],
      featured: frontmatter.featured || false,
      author: frontmatter.author,
      readTime: frontmatter.readTime,
      featureImage: frontmatter.featureImage,
      source: frontmatter.source,
      linkedinUrl: frontmatter.linkedinUrl,
      externalUrl: frontmatter.externalUrl,
    };

    posts.push(post);

    // Index categories
    if (post.category) {
      categorySet.add(post.category);
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    }

    // Index tags
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagSet.add(tag);
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  }

  // Sort posts by publishedAt (newest first)
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Sort categories and tags alphabetically
  const categories = Array.from(categorySet).sort();
  const tags = Array.from(tagSet).sort();

  const manifest: BlogManifest = {
    posts,
    categories,
    tags,
    categoryCounts,
    tagCounts,
    totalPosts: posts.length,
    lastGenerated: new Date().toISOString(),
  };

  // Write manifest to file
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`✅ Manifest generated successfully!`);
  console.log(`   📊 ${posts.length} posts`);
  console.log(`   🏷️  ${categories.length} categories`);
  console.log(`   🔖 ${tags.length} tags`);
  console.log(`   💾 Saved to: ${path.relative(process.cwd(), outputPath)}`);
}

generateManifest().catch((error) => {
  console.error('❌ Error generating manifest:', error);
  process.exit(1);
});
