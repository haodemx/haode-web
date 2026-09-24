import fs from 'node:fs';
import crypto from 'node:crypto';
import { ROOT, ORIGIN, buildFeed } from './build-chatgpt-product-feed.mjs';
const local = process.env.BASE_URL || 'http://127.0.0.1:4187';
const urls = [...fs.readFileSync(`${ROOT}/sitemap.xml`, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const report = { checked_at: new Date().toISOString(), scope: 'local worktree only', sitemap_urls: urls.length, pages: [], media: [], failures: [] };
if (new Set(urls).size !== urls.length) report.failures.push('duplicate sitemap URL');
let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < urls.length) {
    const url = urls[index++];
    const target = new URL(url);
    if (target.origin !== ORIGIN) { report.failures.push(`Unexpected sitemap origin ${url}`); continue; }
    const response = await fetch(`${local}${target.pathname}`, { signal: AbortSignal.timeout(10000) });
    const html = await response.text();
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1];
    const row = { url, status: response.status, canonical };
    report.pages.push(row);
    if (response.status !== 200 || canonical !== url) report.failures.push(row);
  }
}));
const sample = buildFeed().items.map(p => p.link).sort(() => crypto.randomInt(3) - 1).slice(0, 10);
report.sampled_products = sample;
const pages = ['/', '/categoria/iphone-incell/', '/categoria/samsung-oled/', '/categoria/micas/', '/categoria/maquinas-de-hidrogel/', ...sample.map(url => new URL(url).pathname)];
const media = new Set();
for (const page of pages) {
  const html = await (await fetch(`${local}${page}`)).text();
  if (!html.includes('wa.me/')) report.failures.push(`WhatsApp absent ${page}`);
  for (const match of html.matchAll(/(?:src|poster)=["']([^"']+\.(?:png|jpe?g|webp|svg|mp4)(?:\?[^"']*)?)["']/gi)) {
    const url = new URL(match[1], `${ORIGIN}${page}`);
    if (url.origin === ORIGIN) media.add(url.pathname);
  }
}
for (const file of media) {
  const response = await fetch(`${local}${file}`, { method: 'HEAD' });
  report.media.push({ path: file, status: response.status });
  if (response.status !== 200) report.failures.push(`Missing media ${file}`);
}
report.pages.sort((a,b) => a.url.localeCompare(b.url));
report.status = report.failures.length ? 'FAIL' : 'PASS';
fs.writeFileSync(`${ROOT}/docs/chatgpt-ads/local-qa.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, sitemap: urls.length, productSample: sample.length, media: media.size, failures: report.failures }));
if (report.failures.length) process.exitCode = 1;
