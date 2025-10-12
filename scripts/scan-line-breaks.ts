#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const contentDir = join(process.cwd(), 'src', 'content', 'blog');

interface Issue {
  file: string;
  lineNumber: number;
  heading: string;
  nextLine: string;
}

const issues: Issue[] = [];

function scanFile(filename: string) {
  const filePath = join(contentDir, filename);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    // Check if current line is a heading (## or ###)
    const isHeading = /^#{2,3}\s+/.test(currentLine);

    // Check if next line is not blank and not another heading
    const nextLineIsContent = nextLine.trim() !== '' && !/^#{2,3}\s+/.test(nextLine) && !nextLine.startsWith('---');

    if (isHeading && nextLineIsContent) {
      issues.push({
        file: filename,
        lineNumber: i + 1,
        heading: currentLine.substring(0, 60),
        nextLine: nextLine.substring(0, 60)
      });
    }
  }
}

// Scan all MDX files
const files = readdirSync(contentDir).filter(f => f.endsWith('.mdx'));

console.log(`Scanning ${files.length} blog posts for line break issues...\n`);

files.forEach(scanFile);

if (issues.length === 0) {
  console.log('✅ No line break issues found!');
} else {
  console.log(`Found ${issues.length} line break issues:\n`);

  const fileGroups = new Map<string, Issue[]>();
  issues.forEach(issue => {
    if (!fileGroups.has(issue.file)) {
      fileGroups.set(issue.file, []);
    }
    fileGroups.get(issue.file)!.push(issue);
  });

  fileGroups.forEach((fileIssues, file) => {
    console.log(`\n📄 ${file} (${fileIssues.length} issues)`);
    fileIssues.forEach(issue => {
      console.log(`   Line ${issue.lineNumber}: ${issue.heading}`);
      console.log(`              → ${issue.nextLine}`);
    });
  });

  console.log(`\n\nTotal: ${issues.length} issues across ${fileGroups.size} files`);
}
