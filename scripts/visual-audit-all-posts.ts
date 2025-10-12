#!/usr/bin/env tsx

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BLOG_URL = 'http://localhost:5174';
const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots', 'audit');
const MANIFEST_PATH = join(process.cwd(), 'src', 'data', 'blog-manifest.json');

interface Post {
  slug: string;
  title: string;
}

interface Manifest {
  posts: Post[];
}

async function main() {
  // Create screenshots directory
  if (!existsSync(SCREENSHOTS_DIR)) {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Load manifest
  const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log(`📋 Found ${manifest.posts.length} posts to audit\n`);

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ slug: string; error: string }> = [];

  // Navigate to each post and screenshot
  for (let i = 0; i < manifest.posts.length; i++) {
    const post = manifest.posts[i];
    const progress = `[${i + 1}/${manifest.posts.length}]`;

    try {
      console.log(`${progress} Capturing: ${post.slug}`);

      // Navigate to post (simulating clicking from blog list)
      await page.goto(BLOG_URL, { waitUntil: 'networkidle' });

      // Click on the post card to navigate to detail
      await page.click(`[data-slug="${post.slug}"]`);

      // Wait for post content to load
      await page.waitForSelector('article', { timeout: 10000 });

      // Wait for any images to load
      await page.waitForTimeout(1000);

      // Take full page screenshot
      const screenshotPath = join(SCREENSHOTS_DIR, `${post.slug}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      successCount++;
    } catch (error) {
      console.error(`${progress} ❌ Failed: ${post.slug}`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
      errors.push({
        slug: post.slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await browser.close();

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Successfully captured: ${successCount} posts`);
  console.log(`❌ Failed: ${errorCount} posts`);
  console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(({ slug, error }) => {
      console.log(`   ${slug}: ${error}`);
    });
  }
}

main().catch(console.error);
