#!/usr/bin/env node
import { chromium } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [previewDir, outputDir] = process.argv.slice(2);
if (!previewDir || !outputDir) {
  throw new Error('Usage: capture_asset_preview.mjs PREVIEW_DIR OUTPUT_DIR');
}

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const base = pathToFileURL(path.resolve(previewDir, 'index.html')).href;

async function open(params, viewport = { width: 1440, height: 1000 }) {
  await page.setViewportSize(viewport);
  await page.goto(`${base}?${params}`, { waitUntil: 'load' });
  await page.locator('img').evaluateAll(async (images) => Promise.all(images.map((image) => image.complete
    ? undefined
    : new Promise((resolve) => image.addEventListener('load', resolve, { once: true }))
  )));
  const broken = await page.locator('img').evaluateAll((images) => images.filter((image) => !image.naturalWidth).map((image) => image.src));
  if (broken.length) throw new Error(`Broken images: ${broken.join(', ')}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) throw new Error(`Horizontal overflow at ${params}`);
}

async function shot(name, params, options = {}) {
  await open(params, options.viewport);
  const target = options.locator ? page.locator(options.locator) : page;
  await target.screenshot({ path: path.join(outputDir, name), fullPage: !options.locator });
}

await shot('01-home-before.png', 'view=home&mode=before');
await shot('02-home-after.png', 'view=home&mode=after');
await shot('03-products-11-before.png', 'view=products&mode=before&search=11');
await shot('04-products-11-after.png', 'view=products&mode=after&search=11');
await shot('05-products-all-after.png', 'view=products&mode=after');
await shot('06-mobile-products-11-after.png', 'view=products&mode=after&search=11', { viewport: { width: 390, height: 844 } });
await shot('07-header-logo-before.png', 'view=home&mode=before', { locator: 'header', viewport: { width: 1440, height: 1000 } });
await shot('08-header-logo-after.png', 'view=home&mode=after', { locator: 'header' });
await shot('09-footer-logo-after.png', 'view=home&mode=after', { locator: 'footer' });
await shot('10-ai-after.png', 'view=ai&mode=after');
await shot('11-x200t-review.png', 'view=x200t&mode=after');

const terms = ['11', '12', '13', '14', '15', '16', 'Samsung', 'OLED', 'INCELL', 'Fold', 'Flip'];
const checks = [];
for (const term of terms) {
  await open(`view=products&mode=after&search=${encodeURIComponent(term)}`);
  checks.push({ term, cards: await page.locator('.card').count(), brokenImages: 0, horizontalOverflow: false });
}
await open('view=products&mode=after');
checks.push({ term: 'ALL', cards: await page.locator('.card').count(), brokenImages: 0, horizontalOverflow: false });
process.stdout.write(`${JSON.stringify({ screenshots: 11, checks }, null, 2)}\n`);
await browser.close();
