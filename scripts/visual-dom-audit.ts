import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function auditBlogVisuals() {
  console.log('🚀 Starting visual DOM audit...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to blog
    console.log('📍 Navigating to localhost:3100...');
    await page.goto('http://localhost:3100', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for animations

    // Capture full page screenshot
    console.log('📸 Capturing full page screenshot...');
    await page.screenshot({
      path: join(process.cwd(), 'screenshots/blog-homepage-full.png'),
      fullPage: true,
    });

    // Capture above-the-fold
    console.log('📸 Capturing above-the-fold screenshot...');
    await page.screenshot({
      path: join(process.cwd(), 'screenshots/blog-homepage-hero.png'),
    });

    // Inspect hero section
    console.log('\n🔍 INSPECTING HERO SECTION:');
    const heroSection = await page.locator('section').first();
    const heroHTML = await heroSection.innerHTML();
    console.log('Hero HTML:', heroHTML.substring(0, 500));

    // Check for signal bars
    const signalBars = await page.locator('.flex.gap-1').count();
    console.log(`\n📊 Signal bars container found: ${signalBars > 0 ? '✅ YES' : '❌ NO'}`);

    if (signalBars > 0) {
      const barCount = await page.locator('.flex.gap-1 > div').count();
      console.log(`   Number of signal bars: ${barCount}`);

      // Get computed styles of first bar
      const firstBar = page.locator('.flex.gap-1 > div').first();
      const barStyles = await firstBar.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          width: computed.width,
          height: computed.height,
          background: computed.background,
          borderRadius: computed.borderRadius,
        };
      });
      console.log('   First bar styles:', barStyles);
    }

    // Inspect search bar
    console.log('\n🔍 INSPECTING SEARCH BAR:');
    const searchInput = await page.locator('input[aria-label="Search blog posts"]');
    const searchExists = await searchInput.count() > 0;
    console.log(`Search input found: ${searchExists ? '✅ YES' : '❌ NO'}`);

    if (searchExists) {
      const searchStyles = await searchInput.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const parent = el.closest('div');
        const parentComputed = parent ? window.getComputedStyle(parent) : null;
        return {
          input: {
            background: computed.backgroundColor,
            color: computed.color,
            padding: computed.padding,
          },
          container: parentComputed ? {
            background: parentComputed.backgroundColor,
            border: parentComputed.border,
            borderRadius: parentComputed.borderRadius,
          } : null,
        };
      });
      console.log('Search bar styles:', JSON.stringify(searchStyles, null, 2));
    }

    // Inspect category filters
    console.log('\n🔍 INSPECTING CATEGORY FILTERS:');
    const filterSection = await page.locator('section').nth(1);
    const hasFilterText = await filterSection.locator('text=Filter:').count() > 0;
    console.log(`"Filter:" label found: ${hasFilterText ? '✅ YES' : '❌ NO'}`);

    // Count category buttons
    const categoryButtons = await page.locator('button:has-text("All Posts"), button:has-text("AI & Automation"), button:has-text("Commerce"), button:has-text("Consulting")');
    const buttonCount = await categoryButtons.count();
    console.log(`Category buttons found: ${buttonCount}`);

    // Get styles of category buttons
    if (buttonCount > 0) {
      const allPostsButton = page.locator('button:has-text("All Posts")').first();
      const allPostsStyles = await allPostsButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          background: computed.background,
          color: computed.color,
          padding: computed.padding,
          minHeight: computed.minHeight,
          borderRadius: computed.borderRadius,
          border: computed.border,
        };
      });
      console.log('\n"All Posts" button styles:', JSON.stringify(allPostsStyles, null, 2));

      // Check AI & Automation button for category colors
      const aiButton = page.locator('button:has-text("AI & Automation")').first();
      if (await aiButton.count() > 0) {
        const aiStyles = await aiButton.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            background: computed.background,
            color: computed.color,
            border: computed.border,
          };
        });
        console.log('\n"AI & Automation" button styles:', JSON.stringify(aiStyles, null, 2));
      }
    }

    // Inspect featured posts
    console.log('\n🔍 INSPECTING FEATURED POSTS:');
    const featuredSection = await page.locator('h2:has-text("Featured")').first();
    const hasFeatured = await featuredSection.count() > 0;
    console.log(`"Featured" section found: ${hasFeatured ? '✅ YES' : '❌ NO'}`);

    if (hasFeatured) {
      const featuredCards = await page.locator('article').filter({ has: page.locator('text=AI & AUTOMATION') }).first();
      const categoryBadge = await featuredCards.locator('span:has-text("AI & AUTOMATION")').first();

      if (await categoryBadge.count() > 0) {
        const badgeStyles = await categoryBadge.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            background: computed.background,
            color: computed.color,
            border: computed.border,
            padding: computed.padding,
            borderRadius: computed.borderRadius,
          };
        });
        console.log('\nCategory badge styles in featured post:', JSON.stringify(badgeStyles, null, 2));
      }
    }

    // Capture screenshot of category filters
    console.log('\n📸 Capturing category filter section...');
    const filterSectionLoc = await page.locator('text=Filter:').locator('..');
    await filterSectionLoc.screenshot({
      path: join(process.cwd(), 'screenshots/blog-category-filters.png'),
    });

    // Capture screenshot of search bar
    console.log('📸 Capturing search bar...');
    const searchContainer = await page.locator('input[aria-label="Search blog posts"]').locator('..');
    await searchContainer.screenshot({
      path: join(process.cwd(), 'screenshots/blog-search-bar.png'),
    });

    // Generate DOM report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'http://localhost:3100',
      findings: {
        signalBars: signalBars > 0,
        searchBar: searchExists,
        categoryFilters: buttonCount,
        featuredSection: hasFeatured,
      },
    };

    writeFileSync(
      join(process.cwd(), 'screenshots/dom-audit-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n✅ Audit complete! Screenshots saved to screenshots/');
    console.log('📄 Report saved to screenshots/dom-audit-report.json');

  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    await browser.close();
  }
}

auditBlogVisuals();
