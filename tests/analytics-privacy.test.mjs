import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED_ANALYTICS_PATTERN = /<script\b[^>]*src=["'][^"']*\/analytics\.js\?v=20260803-consent-privacy["'][^>]*><\/script>/i;
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'overnight-previews', 'playwright-report', 'test-results']);

function collectFiles(directory = ROOT, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath, files);
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

test('HTML pages do not initialize GA before HAODE consent defaults', () => {
  const unsafeFiles = [];
  for (const file of collectFiles()) {
    const html = fs.readFileSync(file, 'utf8');
    if (/googletagmanager\.com\/gtag\/js\?id=G-22TCLJDXYS/i.test(html)) {
      unsafeFiles.push(path.relative(ROOT, file));
      continue;
    }
    if (/G-22TCLJDXYS/.test(html) && /gtag\s*\(\s*['"]config['"]/i.test(html)) {
      unsafeFiles.push(path.relative(ROOT, file));
    }
  }
  assert.deepEqual(unsafeFiles, []);
});

test('every product route loads the consent-aware analytics entrypoint', () => {
  const productDirectory = path.join(ROOT, 'producto');
  const missing = collectFiles(productDirectory)
    .filter((file) => path.basename(file) === 'index.html')
    .filter((file) => !SHARED_ANALYTICS_PATTERN.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(missing, []);
});

test('analytics defaults storage to denied before loading Google tag', () => {
  const analytics = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
  const consentDefault = analytics.indexOf('global.gtag("consent", "default"');
  const loader = analytics.indexOf('loader.src = `https://www.googletagmanager.com/gtag/js');
  assert.ok(consentDefault >= 0, 'Missing Consent Mode default command');
  assert.ok(loader > consentDefault, 'Google tag loads before consent defaults');
  assert.match(analytics, /analytics_storage: choice\.analytics \? "granted" : "denied"/);
  assert.match(analytics, /ad_user_data: choice\.advertising \? "granted" : "denied"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /page_location: analyticsPageLocation\(\)/);
});

test('campaign attribution persists only after analytics consent', () => {
  const campaign = fs.readFileSync(path.join(ROOT, 'campaign-attribution.js'), 'utf8');
  assert.match(campaign, /function hasAnalyticsConsent\(\)/);
  assert.match(campaign, /if \(!hasAnalyticsConsent\(\)\) return \{\};/);
  assert.match(campaign, /if \(!hasAnalyticsConsent\(\)\) return;/);
  assert.match(campaign, /clearStoredAttribution\(\)/);
});

test('cart keeps customer data out of the tracked WhatsApp anchor', () => {
  const app = fs.readFileSync(path.join(ROOT, 'app', 'app.js'), 'utf8');
  assert.match(app, /whatsappLinkEl\.href = customerReady \? whatsappBaseUrl\(\) : "#"/);
  assert.doesNotMatch(app, /whatsappLinkEl\.href = customerReady \? buildWhatsappUrl\(\)/);
  assert.doesNotMatch(app, /trackGrowthEvent\("generate_lead",[\s\S]*?order_number\s*:/);
  assert.match(app, /lead_registered: Boolean\(result\.order_number\)/);
});

test('future generated product pages use the consent-aware entrypoint', () => {
  const generator = fs.readFileSync(path.join(ROOT, 'scripts', 'sync-customer-prices.js'), 'utf8');
  assert.match(generator, /analytics\.js\?v=20260803-consent-privacy/);
  assert.doesNotMatch(generator, /googletagmanager\.com\/gtag\/js\?id=G-22TCLJDXYS/);
});
