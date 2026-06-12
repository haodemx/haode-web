const { test, expect } = require("@playwright/test");

const APP_URL = process.env.BASE_URL || "https://haodemx.github.io/haode-web/app/";

test.describe("HAODE Tienda app QA", () => {
  test("opens, renders catalog, cart, WhatsApp flow, and responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });

    await expect(page.getByText("HAODE Tienda").first()).toBeVisible();
    await expect(page.getByText("Menudeo").first()).toBeVisible();
    await expect(page.getByText("Mayoreo").first()).toBeVisible();
    await expect(page.getByText("Carrito").first()).toBeVisible();
    await expect(page.getByText("Ofertas especiales").first()).toBeVisible();

    const productCards = page.locator(".product-card");
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });
    await expect(productCards).not.toHaveCount(0);

    await expect(productCards.first().locator(".price-lines")).toContainText(/\$\s*[\d,.]+/);

    const cartCount = page.locator("[data-cart-count]").first();
    const initialCount = Number((await cartCount.textContent()) || "0");
    await productCards.first().getByRole("button", { name: "Agregar al carrito" }).click();
    await expect(cartCount).toHaveText(String(initialCount + 1));

    await page.locator("[data-open-cart]").first().click();
    await page.locator("[data-customer-name]").fill("Cliente QA HAODE");
    await page.locator("[data-customer-phone]").fill("5512345678");
    await page.locator("[data-customer-city]").fill("CDMX");
    await page.locator("[data-customer-comment]").fill("Prueba automatizada de carrito.");

    const whatsappLink = page.locator("[data-whatsapp-link]");
    await expect(whatsappLink).not.toHaveClass(/disabled/);
    await expect(whatsappLink).toHaveAttribute("href", /wa\.me|whatsapp/);

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
