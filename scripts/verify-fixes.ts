#!/usr/bin/env tsx

import { chromium } from 'playwright';
import { join } from 'path';

const BLOG_URL = 'http://localhost:5174';
const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots', 'audit');

const postsToVerify = [
  'the-tax-of-many-hats',
  'the-elitist-trap'
];

async function main() {
  console.log('🔍 Verifying fixed posts...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const slug of postsToVerify) {
    try {
      console.log(`📸 Capturing: ${slug}`);

      // Navigate to blog index
      await page.goto(BLOG_URL, { waitUntil: 'networkidle' });

      // Click on the post
      await page.click(`[data-slug="${slug}"]`);

      // Wait for content to load
      await page.waitForSelector('article', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // Take screenshot
      const screenshotPath = join(SCREENSHOTS_DIR, `${slug}-FIXED.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`   ✅ Saved to: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  await browser.close();
  console.log('✅ Verification complete!');
}

main().catch(console.error);
