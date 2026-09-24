import fs from 'node:fs';
import crypto from 'node:crypto';
import { ROOT, readPublicProducts, buildFeed } from './build-chatgpt-product-feed.mjs';
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const report = { checked_at: new Date().toISOString(), method: 'Unauthenticated public GET/HEAD only; no private ERP access', sources: [], product_projection_differences: [], feed_projection_differences: [], urls: [] };
for (const url of ['https://haode.com.mx/data/products.generated.js', 'https://erp.haode.com.mx/api/public/catalog', 'https://erp.haode.com.mx/public-stock.json']) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const text = await response.text();
    const source = { url, status: response.status, body_sha256: sha(text) };
    if (url.endsWith('.js')) {
      const products = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
      source.count = products.length;
      source.public_fields = Object.keys(products[0] || {});
      const byId = new Map(products.map(p => [p.id, p]));
      for (const p of readPublicProducts()) {
        const current = byId.get(p.id);
        const fields = ['id', 'name', 'category', 'images'].filter(key => JSON.stringify(p[key]) !== JSON.stringify(current?.[key]));
        if (fields.length) report.product_projection_differences.push({ id: p.id, fields });
        const feedFields = fields.filter(key => key !== 'images');
        if (p.images?.[0] !== current?.images?.[0]) feedFields.push('main_image');
        if (feedFields.length) report.feed_projection_differences.push({ id: p.id, fields: feedFields });
      }
    } else {
      const data = JSON.parse(text);
      const products = Array.isArray(data) ? data : data.products || [];
      source.count = products.length;
      source.public_fields = Object.keys(products[0] || {});
    }
    report.sources.push(source);
  } catch (error) { report.sources.push({ url, status: 'UNVERIFIED', error: error.message }); }
}
const feed = buildFeed();
const campaigns = JSON.parse(fs.readFileSync(`${ROOT}/data/marketing/chatgpt-launch-pack.json`));
const urls = [...new Set([...feed.items.flatMap(p => [p.link, p.image_link].filter(Boolean)), ...campaigns.campaigns.map(c => c.landing_page), 'https://haode.com.mx/'])];
let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < urls.length) {
    const url = urls[index++];
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(20000) });
      report.urls.push({ url, status: response.status, final_url: response.url, content_type: response.headers.get('content-type') });
    } catch (error) { report.urls.push({ url, status: 'UNVERIFIED', error: error.message }); }
  }
}));
report.urls.sort((a,b) => a.url.localeCompare(b.url));
report.summary = { urls: report.urls.length, non_200: report.urls.filter(u => u.status !== 200).length, product_projection_differences: report.product_projection_differences.length, feed_projection_differences: report.feed_projection_differences.length };
fs.writeFileSync(`${ROOT}/docs/chatgpt-ads/public-source-audit.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ sources: report.sources, summary: report.summary, differences: report.product_projection_differences }));
