import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function inspectPort3000() {
  console.log('🔍 Inspecting localhost:3000...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Capture screenshot
    console.log('📸 Capturing screenshot...');
    await page.screenshot({
      path: join(process.cwd(), 'screenshots/localhost-3000-full.png'),
      fullPage: true,
    });

    // Check for signal bars
    console.log('\n🎯 SIGNAL BARS INSPECTION:');
    const signalBarsContainer = await page.locator('.flex.gap-1.mt-3').count();
    console.log(`Signal bars container exists: ${signalBarsContainer > 0 ? '✅ YES' : '❌ NO'}`);

    if (signalBarsContainer > 0) {
      const bars = await page.locator('.flex.gap-1.mt-3 > div');
      const barCount = await bars.count();
      console.log(`Number of bars: ${barCount}`);

      // Get first bar details
      if (barCount > 0) {
        const firstBar = bars.first();
        const barDetails = await firstBar.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            classList: Array.from(el.classList),
            computed: {
              width: computed.width,
              height: computed.height,
              background: computed.background,
              backgroundImage: computed.backgroundImage,
              backgroundColor: computed.backgroundColor,
            },
          };
        });
        console.log('First bar classes:', barDetails.classList);
        console.log('First bar computed:', JSON.stringify(barDetails.computed, null, 2));
      }
    }

    // Check "All Posts" button
    console.log('\n🎯 "ALL POSTS" BUTTON INSPECTION:');
    const allPostsButton = page.locator('button:has-text("All Posts")').first();
    const buttonExists = await allPostsButton.count() > 0;
    console.log(`Button exists: ${buttonExists ? '✅ YES' : '❌ NO'}`);

    if (buttonExists) {
      const buttonDetails = await allPostsButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          classList: Array.from(el.classList),
          computed: {
            background: computed.background,
            backgroundImage: computed.backgroundImage,
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            padding: computed.padding,
            minHeight: computed.minHeight,
          },
        };
      });
      console.log('Button classes:', buttonDetails.classList);
      console.log('Button computed:', JSON.stringify(buttonDetails.computed, null, 2));
    }

    // Check AI & Automation button
    console.log('\n🎯 "AI & AUTOMATION" BUTTON INSPECTION:');
    const aiButton = page.locator('button:has-text("AI & Automation")').first();
    const aiExists = await aiButton.count() > 0;
    console.log(`Button exists: ${aiExists ? '✅ YES' : '❌ NO'}`);

    if (aiExists) {
      const aiDetails = await aiButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          classList: Array.from(el.classList),
          computed: {
            background: computed.background,
            backgroundImage: computed.backgroundImage,
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            border: computed.border,
          },
        };
      });
      console.log('AI button classes:', aiDetails.classList);
      console.log('AI button computed:', JSON.stringify(aiDetails.computed, null, 2));
    }

    // Check Tailwind CSS loading
    console.log('\n🎯 TAILWIND CSS CHECK:');
    const tailwindCheck = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let gradientRules = 0;
      let totalRules = 0;

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          totalRules += rules.length;

          rules.forEach((rule: any) => {
            if (rule.selectorText) {
              // Check for Tailwind gradient utilities
              if (
                rule.selectorText.includes('.bg-gradient') ||
                rule.selectorText.includes('.from-') ||
                rule.selectorText.includes('.to-') ||
                rule.cssText.includes('linear-gradient')
              ) {
                gradientRules++;
              }
            }
          });
        } catch (e) {}
      });

      return {
        totalSheets: sheets.length,
        totalRules,
        gradientRules,
        tailwindLoaded: gradientRules > 0,
      };
    });

    console.log('Total stylesheets:', tailwindCheck.totalSheets);
    console.log('Total CSS rules:', tailwindCheck.totalRules);
    console.log('Gradient-related rules:', tailwindCheck.gradientRules);
    console.log(`Tailwind loaded: ${tailwindCheck.tailwindLoaded ? '✅ YES' : '❌ NO'}`);

    // Get loaded stylesheets
    console.log('\n🎯 LOADED STYLESHEETS:');
    const stylesheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).map(sheet => ({
        href: sheet.href || 'inline',
        rules: sheet.cssRules?.length || 0,
      }));
    });
    stylesheets.forEach((sheet, i) => {
      console.log(`  ${i + 1}. ${sheet.href} (${sheet.rules} rules)`);
    });

    // Capture element screenshots
    console.log('\n📸 Capturing element screenshots...');

    if (signalBarsContainer > 0) {
      await page.locator('.flex.gap-1.mt-3').screenshot({
        path: join(process.cwd(), 'screenshots/signal-bars-3000.png'),
      });
    }

    if (buttonExists) {
      await page.locator('button:has-text("All Posts")').first().screenshot({
        path: join(process.cwd(), 'screenshots/all-posts-button-3000.png'),
      });
    }

    console.log('\n✅ Inspection complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

inspectPort3000();
