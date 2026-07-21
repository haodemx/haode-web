const { test, expect } = require("@playwright/test");

const APP_URL = process.env.BASE_URL || "https://haode.com.mx/app/";

test.describe("HAODE Tienda app QA", () => {
  test("opens, renders catalog, cart, WhatsApp flow, and responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });

    await expect(page.getByText("HAODE Tienda").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "iPhone y Samsung de alta gama" })).toBeVisible();
    await expect(page.getByText("Productos destacados").first()).toBeVisible();
    await expect(page.locator(".trust-pill").filter({ hasText: "WhatsApp" })).toBeVisible();
    await expect(page.locator("[data-open-cart]").first()).toBeVisible();

    const productCards = page.locator(".product-card");
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await expect(productCards).not.toHaveCount(0);

    await expect(productCards.first().locator(".price-lines")).toContainText(/\$\s*[\d,.]+/);

    const cartCount = page.locator("[data-cart-count]").first();
    const initialCount = Number((await cartCount.textContent()) || "0");
    await productCards.first().getByRole("button", { name: "Agregar" }).click();
    await expect(cartCount).toHaveText(String(initialCount + 1));
    await expect(page.locator("[data-cart-drawer]")).toHaveClass(/open/);

    await page.locator("[data-customer-name]").fill("Cliente QA HAODE");
    await page.locator("[data-customer-phone]").fill("5512345678");
    await page.locator("[data-customer-city]").fill("CDMX");
    await page.locator("[data-customer-comment]").fill("Prueba automatizada de carrito.");

    const whatsappLink = page.locator("[data-whatsapp-link]");
    await expect(whatsappLink).not.toHaveClass(/disabled/);
    await expect(whatsappLink).toHaveAttribute("href", /wa\.me|whatsapp/);

    await page.locator("[data-increase]").first().click();
    await expect(cartCount).toHaveText(String(initialCount + 2));
    await page.locator("[data-decrease]").first().click();
    await expect(cartCount).toHaveText(String(initialCount + 1));
    await page.locator("[data-remove]").first().click();
    await expect(cartCount).toHaveText(String(initialCount));

    await page.locator("[data-close-cart]").click();
    await page.goto(`${APP_URL}#producto/x200t-cortadora-micas`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /X200T/i })).toBeVisible();
    await expect(page.locator("[data-product-gallery] img").first()).toBeVisible();
    await expect(page.locator("[data-viewer-stage]")).toHaveCount(0);
    await expect(page.getByText("Galería de producto")).toBeVisible();

    await expectBrokenImages(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

async function expectBrokenImages(page) {
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) {
      image.scrollIntoView({ block: "center", inline: "center" });
      if (!image.complete) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 3000);
        });
      }
    }
  });

  const brokenImages = await page.evaluate(() => (
    Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt)
  ));

  expect(brokenImages).toEqual([]);
}
