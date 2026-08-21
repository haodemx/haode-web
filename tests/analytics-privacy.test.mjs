import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED_ANALYTICS_PATTERN = /<script\b[^>]*src=["'][^"']*\/analytics\.js\?v=20260813-ga4-conversions["'][^>]*><\/script>/i;
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

function configuredPageLocation(href) {
  const location = new URL(href);
  const dataLayer = [];
  const context = {
    URL,
    CustomEvent: class CustomEvent {},
    console,
    window: {
      dataLayer,
      location,
      localStorage: { getItem: () => null, setItem: () => {} },
      dispatchEvent: () => {},
      document: {
        readyState: 'loading',
        addEventListener: () => {},
        querySelector: () => null,
        createElement: () => ({ setAttribute: () => {} }),
        head: { appendChild: () => {} },
      },
    },
  };
  vm.runInNewContext(readFile('analytics.js'), context, { filename: 'analytics.js' });
  const config = dataLayer.find((entry) => entry[0] === 'config');
  return config?.[2]?.page_location;
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
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

test('analytics defaults storage to denied and gates the Google tag on consent', () => {
  const analytics = fs.readFileSync(path.join(ROOT, 'analytics.js'), 'utf8');
  const consentDefault = analytics.indexOf('global.gtag("consent", "default"');
  const loader = analytics.indexOf('loader.src = `https://www.googletagmanager.com/gtag/js');
  assert.ok(consentDefault >= 0, 'Missing Consent Mode default command');
  assert.ok(loader > consentDefault, 'Google tag loads before consent defaults');
  assert.match(analytics, /if \(!currentConsent\.analytics && !currentConsent\.advertising\) return;/);
  assert.match(analytics, /ensureGoogleTagLoaded\(\);/);
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
  assert.match(generator, /analytics\.js\?v=20260813-ga4-conversions/);
  assert.doesNotMatch(generator, /googletagmanager\.com\/gtag\/js\?id=G-22TCLJDXYS/);
});

test('GA4 page location keeps external attribution in standard channel formats', () => {
  assert.equal(
    configuredPageLocation('https://haode.com.mx/productos/?utm_source=facebook&utm_medium=organic_social&utm_campaign=agosto'),
    'https://haode.com.mx/productos/?utm_source=facebook&utm_medium=social&utm_campaign=agosto',
  );
});

test('GA4 page location removes internal campaign tags that restart sessions', () => {
  assert.equal(
    configuredPageLocation('https://haode.com.mx/app/?utm_source=haode_website&utm_medium=owned_web&utm_campaign=interno#lista'),
    'https://haode.com.mx/app/',
  );
  assert.equal(
    configuredPageLocation('https://haode.com.mx/productos/?utm_source=haode_app&utm_medium=owned_app&utm_campaign=interno'),
    'https://haode.com.mx/productos/',
  );
});
