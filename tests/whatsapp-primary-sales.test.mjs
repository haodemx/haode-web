import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PRIMARY_PHONE = '523326684296';
const LEGACY_SALES_PHONES = [
  '525531881173',
  '525576710941',
  '525574387940',
  '525523316745',
  '525645866014',
];
const SKIP_DIRS = new Set(['.git', '_site', 'node_modules', 'preview', 'playwright-report', 'test-results', 'tests', 'docs', 'reports']);

function collectCustomerFiles(dir = ROOT, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCustomerFiles(fullPath, files);
      continue;
    }
    const relativePath = path.relative(ROOT, fullPath);
    const isPublicSource = /\.(?:html|js|mjs|json|xml)$/.test(entry.name)
      || ['index.md', 'productos/index.md', 'contacto/index.md', 'garantia/index.md', 'guia-ia-haode-mexico/index.md', 'tienda-oficial-hl-cdmx/index.md', 'llms.txt'].includes(relativePath);
    const isMarketingJson = relativePath.startsWith(`data${path.sep}marketing${path.sep}`) && entry.name.endsWith('.json');
    if (isPublicSource || isMarketingJson) files.push(fullPath);
  }
  return files;
}

test('all customer-facing quote links use the owner-confirmed WhatsApp number', () => {
  const legacyLinks = [];
  let newPrimaryLinks = 0;

  for (const file of collectCustomerFiles()) {
    const relativePath = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    for (const phone of LEGACY_SALES_PHONES) {
      // Covers visible text, Schema, tel:, wa.me and generated fallback formats.
      const national = phone.slice(2).split('').join('[\\s().+\\-]*');
      if (new RegExp(national).test(content)) legacyLinks.push(`${relativePath}: ${phone}`);
    }
    newPrimaryLinks += content.match(new RegExp(`wa\\.me/${PRIMARY_PHONE}`, 'g'))?.length || 0;
  }

  assert.equal(legacyLinks.length, 0, legacyLinks.join('\n'));
  assert.ok(newPrimaryLinks > 500, `Expected broad primary-number coverage, found ${newPrimaryLinks}`);
});

test('homepage header and footer identify the one authoritative sales line', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0] || '';
  const contact = html.match(/<address\b[^>]*class=["'][^"']*reference-footer-contact[^"']*["'][^>]*>[\s\S]*?<\/address>/i)?.[0] || '';

  assert.match(header, new RegExp(`https://wa\\.me/${PRIMARY_PHONE}(?:\\?|["'])`));
  assert.match(contact, /Tel: \+52 33 2668 4296/i);
  assert.match(contact, new RegExp(`https://wa\\.me/${PRIMARY_PHONE}(?:\\?|["'])`));
  for (const phone of LEGACY_SALES_PHONES) assert.doesNotMatch(`${header}${contact}`, new RegExp(phone));
});
