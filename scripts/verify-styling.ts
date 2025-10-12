import { chromium } from 'playwright';

async function verifyBlogStyling() {
  console.log('🎨 Verifying blog styling...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // 1. Check total CSS rules
    const cssCheck = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let totalRules = 0;
      let categoryColorRules = 0;
      let athleticBrandVioletRules = 0;

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          totalRules += rules.length;

          rules.forEach((rule: any) => {
            const text = rule.cssText || '';

            // Check for category colors
            if (text.includes('violet-500') ||
                text.includes('orange-500') ||
                text.includes('blue-500') ||
                text.includes('emerald-500') ||
                text.includes('purple-500') ||
                text.includes('amber-500')) {
              categoryColorRules++;
            }

            // Check for athletic brand violet
            if (text.includes('7c3aed') || text.includes('#7c3aed')) {
              athleticBrandVioletRules++;
            }
          });
        } catch (e) {
          // Skip cross-origin sheets
        }
      });

      return { totalRules, categoryColorRules, athleticBrandVioletRules };
    });

    console.log('📊 CSS Rules Analysis:');
    console.log(`   Total CSS rules: ${cssCheck.totalRules}`);
    console.log(`   Category color rules: ${cssCheck.categoryColorRules}`);
    console.log(`   Athletic brand violet rules: ${cssCheck.athleticBrandVioletRules}\n`);

    // 2. Check category button styling
    const categoryButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const categoryButton = buttons.find(btn =>
        btn.textContent?.includes('AI & AUTOMATION') ||
        btn.textContent?.includes('ARCHITECTURE')
      );

      if (!categoryButton) return null;

      const styles = window.getComputedStyle(categoryButton);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
        classes: categoryButton.className,
      };
    });

    if (categoryButtons) {
      console.log('🎯 Category Button Styling:');
      console.log(`   Background: ${categoryButtons.backgroundColor}`);
      console.log(`   Border: ${categoryButtons.borderColor}`);
      console.log(`   Text Color: ${categoryButtons.color}`);
      console.log(`   Classes: ${categoryButtons.classes}\n`);
    } else {
      console.log('⚠️  No category buttons found\n');
    }

    // 3. Check search bar styling
    const searchBar = await page.evaluate(() => {
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      const searchContainer = searchInput?.parentElement;

      if (!searchContainer) return null;

      const styles = window.getComputedStyle(searchContainer);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        borderRadius: styles.borderRadius,
        classes: searchContainer.className,
      };
    });

    if (searchBar) {
      console.log('🔍 Search Bar Styling:');
      console.log(`   Background: ${searchBar.backgroundColor}`);
      console.log(`   Border: ${searchBar.borderColor}`);
      console.log(`   Border Radius: ${searchBar.borderRadius}`);
      console.log(`   Classes: ${searchBar.classes}\n`);
    } else {
      console.log('⚠️  Search bar not found\n');
    }

    // 4. Check if athletic-brand-violet color is applied anywhere
    const athleticColorCheck = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let foundElements = 0;

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const borderColor = styles.borderColor;
        const textColor = styles.color;

        // Check for athletic-brand-violet (#7c3aed = rgb(124, 58, 237))
        if (bgColor.includes('124, 58, 237') ||
            borderColor.includes('124, 58, 237') ||
            textColor.includes('124, 58, 237')) {
          foundElements++;
        }
      });

      return foundElements;
    });

    console.log('💜 Athletic Brand Violet Usage:');
    console.log(`   Elements using athletic-brand-violet: ${athleticColorCheck}\n`);

    // Summary
    console.log('✅ VERIFICATION SUMMARY:');
    console.log(`   CSS Rules Generated: ${cssCheck.totalRules > 1000 ? '✅ PASS' : '❌ FAIL (too few)'}`);
    console.log(`   Category Colors: ${cssCheck.categoryColorRules > 0 ? '✅ PASS' : '❌ FAIL (not found)'}`);
    console.log(`   Athletic Brand Violet: ${cssCheck.athleticBrandVioletRules > 0 ? '✅ PASS' : '❌ FAIL (not found)'}`);
    console.log(`   Elements Using Violet: ${athleticColorCheck > 0 ? '✅ PASS' : '⚠️  WARNING (not applied)'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

verifyBlogStyling();
