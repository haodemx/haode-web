import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const outDir = "output/marketing-platform-audit";
const screenshotDir = `${outDir}/screenshots`;
const base = "http://127.0.0.1:8001";

await fs.mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true
});

async function check(context, key, path) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: `${screenshotDir}/${key}.png`, fullPage: true });
  const result = await page.evaluate(() => ({
    title: document.title,
    statusText: document.body.innerText.slice(0, 5000),
    dailyAdVisible: !!document.querySelector("[data-daily-ad]:not([hidden]), .daily-ad-card"),
    oldPhoneVisible: /332\s*668\s*4296|3326684296|523326684296/.test(document.body.innerText + " " + Array.from(document.links).map((a) => a.href).join(" ")),
    targetPhoneVisible: /5645866014|525645866014/.test(document.body.innerText + " " + Array.from(document.links).map((a) => a.href).join(" ")),
    appDiagnostics: window.HAODE_DIAGNOSTICS || null,
    productCards: document.querySelectorAll(".product-card").length,
    brokenImages: Array.from(document.images)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt)
  }));
  await page.close();
  return { key, path, status: response?.status() || null, errors, ...result };
}

const checks = [
  await check(context, "local-home-desktop", "/"),
  await check(mobileContext, "local-home-mobile", "/"),
  await check(context, "local-app-desktop", "/app/"),
  await check(mobileContext, "local-app-mobile", "/app/")
];

await browser.close();
await fs.writeFile(`${outDir}/local-verify-results.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), checks }, null, 2)}\n`);
console.log(JSON.stringify(checks, null, 2));
