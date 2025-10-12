import { chromium } from 'playwright';

async function debugStyles() {
  console.log('🔍 Debugging style application...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark', // Force dark mode
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3100', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check system color scheme
    const colorScheme = await page.evaluate(() => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    console.log(`System color scheme detected: ${colorScheme}`);

    // Check "All Posts" button computed styles with full cascade
    console.log('\n📊 All Posts Button Analysis:');
    const allPostsButton = page.locator('button:has-text("All Posts")').first();

    const fullStyles = await allPostsButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const classList = Array.from(el.classList);

      // Get all applied CSS rules
      const sheets = Array.from(document.styleSheets);
      const matchingRules: any[] = [];

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule: any) => {
            if (rule.selectorText && el.matches(rule.selectorText)) {
              matchingRules.push({
                selector: rule.selectorText,
                cssText: rule.style.cssText,
              });
            }
          });
        } catch (e) {
          // CORS or other issues
        }
      });

      return {
        classList,
        computed: {
          background: computed.background,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
          border: computed.border,
          color: computed.color,
        },
        matchingRules: matchingRules.slice(0, 10), // First 10 rules
      };
    });

    console.log('Class list:', fullStyles.classList);
    console.log('Computed styles:', JSON.stringify(fullStyles.computed, null, 2));
    console.log('\nMatching CSS rules:');
    fullStyles.matchingRules.forEach((rule, i) => {
      console.log(`  ${i + 1}. ${rule.selector}`);
      console.log(`     ${rule.cssText}`);
    });

    // Check signal bars
    console.log('\n📊 Signal Bars Analysis:');
    const signalBar = page.locator('.flex.gap-1 > div').first();

    const barStyles = await signalBar.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const classList = Array.from(el.classList);

      return {
        classList,
        computed: {
          background: computed.background,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage,
          width: computed.width,
          height: computed.height,
        },
      };
    });

    console.log('Class list:', barStyles.classList);
    console.log('Computed styles:', JSON.stringify(barStyles.computed, null, 2));

    // Check if Tailwind CSS is loaded
    console.log('\n📦 Checking Tailwind CSS:');
    const hasTailwind = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let tailwindFound = false;
      let totalRules = 0;

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          totalRules += rules.length;

          // Look for Tailwind-specific rules
          const hasTwRule = rules.some((rule: any) =>
            rule.selectorText && (
              rule.selectorText.includes('.bg-gradient') ||
              rule.selectorText.includes('.from-') ||
              rule.selectorText.includes('.to-')
            )
          );
          if (hasTwRule) tailwindFound = true;
        } catch (e) {}
      });

      return { tailwindFound, totalRules, totalSheets: sheets.length };
    });

    console.log('Tailwind detected:', hasTailwind.tailwindFound);
    console.log('Total stylesheets:', hasTailwind.totalSheets);
    console.log('Total CSS rules:', hasTailwind.totalRules);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugStyles();
