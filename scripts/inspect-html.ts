#!/usr/bin/env tsx

import { chromium } from 'playwright';

const BLOG_URL = 'http://localhost:5174';
const POST_SLUG = 'genai-os';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Go to blog and click post
  await page.goto(BLOG_URL, { waitUntil: 'networkidle' });
  await page.click(`[data-slug="${POST_SLUG}"]`);
  await page.waitForSelector('article', { timeout: 10000 });

  // Get the prose container HTML
  const proseHTML = await page.evaluate(() => {
    const proseDiv = document.querySelector('.prose');
    return proseDiv ? proseDiv.innerHTML.substring(0, 2000) : 'NOT FOUND';
  });

  console.log('=== RENDERED HTML (first 2000 chars) ===');
  console.log(proseHTML);

  await browser.close();
}

main().catch(console.error);
