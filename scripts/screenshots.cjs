const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

const extPath = path.resolve(__dirname, '../dist');
const outDir = path.resolve(__dirname, '../screenshots');
const userDataDir = path.join(os.tmpdir(), 'iw-screenshots-' + Date.now());

const seedData = {
  watchlist: [
    { id: '1', name: 'Paraben', category: 'cosmetics', enabled: true, severity: 'warning', aliases: ['methylparaben', 'propylparaben'] },
    { id: '2', name: 'Fragrance', category: 'cosmetics', enabled: true, severity: 'warning', aliases: ['parfum', 'perfume', 'aroma'] },
    { id: '3', name: 'SLS', category: 'cosmetics', enabled: true, severity: 'warning', aliases: ['sodium lauryl sulfate'] },
    { id: '4', name: 'Gluten', category: 'allergens', enabled: true, severity: 'warning', aliases: ['wheat gluten'] },
    { id: '5', name: 'Soy', category: 'allergens', enabled: true, severity: 'warning', aliases: ['soya'] },
    { id: '6', name: 'Silicone', category: 'cosmetics', enabled: true, severity: 'info', aliases: ['dimethicone'] },
    { id: '7', name: 'Alcohol Denat', category: 'cosmetics', enabled: true, severity: 'warning', aliases: ['denatured alcohol'] },
    { id: '8', name: 'Phthalate', category: 'cosmetics', enabled: true, severity: 'warning', aliases: ['dibutyl phthalate'] },
    { id: '9', name: 'Sulfate', category: 'cleaning', enabled: true, severity: 'warning', aliases: ['sodium laureth sulfate'] },
    { id: '10', name: 'Formaldehyde', category: 'cosmetics', enabled: true, severity: 'danger', aliases: ['formalin'] },
  ],
  settings: {
    theme: 'dark',
    scanOnLoad: true,
    highlightStyle: 'background',
    matchSeverity: 'all',
  },
  domainSettings: {
    'trendyol.com': { autoScan: true },
    'amazon.com': { autoScan: true },
    'hepsiburada.com': { autoScan: true },
  },
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1000,800',
    ],
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto('about:blank');
  await sleep(2000);

  const cdpSession = await context.newCDPSession(page);
  const targets = await cdpSession.send('Target.getTargets');
  const extTarget = targets.targetInfos.find(t => t.url && t.url.startsWith('chrome-extension://'));
  
  if (!extTarget) {
    console.error('Targets:', JSON.stringify(targets.targetInfos.slice(0, 30).map(t => ({ url: t.url?.substring(0, 120), type: t.type })), null, 2));
    await context.close();
    return;
  }

  const match = extTarget.url.match(/chrome-extension:\/\/([a-z]+)/);
  if (!match) { await context.close(); return; }

  const extensionId = match[1];
  console.log('Extension ID:', extensionId);

  // Seed via popup
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  await page.goto(popupUrl);
  await sleep(2000);

  const seeded = await page.evaluate((data) => {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set(data, () => {
          resolve(chrome.runtime.lastError ? 'error: ' + chrome.runtime.lastError.message : 'ok');
        });
      } catch (e) {
        resolve('exception: ' + e.message);
      }
    });
  }, seedData);
  console.log('Seed:', seeded);

  await sleep(500);

  // Options screenshot
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await sleep(3000);
  await page.setViewportSize({ width: 900, height: 750 });
  await page.screenshot({ path: path.join(outDir, 'options-page.png') });
  console.log('Options screenshot saved');

  // Popup screenshot
  await page.goto(popupUrl);
  await sleep(3000);
  await page.setViewportSize({ width: 420, height: 620 });
  await page.screenshot({ path: path.join(outDir, 'popup.png') });
  console.log('Popup screenshot saved');

  await context.close();
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
