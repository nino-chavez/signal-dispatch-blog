/**
 * GitHub Action Script: Generate Blog Post from Issue
 *
 * This script:
 * 1. Parses GitHub issue body (YAML form data)
 * 2. Calls Claude API to format content as MDX
 * 3. Writes MDX file to src/content/blog/
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parse GitHub issue form data
 * Format: ### Label\n\nValue\n\n
 */
function parseIssueBody(body) {
  const fields = {};

  // Split by ### headers
  const sections = body.split('###').filter(s => s.trim());

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const label = lines[0].trim();
    const value = lines.slice(1).join('\n').trim();

    // Clean up checkbox values
    const cleanValue = value
      .replace(/^-\s+\[x\]/gmi, '')
      .replace(/^-\s+\[\s+\]/gmi, '')
      .trim();

    // Map label to field name
    const fieldMap = {
      'Post Title': 'title',
      'Category': 'category',
      'Tags': 'tags',
      'Featured Post?': 'featured',
      'Source': 'source',
      'Source URL (optional)': 'sourceUrl',
      'Content': 'content',
    };

    const fieldName = fieldMap[label];
    if (fieldName && cleanValue) {
      fields[fieldName] = cleanValue;
    }
  }

  return fields;
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Call Claude API to format content as MDX with frontmatter
 */
async function generateMDX(fields) {
  const prompt = `You are a blog content formatter for Signal Dispatch, a technical blog about AI, architecture, and consulting.

Given the following content and metadata, generate a complete MDX blog post with proper frontmatter.

**Metadata:**
- Title: ${fields.title}
- Category: ${fields.category}
- Tags: ${fields.tags}
- Featured: ${fields.featured === 'Yes' ? 'true' : 'false'}
- Source: ${fields.source}
${fields.sourceUrl ? `- Source URL: ${fields.sourceUrl}` : ''}

**Content:**
${fields.content}

**Requirements:**

1. Generate frontmatter in this exact format:
\`\`\`
---
title: "exact title"
publishedAt: "${new Date().toISOString()}"
author: "Nino Chavez"
excerpt: "First 2-3 sentences from content, max 200 characters"
category: "${fields.category}"
tags: [${fields.tags.split(',').map(t => `"${t.trim()}"`).join(', ')}]
featured: ${fields.featured === 'Yes' ? 'true' : 'false'}
source: "${fields.source}"
${fields.sourceUrl ? `sourceUrl: "${fields.sourceUrl}"` : ''}
---
\`\`\`

2. Format the content:
   - Use ### for main headings (not ## or #)
   - Use #### for subheadings
   - Preserve markdown formatting (bold, italic, lists, code blocks)
   - Keep paragraphs well-spaced
   - Ensure code blocks have language identifiers

3. The excerpt should be compelling and capture the hook of the article

4. Do NOT add any commentary or explanations, just output the complete MDX file

Generate the complete MDX file now:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const mdxContent = message.content[0].text;

  // Clean up if Claude wrapped it in markdown code blocks
  return mdxContent
    .replace(/^```mdx?\n/i, '')
    .replace(/^```\n/i, '')
    .replace(/\n```$/i, '')
    .trim();
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('📝 Parsing issue body...');
    const issueBody = process.env.ISSUE_BODY;
    const fields = parseIssueBody(issueBody);

    console.log('Parsed fields:', JSON.stringify(fields, null, 2));

    // Validate required fields
    const required = ['title', 'category', 'tags', 'content'];
    const missing = required.filter(f => !fields[f]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    console.log('🤖 Calling Claude API to generate MDX...');
    const mdxContent = await generateMDX(fields);

    console.log('✅ MDX generated successfully');

    // Generate filename
    const slug = generateSlug(fields.title);
    const filename = `${slug}.mdx`;
    const filepath = path.join(process.cwd(), 'src', 'content', 'blog', filename);

    console.log(`📄 Writing to ${filepath}...`);
    await fs.writeFile(filepath, mdxContent, 'utf-8');

    console.log('✅ Blog post file created successfully!');
    console.log(`   File: src/content/blog/${filename}`);
    console.log(`   Slug: ${slug}`);

  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
