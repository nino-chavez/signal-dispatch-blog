#!/usr/bin/env tsx
/**
 * Local Blog Post Creator
 * 
 * Simple script to create MDX blog posts from Gemini content
 * Run: npm run create-post
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeYamlString(str: string): string {
  // If string contains quotes, escape them properly for YAML
  if (str.includes('"')) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  return `"${str}"`;
}

async function main() {
  console.log('📝 Signal Dispatch Blog Post Creator\n');

  // Get metadata
  const title = await question('Title: ');
  const category = await question('Category (AI & Automation, Consulting, Architecture, etc.): ');
  const tags = await question('Tags (comma-separated): ');
  const featured = await question('Featured? (y/n): ');
  const source = await question('Source (gemini/linkedin/original): ');
  const sourceUrl = await question('Source URL (optional, press enter to skip): ');

  console.log('\n📄 Paste your content (press Ctrl+D when done):\n');

  // Read content from stdin
  const contentLines: string[] = [];
  const contentRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  for await (const line of contentRl) {
    contentLines.push(line);
  }
  
  const content = contentLines.join('\n').trim();

  if (!content) {
    console.error('❌ No content provided');
    process.exit(1);
  }

  // Generate excerpt (first 200 chars)
  const excerpt = content.substring(0, 200).replace(/\n/g, ' ').trim() + '...';

  // Generate frontmatter
  const frontmatter = `---
title: ${escapeYamlString(title)}
publishedAt: "${new Date().toISOString()}"
author: "Nino Chavez"
excerpt: ${escapeYamlString(excerpt)}
category: "${category}"
tags: [${tags.split(',').map(t => `"${t.trim()}"`).join(', ')}]
featured: ${featured.toLowerCase() === 'y' || featured.toLowerCase() === 'yes'}
source: "${source}"${sourceUrl ? `\nsourceUrl: "${sourceUrl}"` : ''}
---`;

  // Create full MDX content
  const mdxContent = `${frontmatter}\n\n${content}`;

  // Generate filename
  const slug = generateSlug(title);
  const filename = `${slug}.mdx`;
  const filepath = path.join(process.cwd(), 'src', 'content', 'blog', filename);

  // Write file
  await fs.writeFile(filepath, mdxContent, 'utf-8');

  console.log('\n✅ Blog post created successfully!');
  console.log(`   File: src/content/blog/${filename}`);
  console.log(`   Slug: ${slug}`);
  console.log('\n📦 Next steps:');
  console.log('   1. Review the file in VS Code');
  console.log('   2. git add src/content/blog/' + filename);
  console.log('   3. git commit -m "Add new blog post"');
  console.log('   4. git push');
  
  rl.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});