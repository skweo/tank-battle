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
      localStorage.setItem('tankbattle_fragments', '1200');
      localStorage.setItem('tankbattle_global_research', JSON.stringify({
        armor_line: 2,
        ballistic_archive: 2,
        salvage_prayer: 1,
      }));
      loadProgression();
      showProtocolScreen();
    });
    await page.waitForSelector('#protocol-screen', { state: 'visible' });
    await page.waitForSelector('#protocol-summary');

    const layout = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('#protocol-screen .protocol-node')].map(node => {
        const rect = node.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          cssWidth: parseFloat(getComputedStyle(node).width),
          hasState: !!node.querySelector('.node-state'),
          hasCurrent: !!node.querySelector('.node-effect-block.current'),
          hasNext: !!node.querySelector('.node-effect-block.next'),
          hasMeta: !!node.querySelector('.node-meta-row'),
        };
      });
      const coreRect = document.querySelector('#protocol-screen .protocol-core')?.getBoundingClientRect();
      const viewportRect = document.getElementById('protocol-viewport')?.getBoundingClientRect();
      const branchCards = [...document.querySelectorAll('#protocol-screen .protocol-axis-chip')].map(card => {
        const rect = card.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          hasMeter: !!card.querySelector('.axis-meter span'),
          hasDesc: !!card.querySelector('.axis-desc'),
        };
      });
      return {
        hasSummary: !!document.getElementById('protocol-summary'),
        summaryCards: document.querySelectorAll('#protocol-screen .protocol-summary-card').length,
        branchCards,
        nodes,
        viewport: !!document.getElementById('protocol-viewport'),
        map: !!document.getElementById('protocol-map'),
        zoom: !!document.getElementById('protocol-zoom-readout'),
        zoomText: document.getElementById('protocol-zoom-readout')?.textContent || '',
        coreVisible: !!coreRect && !!viewportRect &&
          coreRect.left >= viewportRect.left &&
          coreRect.right <= viewportRect.right &&
          coreRect.top >= viewportRect.top &&
          coreRect.bottom <= viewportRect.bottom,
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    assert(layout.hasSummary, 'protocol summary should render');
    assert(layout.summaryCards >= 4, 'protocol summary should include four cards');
    assert(layout.branchCards.length >= 4, 'protocol branch cards should render');
    assert(layout.branchCards.every(card => card.hasMeter && card.hasDesc), 'branch cards should include meter and description');
    assert(layout.nodes.length >= 6, 'protocol tree should render revealed and frontier nodes');
    assert(Math.min(...layout.nodes.map(node => node.width)) >= 170, 'protocol overview nodes should remain readable after viewport scaling');
    assert(Math.min(...layout.nodes.map(node => node.height)) >= 128, 'protocol overview nodes should leave enough vertical room');
    assert(Math.min(...layout.nodes.map(node => node.cssWidth)) >= 300, 'protocol node cards should have a readable unscaled width for zoomed inspection');
    assert(layout.nodes.every(node => node.hasState && node.hasCurrent && node.hasNext && node.hasMeta), 'protocol nodes should expose state/current/next/meta blocks');
    assert(layout.viewport && layout.map && layout.zoom, 'protocol map controls should render');
    assert(layout.zoomText.includes('84') || layout.zoomText.includes('85'), 'protocol map should open in overview zoom');
    assert(layout.coreVisible, 'protocol core should be visible in the opening overview');
    assert(!layout.overflowX, 'protocol screen should not overflow horizontally');
    console.log('PASS protocol layout exposes readable map state');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
