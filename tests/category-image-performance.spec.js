const { test, expect } = require('@playwright/test');
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4175').replace(/\/$/, '');

for (const slug of ['oled-diagnostica', 'samsung-incell', 'samsung-oled']) {
  test(`${slug} loads one optimized card image before scrolling`, async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto(`${BASE_URL}/categoria/${slug}/`, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-category-products] .new-product-card');
    await expect(cards.first()).toBeVisible();

    const firstImage = cards.first().locator('img');
    const thirdImage = cards.nth(2).locator('img');
    await expect(firstImage).toHaveAttribute('src', /\.display\.webp$/);
    await expect(thirdImage).toHaveAttribute('src', '/assets/products/placeholder.svg');

    await thirdImage.scrollIntoViewIfNeeded();
    await expect(thirdImage).toHaveAttribute('src', /\.display\.webp$/);
  });
}

test('Samsung original category avoids full-size PNG card images', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  const imageRequests = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image') imageRequests.push(new URL(request.url()).pathname);
  });

  await page.goto(`${BASE_URL}/categoria/samsung-tipo-original/`, { waitUntil: 'networkidle' });
  const cardImages = page.locator('.new-product-card img');
  await expect(cardImages).toHaveCount(9);
  await expect(cardImages.first()).toHaveAttribute('src', /main\.display\.webp$/);
  expect(imageRequests.some((path) => /\/samsung-original\/.+\/main\.png$/.test(path))).toBe(false);
});

test('iPhone product video poster avoids the full-size original image', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  const imageRequests = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image') imageRequests.push(new URL(request.url()).pathname);
  });

  await page.goto(`${BASE_URL}/producto/iphone-incell-14/`, { waitUntil: 'networkidle' });
  expect(imageRequests).toContain('/assets/products/iphone-incell/14/main.display.webp');
  expect(imageRequests).not.toContain('/assets/products/iphone-incell/14/main.jpg');
});
