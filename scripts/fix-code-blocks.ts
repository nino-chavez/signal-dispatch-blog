/**
 * Fix MDX Code Blocks
 *
 * Adds language specifiers to code blocks that don't have them.
 * This is necessary for MDX parser compatibility.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.resolve(__dirname, '../src/content/blog');

function detectLanguage(firstLine: string): string {
  // Trim the first line
  const trimmed = firstLine.trim();

  // JSON detection
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // YAML detection
  if (/^[a-zA-Z_]+\s*:/.test(trimmed)) {
    return 'yaml';
  }

  // Bash/shell detection
  if (trimmed.startsWith('$') || trimmed.startsWith('#!')) {
    return 'bash';
  }

  // Default to text for diagrams and other content
  return 'text';
}

function fixCodeBlocks(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this is a code block opener without a language tag
    if (line === '```' && i + 1 < lines.length) {
      const nextLine = lines[i + 1];

      // Skip if it's the closing marker
      if (nextLine?.trim() === '```' || nextLine?.trim() === '') {
        result.push(line);
        i++;
        continue;
      }

      // Detect language from first line of code
      const language = detectLanguage(nextLine);
      result.push(`\`\`\`${language}`);
      i++;
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

async function main() {
  const files = fs.readdirSync(CONTENT_DIR);
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

  console.log(`Found ${mdxFiles.length} MDX files`);

  let fixed = 0;
  let errors = 0;

  for (const file of mdxFiles) {
    try {
      const filePath = path.join(CONTENT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check if file has code blocks without language tags
      if (content.includes('\n```\n{') || content.includes('\n```\n[') || content.match(/\n```\n[a-zA-Z]/)) {
        const fixedContent = fixCodeBlocks(content);
        fs.writeFileSync(filePath, fixedContent, 'utf-8');
        console.log(`✓ Fixed: ${file}`);
        fixed++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error);
      errors++;
    }
  }

  console.log(`\n==========================================`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Errors: ${errors}`);
  console.log(`==========================================`);
}

main().catch(console.error);
