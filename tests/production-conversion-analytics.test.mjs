import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analyticsSource = fs.readFileSync(path.join(ROOT, "analytics.js"), "utf8");

function harness(href, consent = { analytics: true, advertising: true }) {
  const handlers = new Map();
  const appended = [];
  const dataLayer = [];
  const location = new URL(href);
  const window = {
    dataLayer,
    location,
    localStorage: {
      getItem: () => JSON.stringify({ version: 1, ...consent }),
      setItem: () => {}
    },
    dispatchEvent: () => {},
    addEventListener(name, listener) {
      handlers.set(name, listener);
    },
    document: {
      currentScript: { src: `${location.origin}/analytics.js` },
      readyState: "loading",
      addEventListener: () => {},
      querySelector: () => null,
      createElement: () => ({ setAttribute: () => {}, addEventListener: () => {} }),
      head: { appendChild(node) { appended.push(node); } }
    }
  };
  vm.runInNewContext(analyticsSource, {
    window,
    URL,
    Date,
    CustomEvent: class CustomEvent {
      constructor(name, options) {
        this.type = name;
        this.detail = options?.detail;
      }
    }
  }, { filename: "analytics.js" });
  return {
    window,
    dataLayer,
    appended,
    emitConversion(detail) {
      handlers.get("haode:conversion")?.({ detail });
    }
  };
}

test("production sends exact conversion events with only allowlisted attribution fields", () => {
  const h = harness("https://haode.com.mx/producto/mica-hd/");
  h.emitConversion({
    event: "WhatsAppClick",
    event_id: "2d739914-f6e2-4470-bc6e-5b9d87110038",
    source: "chatgpt",
    medium: "ai_referral",
    campaign: "pilot",
    utm_source: "chatgpt",
    utm_medium: "ai_referral",
    utm_campaign: "pilot",
    landing_page: "/producto/mica-hd/",
    page_path: "/producto/mica-hd/",
    referrer_host: "chatgpt.com",
    product_id: "mica-hd",
    product_sku: "MICA-HD-001",
    contact_area: "product",
    customer_phone: "5512345678",
    email: "private@example.com"
  });

  const call = h.dataLayer.find((entry) => entry[0] === "event" && entry[1] === "WhatsAppClick");
  assert.ok(call, "exact WhatsAppClick event was not sent");
  assert.deepEqual({ ...call[2] }, {
    event_id: "2d739914-f6e2-4470-bc6e-5b9d87110038",
    source: "chatgpt",
    medium: "ai_referral",
    campaign: "pilot",
    utm_source: "chatgpt",
    utm_medium: "ai_referral",
    utm_campaign: "pilot",
    landing_page: "/producto/mica-hd/",
    page_path: "/producto/mica-hd/",
    referrer_host: "chatgpt.com",
    product_id: "mica-hd",
    product_sku: "MICA-HD-001",
    contact_area: "product"
  });
  assert.equal(JSON.stringify(call).includes("private"), false);
  assert.ok(h.appended.some((node) => String(node.src).includes("googletagmanager.com/gtag/js")));
});

test("localhost and staging never configure, load, or send GA4", () => {
  for (const href of ["http://localhost:8080/producto/mica-hd/", "https://staging.haode.com.mx/producto/mica-hd/"]) {
    const h = harness(href);
    h.window.HaodeAnalytics.event("Lead", { event_id: "safe-id" });
    h.emitConversion({ event: "Lead", event_id: "safe-id", lead_registered: true });
    assert.equal(h.dataLayer.some((entry) => entry[0] === "config"), false, href);
    assert.equal(h.dataLayer.some((entry) => entry[0] === "event"), false, href);
    assert.equal(h.appended.some((node) => String(node.src).includes("googletagmanager.com/gtag/js")), false, href);
  }
});
