import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const outDir = "output/marketing-platform-audit";
const screenshotDir = `${outDir}/screenshots`;

const pages = [
  { key: "home", url: "https://haode.com.mx/" },
  { key: "productos", url: "https://haode.com.mx/productos/" },
  { key: "app", url: "https://haode.com.mx/app/" },
  { key: "pantallas", url: "https://haode.com.mx/#pantallas" },
  { key: "productos_ai", url: "https://haode.com.mx/#productos-ai" },
  { key: "micas", url: "https://haode.com.mx/#micas" },
  { key: "contacto", url: "https://haode.com.mx/#contacto" },
  { key: "robots", url: "https://haode.com.mx/robots.txt" },
  { key: "sitemap", url: "https://haode.com.mx/sitemap.xml" },
  { key: "facebook", url: "https://www.facebook.com/cristi3an/" },
  { key: "tiktok", url: "https://www.tiktok.com/@haodemx" }
];

async function collectPage(page, entry, viewportName) {
  const consoleMessages = [];
  const pageErrors = [];
  const responses = [];

  page.on("console", (message) => {
    const text = message.text();
    if (/haode|product|error|failed|cors|firebase|stock|whatsapp|facebook|tiktok/i.test(text)) {
      consoleMessages.push({ type: message.type(), text });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const url = response.url();
    if (/products\.json|public-stock\.json|web-orders|app\.js|firebase|manifest|service-worker/i.test(url)) {
      responses.push({ url, status: response.status(), ok: response.ok() });
    }
  });

  let status = null;
  let finalUrl = entry.url;
  let loadError = null;
  try {
    const response = await page.goto(entry.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    status = response?.status() ?? null;
    finalUrl = page.url();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    if (entry.key === "app") {
      await page.waitForFunction(() => window.HAODE_DIAGNOSTICS || document.body.innerText.includes("No se pudieron cargar"), null, { timeout: 20000 }).catch(() => {});
    }
  } catch (error) {
    loadError = error.message;
  }

  const screenshotPath = `${screenshotDir}/${entry.key}-${viewportName}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

  const dom = await page.evaluate(() => {
    const text = document.body ? document.body.innerText : "";
    const title = document.title || "";
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const diagnostics = window.HAODE_DIAGNOSTICS || null;
    const links = Array.from(document.querySelectorAll("a[href]")).map((a) => ({
      text: (a.innerText || a.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 160),
      href: a.href
    }));
    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt || "",
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      broken: img.complete && img.naturalWidth === 0
    }));
    const appProductCards = document.querySelectorAll("[data-product-card], .product-card, .app-product-card, .catalog-card").length;
    const categoryButtons = Array.from(document.querySelectorAll("button, a"))
      .map((el) => (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "))
      .filter((label) => /iPhone|Samsung|Mica|Fundas|AI|Categor/i.test(label))
      .slice(0, 60);
    return {
      title,
      description,
      canonical,
      textSample: text.slice(0, 4000),
      hasOldPhone332: /332\s*668\s*4296|3326684296|523326684296/.test(text + " " + links.map((l) => l.href).join(" ")),
      hasTargetPhone5645: /5645\s*866014|5645866014|525645866014/.test(text + " " + links.map((l) => l.href).join(" ")),
      hasAppLoadError: /No se pudieron cargar los productos/i.test(text),
      hasGooglePlayOrAppStore: /Google Play|App Store/i.test(text),
      links,
      images,
      brokenImages: images.filter((img) => img.broken),
      appProductCards,
      categoryButtons,
      diagnostics
    };
  }).catch((error) => ({ evaluateError: error.message }));

  return {
    ...entry,
    viewport: viewportName,
    status,
    finalUrl,
    loadError,
    screenshotPath,
    consoleMessages,
    pageErrors,
    responses,
    dom
  };
}

async function checkUrlStatus(request, url) {
  try {
    const response = await request.get(url, { timeout: 20000, maxRedirects: 5 });
    return { url, status: response.status(), ok: response.ok(), finalUrl: response.url() };
  } catch (error) {
    return { url, error: error.message };
  }
}

await fs.mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  ignoreHTTPSErrors: true
});
const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  ignoreHTTPSErrors: true
});

const results = [];
for (const entry of pages) {
  const page = await context.newPage();
  results.push(await collectPage(page, entry, "desktop"));
  await page.close().catch(() => {});

  if (["home", "productos", "app", "facebook", "tiktok"].includes(entry.key)) {
    const mobilePage = await mobileContext.newPage();
    results.push(await collectPage(mobilePage, entry, "mobile"));
    await mobilePage.close().catch(() => {});
  }
}

const requestContext = context.request;
const statusUrls = [
  "https://haode.com.mx/app/products.json",
  "https://erp.haode.com.mx/public-stock.json",
  "https://haode.com.mx/manifest.webmanifest",
  "https://haode.com.mx/assets/logo/logo.png",
  "https://haode.com.mx/robots.txt",
  "https://haode.com.mx/sitemap.xml"
];
const statusChecks = [];
for (const url of statusUrls) {
  statusChecks.push(await checkUrlStatus(requestContext, url));
}

await browser.close();

await fs.writeFile(`${outDir}/live-audit-results.json`, JSON.stringify({ generatedAt: new Date().toISOString(), results, statusChecks }, null, 2));
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), checked: results.length, statusChecks }, null, 2));
