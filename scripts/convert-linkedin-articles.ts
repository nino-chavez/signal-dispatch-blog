/**
 * LinkedIn Articles to MDX Converter
 * 
 * Converts exported LinkedIn articles (HTML) to MDX format for blog integration.
 * 
 * Usage:
 *   npx tsx scripts/convert-linkedin-articles.ts
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { parse } from 'node-html-parser';
import path from 'path';
import TurndownService from 'turndown';

interface LinkedInArticle {
  slug: string;
  title: string;
  publishedAt: string;
  createdAt: string;
  linkedinUrl: string;
  excerpt: string;
  content: string;
  category?: string;
  tags?: string[];
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Customize turndown rules for better markdown conversion
turndownService.addRule('preserveStrongCode', {
  filter: ['strong', 'em', 'code'],
  replacement: (content: string, node: any) => {
    const tag = node.nodeName.toLowerCase();
    if (tag === 'strong' || tag === 'b') return `**${content}**`;
    if (tag === 'em' || tag === 'i') return `*${content}*`;
    if (tag === 'code') return `\`${content}\``;
    return content;
  },
});

/**
 * Generate a URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Trim hyphens from start/end
    .slice(0, 100); // Max 100 chars
}

/**
 * Extract first paragraph as excerpt
 */
function extractExcerpt(html: string): string {
  const firstP = parse(html).querySelector('p');
  const text = firstP?.text.trim() || '';
  
  // Limit to ~150-200 characters
  if (text.length <= 200) return text;
  
  const truncated = text.slice(0, 197);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Parse LinkedIn HTML article
 */
function parseLinkedInArticle(htmlPath: string): LinkedInArticle | null {
  try {
    const html = readFileSync(htmlPath, 'utf-8');
    const root = parse(html);

    // Extract title
    const titleElement = root.querySelector('h1');
    const title = titleElement?.text.trim() || 'Untitled';
    
    // Extract LinkedIn URL
    const linkedinUrl = titleElement?.querySelector('a')?.getAttribute('href') || '';
    
    // Extract dates
    const publishedText = root.querySelector('.published')?.text || '';
    const createdText = root.querySelector('.created')?.text || '';
    
    const publishedMatch = publishedText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
    const createdMatch = createdText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
    
    const publishedAt = publishedMatch 
      ? new Date(publishedMatch[1].replace(' ', 'T')).toISOString()
      : new Date().toISOString();
    
    const createdAt = createdMatch
      ? new Date(createdMatch[1].replace(' ', 'T')).toISOString()
      : publishedAt;

    // Extract content
    const contentDiv = root.querySelector('body > div');
    const contentHtml = contentDiv?.innerHTML || '';
    
    if (!contentHtml) {
      console.warn(`⚠️  No content found in ${path.basename(htmlPath)}`);
      return null;
    }

    // Convert HTML to Markdown
    const contentMarkdown = turndownService.turndown(contentHtml);
    
    // Extract excerpt from content
    const excerpt = extractExcerpt(contentHtml);
    
    // Generate slug
    const slug = generateSlug(title);

    return {
      slug,
      title,
      publishedAt,
      createdAt,
      linkedinUrl,
      excerpt,
      content: contentMarkdown,
    };
  } catch (error) {
    console.error(`❌ Error parsing ${htmlPath}:`, error);
    return null;
  }
}

/**
 * Infer category from title and content (basic keyword matching)
 * TODO: Can be enhanced with AI-powered categorization
 */
function inferCategory(title: string, content: string): string {
  const text = (title + ' ' + content).toLowerCase();
  
  // Category keywords mapping
  const categoryMap: Record<string, string[]> = {
    'AI & Automation': ['ai', 'genai', 'llm', 'copilot', 'claude', 'gpt', 'agent', 'automation', 'machine learning'],
    'Commerce': ['commerce', 'ecommerce', 'storefront', 'shopping', 'retail', 'merchant'],
    'Consulting': ['consultant', 'consulting', 'client', 'project management'],
    'Leadership': ['leadership', 'team', 'management', 'culture', 'hiring'],
    'Reflections': ['journey', 'experience', 'learned', 'mistake', 'lesson', 'reflection'],
    'Meta': ['framework', 'architecture', 'system design', 'infrastructure', 'devops'],
  };

  // Score each category
  const scores: Record<string, number> = {};
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    scores[category] = keywords.reduce((score, keyword) => {
      const matches = (text.match(new RegExp(keyword, 'gi')) || []).length;
      return score + matches;
    }, 0);
  }

  // Return category with highest score, default to 'Reflections'
  const bestCategory = Object.entries(scores).reduce((best, [cat, score]) => 
    score > best[1] ? [cat, score] : best,
    ['Reflections', 0]
  )[0];

  return bestCategory;
}

