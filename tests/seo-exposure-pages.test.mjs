import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://haode.com.mx";
const pages = [
  "pantallas-iphone-incell-mayoreo-mexico",
  "pantallas-iphone-oled-mayoreo-mexico",
  "pantallas-samsung-incell-mayoreo-mexico",
  "pantallas-samsung-zflip-zfold-original-mexico",
  "fundas-celular-mayoreo-mexico",
  "micas-hidrogel-mayoreo-mexico",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1].trim()));
}

test("new SEO exposure pages are indexable, tracked and connected to WhatsApp", () => {
  for (const slug of pages) {
    const html = read(`${slug}/index.html`);
    const url = `${SITE_URL}/${slug}/`;
    const graph = jsonLdBlocks(html).flatMap((block) => block["@graph"] || [block]);

    assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), `${slug} missing canonical`);
    assert.ok(html.includes('meta name="robots" content="index,follow'), `${slug} is not indexable`);
    assert.ok(html.includes("utm_source=seo"), `${slug} missing tracked App CTA`);
    assert.ok(html.includes("wa.me/525645866014"), `${slug} missing WhatsApp CTA`);
    assert.ok(graph.some((node) => node["@type"] === "CollectionPage"), `${slug} missing CollectionPage schema`);
    assert.ok(graph.some((node) => node["@type"] === "FAQPage"), `${slug} missing FAQPage schema`);
    assert.ok(/disponibilidad|stock|precio final/i.test(html), `${slug} should keep confirmation language`);
  }
});

test("new SEO exposure pages are discoverable from sitemap, llms and core routes", () => {
  const sitemap = read("sitemap.xml");
  const llms = read("llms.txt");
  const home = read("index.html");
  const products = read("productos/index.html");

  for (const slug of pages) {
    const route = `/${slug}/`;
    const url = `${SITE_URL}${route}`;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${route}`);
    assert.ok(llms.includes(url), `llms missing ${route}`);
    assert.ok(home.includes(route) || products.includes(route), `core routes missing ${route}`);
  }
});
