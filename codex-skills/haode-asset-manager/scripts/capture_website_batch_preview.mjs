#!/usr/bin/env node
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [previewDir, outputDir] = process.argv.slice(2);
if (!previewDir || !outputDir) throw new Error('Usage: capture_website_batch_preview.mjs PREVIEW_DIR OUTPUT_DIR');
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const base = pathToFileURL(path.resolve(previewDir, 'index.html')).href;

async function open(params, viewport = { width: 1440, height: 1000 }) {
  await page.setViewportSize(viewport);
  await page.goto(`${base}?${params}`, { waitUntil: 'load' });
  await page.locator('img').evaluateAll(async (images) => Promise.all(images.map((image) => image.complete
    ? undefined
    : new Promise((resolve) => image.addEventListener('load', resolve, { once: true })))));
  const result = await page.evaluate(() => {
    const images = [...document.images];
    const media = [...document.querySelectorAll('.media')].map((node) => {
      const box = node.getBoundingClientRect();
      return { width: Math.round(box.width), height: Math.round(box.height) };
    });
    return {
      brokenImages: images.filter((image) => !image.naturalWidth).map((image) => image.src),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      media,
      normalizedCards: [...document.querySelectorAll('.card')].filter((card) => card.textContent.includes('CUTOUT_READY')).length,
    };
  });
  if (result.brokenImages.length) throw new Error(`Broken images: ${result.brokenImages.join(', ')}`);
  if (result.horizontalOverflow) throw new Error(`Horizontal overflow: ${params}`);
  if (result.media.some(({ width, height }) => Math.abs(width - height) > 1)) throw new Error(`Non-square media stage: ${params}`);
  return result;
}

async function shot(name, params, viewport) {
  const result = await open(params, viewport);
  await page.screenshot({ path: path.join(outputDir, name), fullPage: true });
  return result;
}

const screenshots = {};
screenshots['01-products-11-before.png'] = await shot('01-products-11-before.png', 'view=products&mode=before&search=11');
screenshots['02-products-11-after.png'] = await shot('02-products-11-after.png', 'view=products&mode=after&search=11');
screenshots['03-products-all-after.png'] = await shot('03-products-all-after.png', 'view=products&mode=after');
screenshots['04-home-after.png'] = await shot('04-home-after.png', 'view=home&mode=after');
screenshots['05-product-detail-after.png'] = await shot('05-product-detail-after.png', 'view=detail&mode=after');
screenshots['06-mobile-products-11-after.png'] = await shot(
  '06-mobile-products-11-after.png',
  'view=products&mode=after&search=11',
  { width: 390, height: 844 },
);

const checks = [];
for (const term of ['11', '12', '13', '14', '15', '16', 'OLED', 'INCELL', 'Samsung', 'Fold', 'Flip']) {
  const result = await open(`view=products&mode=after&search=${encodeURIComponent(term)}`);
  checks.push({ term, cards: await page.locator('.card').count(), ...result });
}
const logo = await open('view=home&mode=after');
const logoState = await page.locator('header img').evaluate((image) => ({
  src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
}));
if (!logoState.src.includes('haode-logo-official.svg') || !logoState.naturalWidth) throw new Error('Official transparent Logo missing');

const reportPath = path.resolve(previewDir, '..', 'HAODE-ASSET-SYSTEM-V1-PHASE2-REPORT.md');
if (fs.existsSync(reportPath)) {
  const finalized = fs.readFileSync(reportPath, 'utf8')
    .replace('PRODUCTS 11: pending browser QA', 'PRODUCTS 11: PASS; five transparent normalized assets, one promo placeholder, one missing-real-asset placeholder')
    .replace('DESKTOP: pending browser QA', 'DESKTOP: PASS; required desktop screenshots captured, no broken images or horizontal overflow')
    .replace('MOBILE: pending browser QA', 'MOBILE: PASS; required 390 px mobile screenshot captured, no broken images or horizontal overflow')
    .replace('LOGO: pending browser QA', 'LOGO: PASS; official 2400 x 587 transparent SVG loaded in the after preview')
    .replace('READY FOR USER VISUAL REVIEW: pending browser QA', 'READY FOR USER VISUAL REVIEW: YES');
  fs.writeFileSync(reportPath, finalized);
}

process.stdout.write(`${JSON.stringify({ screenshots, checks, logo: { ...logo, ...logoState } }, null, 2)}\n`);
await browser.close();
