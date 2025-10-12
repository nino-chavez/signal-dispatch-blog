#!/usr/bin/env tsx

import { chromium } from 'playwright';

const BLOG_URL = 'http://localhost:5174';
const POST_SLUG = process.argv[2] || 'genai-os';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Go to blog index
  await page.goto(BLOG_URL, { waitUntil: 'networkidle' });

  // Click the post
  await page.click(`[data-slug="${POST_SLUG}"]`);

  // Wait for content
  await page.waitForSelector('article', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Screenshot
  await page.screenshot({
    path: `apps/blog/screenshots/audit/${POST_SLUG}-after-fix.png`,
    fullPage: true,
  });

  console.log(`✅ Screenshot saved: ${POST_SLUG}-after-fix.png`);

  await browser.close();
}

main().catch(console.error);
