#!/usr/bin/env node
const path = require('path');
const { chromium } = require('playwright');

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
      localStorage.setItem('tankbattle_fragments', '1800');
      loadProgression();
      showLabScreen();
    });
    await page.waitForSelector('#lab-screen', { state: 'visible' });

    const layout = await page.evaluate(() => {
      const statRows = [...document.querySelectorAll('#lab-screen .lab-stat-upgrade-row')].map(row => {
        const rect = row.getBoundingClientRect();
        return rect.height;
      });
      const summary = document.getElementById('lab-summary')?.getBoundingClientRect();
      const tankCards = [...document.querySelectorAll('#lab-screen .lab-tank-card')].map(card => card.getBoundingClientRect().width);
      return {
        hasSummary: !!summary && summary.height > 20,
        minStatRowHeight: Math.min(...statRows),
        statRowCount: statRows.length,
        tankCardCount: tankCards.length,
        minTankCardWidth: Math.min(...tankCards),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    assert(layout.hasSummary, 'lab summary should render');
    assert(layout.statRowCount >= 5, 'lab should render part upgrade rows');
    assert(layout.minStatRowHeight >= 50, 'lab upgrade rows should leave enough vertical room');
    assert(layout.tankCardCount >= 10, 'lab should render all tank cards');
    assert(layout.minTankCardWidth >= 50, 'lab tank cards should not collapse');
    assert(!layout.overflowX, 'lab screen should not overflow horizontally');
    console.log('PASS lab layout remains readable');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
