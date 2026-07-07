import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const base = "http://127.0.0.1:8001";
const outPath = "output/marketing-platform-audit/marketing-admin-verify-results.json";
const screenshotPath = "output/marketing-platform-audit/screenshots/marketing-admin-drafts-local.png";

await fs.mkdir("output/marketing-platform-audit/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];

page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const response = await page.goto(`${base}/admin/marketing-drafts/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-product]", { timeout: 15000 });

const before = await page.evaluate(() => ({
  title: document.title,
  heading: document.querySelector("[data-title]")?.textContent || "",
  product: document.querySelector("[data-product]")?.textContent || "",
  status: document.querySelector("[data-status]")?.textContent || "",
  localState: document.querySelector("[data-local-state]")?.textContent || "",
  hasNoAutoPostWarning: /不会自动发 Facebook\/TikTok|No conecta con Meta Graph API|No conecta con TikTok Content Posting API/.test(document.body.innerText),
  facebookCopyLength: document.querySelector("[data-copy-facebook]")?.value.length || 0,
  tiktokCopyLength: document.querySelector("[data-copy-tiktok]")?.value.length || 0,
  whatsappCopyLength: document.querySelector("[data-copy-whatsapp]")?.value.length || 0,
  bannerCopyLength: document.querySelector("[data-copy-banner]")?.value.length || 0,
  tokenLeakText: /access_token|Page Access Token|sk-/.test(document.body.innerText)
}));

await page.click("[data-approve]");
const approved = await page.locator("[data-local-state]").textContent();
await page.click("[data-reject]");
const rejected = await page.locator("[data-local-state]").textContent();
await page.click("[data-copy-all]");
const copyStatus = await page.locator("[data-action-status]").textContent();

await page.screenshot({ path: screenshotPath, fullPage: true });
await browser.close();

const result = {
  generatedAt: new Date().toISOString(),
  url: `${base}/admin/marketing-drafts/`,
  httpStatus: response?.status() || null,
  errors,
  before,
  approved,
  rejected,
  copyStatus,
  screenshotPath
};

await fs.writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
