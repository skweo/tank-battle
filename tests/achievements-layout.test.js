#!/usr/bin/env node
const path = require('path');
const { chromium } = require('playwright');

function spread(values) {
  return Math.max(...values) - Math.min(...values);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
    const filePath = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
    await page.goto(filePath);
    await page.evaluate(() => {
      const unlocked = achievementsDef.slice(0, 28).map(a => a.id);
      localStorage.setItem('tankbattle_achievements', JSON.stringify(unlocked));
      localStorage.setItem('tankbattle_achievement_rewards_claimed', JSON.stringify(unlocked.slice(0, 10)));
      loadAchievements();
      loadAchievementRewards();
      showAchievements();
    });
    await page.waitForSelector('#achievements-screen', { state: 'visible' });

    const layout = await page.evaluate(() => {
      function box(id) {
        const rect = document.getElementById(id).getBoundingClientRect();
        return { width: rect.width, left: rect.left, right: rect.right };
      }
      function widths(selector) {
        return [...document.querySelectorAll(selector)].map(el => el.getBoundingClientRect().width);
      }
      return {
        containers: [box('achieve-summary'), box('achieve-tabs'), box('achieve-filters'), box('achieve-grid')],
        summaryCards: widths('#achieve-summary .ach-summary-card'),
        categoryTabs: widths('#achieve-tabs .achieve-tab'),
        filterTabs: widths('#achieve-filters .ach-filter-tab'),
        rows: [...document.querySelectorAll('#achieve-grid .achieve-row')].slice(0, 8).map(row => {
          const rect = row.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, height: rect.height };
        }),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    const rowGaps = layout.rows.slice(1).map((row, index) => row.top - layout.rows[index].bottom);
    assert(!layout.overflowX, 'achievements screen should not overflow horizontally');
    assert(spread(layout.containers.map(box => box.width)) <= 3, 'achievement sections should share the same width');
    assert(spread(layout.summaryCards) <= 3, 'achievement summary cards should be equal width');
    assert(spread(layout.categoryTabs) <= 3, 'achievement category tabs should be equal width');
    assert(spread(layout.filterTabs) <= 3, 'achievement filter tabs should be equal width');
    assert(Math.min(...layout.rows.map(row => row.height)) >= 72, 'achievement rows should leave enough vertical room for text');
    assert(Math.min(...rowGaps) >= 4, 'achievement rows should not overlap or touch');
    console.log('PASS achievements layout spacing is consistent');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