/**
 * Infer tags from content (extract key technical terms)
 */
function inferTags(title: string, content: string): string[] {
  const text = (title + ' ' + content).toLowerCase();
  
  const commonTags = [
    'ai-workflows',
    'personal-growth',
    'systems-thinking',
    'commerce-strategy',
    'consulting-practice',
    'leadership',
    'architecture',
    'devops',
    'testing',
    'ai-coding',
  ];

  // Return tags that appear in content
  return commonTags.filter(tag => {
    const searchTerm = tag.replace('-', ' ');
    return text.includes(searchTerm);
  }).slice(0, 4); // Max 4 tags
}

/**
 * Generate MDX file content
 */
function generateMDX(article: LinkedInArticle): string {
  const { slug, title, publishedAt, excerpt, linkedinUrl, content, category, tags } = article;
  
  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
publishedAt: "${publishedAt}"
author: "Nino Chavez"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
category: "${category || 'Reflections'}"
tags: ${JSON.stringify(tags || [])}
featured: false
source: "linkedin"
linkedinUrl: "${linkedinUrl}"
---

`;

  return frontmatter + content;
}

/**
 * Main conversion function
 */
async function convertLinkedInArticles() {
  const inputDir = '/Users/nino/Downloads/Basic_LinkedInDataExport_10-06-2025.zip/Articles/Articles';
  const outputDir = path.join(process.cwd(), 'src/content/blog');

  console.log('🔄 Converting LinkedIn articles to MDX...\n');

  const files = readdirSync(inputDir).filter(f => f.endsWith('.html'));
  
  console.log(`📁 Found ${files.length} HTML files\n`);

  let converted = 0;
  let skipped = 0;
  const results: { slug: string; title: string; category: string }[] = [];

  for (const file of files) {
    const htmlPath = path.join(inputDir, file);
    
    console.log(`📄 Processing: ${file}`);
    
    const article = parseLinkedInArticle(htmlPath);
    
    if (!article) {
      console.log(`   ⏭️  Skipped (no content)\n`);
      skipped++;
      continue;
    }

    // Infer metadata
    article.category = inferCategory(article.title, article.content);
    article.tags = inferTags(article.title, article.content);

    // Check if file already exists
    const outputPath = path.join(outputDir, `${article.slug}.mdx`);
    
    try {
      const existingContent = readFileSync(outputPath, 'utf-8');
      if (existingContent && !existingContent.includes('source: "linkedin"')) {
        console.log(`   ⚠️  File exists (from Ghost): ${article.slug}.mdx`);
        console.log(`   💡 Consider renaming: ${article.slug}-linkedin.mdx\n`);
        skipped++;
        continue;
      }
    } catch {
      // File doesn't exist, proceed with creation
    }

    // Generate MDX
    const mdxContent = generateMDX(article);
    
    // Write file
    writeFileSync(outputPath, mdxContent, 'utf-8');
    
    console.log(`   ✅ Created: ${article.slug}.mdx`);
    console.log(`   📁 Category: ${article.category}`);
    console.log(`   🏷️  Tags: ${article.tags?.join(', ') || 'none'}\n`);
    
    converted++;
    results.push({
      slug: article.slug,
      title: article.title,
      category: article.category || 'Reflections',
    });
  }

  console.log('\n📊 Conversion Summary:');
  console.log(`   ✅ Converted: ${converted}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📝 Total: ${files.length}\n`);

  if (results.length > 0) {
    console.log('📋 Converted Articles:');
    results.forEach(({ title, category, slug }) => {
      console.log(`   • ${title}`);
      console.log(`     Category: ${category} | Slug: ${slug}`);
    });
  }

  console.log('\n✨ Next steps:');
  console.log('   1. Review generated MDX files in src/content/blog/');
  console.log('   2. Manually adjust categories/tags/excerpts if needed');
  console.log('   3. Run: npm run generate-manifest');
  console.log('   4. Test the blog to see new articles\n');
}

// Run conversion
convertLinkedInArticles().catch(console.error);
