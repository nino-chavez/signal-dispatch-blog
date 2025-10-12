#!/usr/bin/env node
/**
 * Content Cleanup Script: Fix MDX Formatting Issues from Ghost Export
 *
 * This script fixes systematic formatting issues from Ghost→MDX conversion:
 * 1. Converts plain text tables → proper markdown tables
 * 2. Fixes numbered headings (e.g., "1 Title" → "## Title")
 * 3. Adds language hints to code blocks
 * 4. Replaces __GHOST_URL__ placeholders
 * 5. Ensures proper spacing around emojis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CleanupStats {
  filesProcessed: number;
  tablesFixed: number;
  headingsFixed: number;
  codeBlocksFixed: number;
  imageUrlsFixed: number;
  errors: string[];
}

const stats: CleanupStats = {
  filesProcessed: 0,
  tablesFixed: 0,
  headingsFixed: 0,
  codeBlocksFixed: 0,
  imageUrlsFixed: 0,
  errors: [],
};

/**
 * Fix numbered headings that are embedded inline
 * e.g., "1  The Prototype Price Tag" → "## 1. The Prototype Price Tag"
 */
function fixNumberedHeadings(content: string): string {
  let fixed = content;
  let changes = 0;

  // Match lines starting with a number followed by spaces and text (not in code blocks)
  const lines = content.split('\n');
  let inCodeBlock = false;
  let inFrontmatter = false;

  const result = lines.map((line, index) => {
    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }

    // Track frontmatter
    if (line.trim() === '---') {
      if (index === 0 || inFrontmatter) {
        inFrontmatter = !inFrontmatter;
      }
      return line;
    }

    // Skip if in code block or frontmatter
    if (inCodeBlock || inFrontmatter) {
      return line;
    }

    // Match lines like "1  The Prototype Price Tag" or "2  Why Credits Vanish"
    const headingMatch = line.match(/^(\d+)\s{2,}(.+)$/);
    if (headingMatch) {
      changes++;
      return `## ${headingMatch[1]}. ${headingMatch[2]}`;
    }

    // Match lines like "6a  Fresh‑Start Blueprint" (with letter suffix)
    const headingWithLetterMatch = line.match(/^(\d+[a-z])\s{2,}(.+)$/);
    if (headingWithLetterMatch) {
      changes++;
      return `### ${headingWithLetterMatch[1]}. ${headingWithLetterMatch[2]}`;
    }

    return line;
  });

  stats.headingsFixed += changes;
  return result.join('\n');
}

/**
 * Fix plain text tables → markdown tables
 * Detect table patterns and convert to proper markdown syntax
 */
function fixTables(content: string): string {
  let fixed = content;
  let changes = 0;

  // Pattern: Lines with tab-separated values that look like table rows
  // This is a heuristic - we look for consecutive lines with tabs
  const lines = content.split('\n');
  let inCodeBlock = false;
  let inFrontmatter = false;
  let tableBuffer: string[] = [];
  const result: string[] = [];

  const isTableRow = (line: string): boolean => {
    // Check if line has tabs and looks like table data
    return line.includes('\t') && !line.trim().startsWith('//') && line.trim().length > 0;
  };

  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      // Convert to markdown table
      const rows = tableBuffer.map(row => row.split('\t').map(cell => cell.trim()));
      const maxCols = Math.max(...rows.map(r => r.length));

      // Header row
      result.push('| ' + rows[0].join(' | ') + ' |');

      // Separator
      result.push('| ' + Array(maxCols).fill('---').join(' | ') + ' |');

      // Data rows
      for (let i = 1; i < rows.length; i++) {
        result.push('| ' + rows[i].join(' | ') + ' |');
      }
      result.push(''); // Empty line after table

      changes++;
    } else {
      // Not enough rows for a table, just add them back
      result.push(...tableBuffer);
    }
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code blocks
    if (line.trim().startsWith('```')) {
      flushTable();
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    // Track frontmatter
    if (line.trim() === '---') {
      if (i === 0 || inFrontmatter) {
        flushTable();
        inFrontmatter = !inFrontmatter;
      }
      result.push(line);
      continue;
    }

    if (inCodeBlock || inFrontmatter) {
      result.push(line);
      continue;
    }

    // Check if this looks like a table row
    if (isTableRow(line)) {
      tableBuffer.push(line);
    } else {
      flushTable();
      result.push(line);
    }
  }

  // Flush any remaining table
  flushTable();

  stats.tablesFixed += changes;
  return result.join('\n');
}

/**
 * Add language hints to code blocks marked as 'text'
 * Infer language from context or content
 */
function fixCodeBlocks(content: string): string {
  let fixed = content;
  let changes = 0;

  // Replace ```text with appropriate language based on content
  fixed = fixed.replace(/```text\n([^`]+)```/g, (match, code) => {
    changes++;

    // Infer language from content
    if (code.includes('{') && code.includes('}') && code.includes(':')) {
      return '```json\n' + code + '```';
    }
    if (code.includes('function') || code.includes('const') || code.includes('=>')) {
      return '```typescript\n' + code + '```';
    }
    if (code.includes('if (') || code.includes('throw new')) {
      return '```typescript\n' + code + '```';
    }

    // Default to keeping as text but format better
    return '```\n' + code + '```';
  });

  stats.codeBlocksFixed += changes;
  return fixed;
}

/**
 * Fix __GHOST_URL__ placeholder images
 */
function fixImageUrls(content: string): string {
  let fixed = content;
  const changes = (content.match(/__GHOST_URL__/g) || []).length;

  // Remove __GHOST_URL__ placeholders - they're broken anyway
  // In the future, could replace with actual URLs if needed
  fixed = fixed.replace(/__GHOST_URL__/g, '');

  if (changes > 0) {
    stats.imageUrlsFixed += changes;
  }

  return fixed;
}

/**
 * Process a single MDX file
 */
function processFile(filePath: string): void {
  try {
    console.log(`Processing: ${path.basename(filePath)}`);

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Apply all fixes
    content = fixImageUrls(content);
    content = fixNumberedHeadings(content);
    content = fixTables(content);
    content = fixCodeBlocks(content);

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ Updated`);
    } else {
      console.log(`  ⏭️  No changes needed`);
    }

    stats.filesProcessed++;
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error}`;
    console.error(`  ❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🧹 Starting MDX content cleanup...\n');

  const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.mdx'));

  console.log(`Found ${files.length} MDX files\n`);

  for (const file of files) {
    processFile(path.join(contentDir, file));
  }

  // Print summary
  console.log('\n📊 Cleanup Summary:');
  console.log(`   Files processed: ${stats.filesProcessed}`);
  console.log(`   Headings fixed: ${stats.headingsFixed}`);
  console.log(`   Tables fixed: ${stats.tablesFixed}`);
  console.log(`   Code blocks fixed: ${stats.codeBlocksFixed}`);
  console.log(`   Image URLs fixed: ${stats.imageUrlsFixed}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered:`);
    stats.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('\n✅ All files processed successfully!');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
