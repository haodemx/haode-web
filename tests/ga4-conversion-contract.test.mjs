import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), "utf8");

test("one WhatsApp action emits one configured contact key event", () => {
  const campaign = read("campaign-attribution.js");
  assert.match(campaign, /HaodeAnalytics\?\.event\?\.\("contact"/);
  assert.doesNotMatch(campaign, /["']whatsapp_click["']/);
});

test("all custom events use the consent-aware analytics entrypoint", () => {
  const analytics = read("analytics.js");
  const campaign = read("campaign-attribution.js");
  const app = read("app", "app.js");
  const homepage = read("script.js");
  const catalog = read("products.js");

  assert.match(analytics, /event\(name, parameters = \{\}\) \{\s*if \(!currentConsent\.analytics\) return false;/);
  assert.match(campaign, /HaodeAnalytics\?\.event\?\.\("contact"/);
  assert.match(app, /window\.HaodeAnalytics\?\.event\?\.\(name, parameters\)/);
  assert.match(homepage, /window\.HaodeAnalytics\?\.event\?\.\(eventName, params\)/);
  assert.match(catalog, /window\.HaodeAnalytics\?\.event\?\.\(eventName, params\)/);
});

test("App sends the recommended GA4 ecommerce funnel with item data", () => {
  const app = read("app", "app.js");

  assert.match(app, /trackGrowthEvent\("view_item", \{[\s\S]*?items:/);
  assert.match(app, /trackGrowthEvent\("view_cart", \{[\s\S]*?items:/);
  assert.match(app, /trackGrowthEvent\("add_to_cart", \{[\s\S]*?items:/);
  assert.match(app, /trackGrowthEvent\("begin_checkout", \{[\s\S]*?items:/);
  assert.match(app, /trackGrowthEvent\("generate_lead", \{[\s\S]*?items:/);
  assert.match(app, /item_brand: "HAODE"/);
  assert.match(app, /quantity:/);
  assert.match(app, /price:/);
});
