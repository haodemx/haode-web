const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

test('catalog uses lightweight Samsung Original card images', async ({ page }) => {
  const heavyCardRequests = [];
  page.on('request', (request) => {
    const url = request.url();
    if (/\/assets\/products\/samsung-original\/(?:s2[2-5]-|z-(?:flip|fold))[^/]*\/main\.png(?:\?|$)/.test(url)) {
      heavyCardRequests.push(url);
    }
  });

  await page.goto(`${baseURL}/productos/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('img[src*="/samsung-original/"][src$="main-card.webp"]').length >= 13);

  const cardSources = await page.locator('img[src*="/samsung-original/"][src$="main-card.webp"]').evaluateAll(
    (images) => [...new Set(images.map((image) => image.getAttribute('src')))],
  );
  expect(cardSources).toHaveLength(13);
  expect(heavyCardRequests).toEqual([]);
});
