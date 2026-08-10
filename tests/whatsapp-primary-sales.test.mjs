import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PRIMARY_PHONE = '523326684296';
const FORMER_PRIMARY_PHONE = '525645866014';
const SALES_PHONES = [
  PRIMARY_PHONE,
  '525531881173',
  '525576710941',
  '525574387940',
  '525523316745',
  '525645866014',
];
const SKIP_DIRS = new Set(['.git', 'node_modules', 'preview', 'playwright-report', 'test-results']);

function collectCustomerFiles(dir = ROOT, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCustomerFiles(fullPath, files);
      continue;
    }
    const relativePath = path.relative(ROOT, fullPath);
    const isHtml = entry.name.endsWith('.html');
    const isMarketingJson = relativePath.startsWith(`data${path.sep}marketing${path.sep}`) && entry.name.endsWith('.json');
    if (isHtml || isMarketingJson) files.push(fullPath);
  }
  return files;
}

test('all customer-facing quote links use the new primary WhatsApp number', () => {
  const oldLinks = [];
  let formerPrimaryLinks = 0;
  let newPrimaryLinks = 0;

  for (const file of collectCustomerFiles()) {
    const relativePath = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    const oldCount = content.match(new RegExp(`wa\\.me/${FORMER_PRIMARY_PHONE}`, 'g'))?.length || 0;
    formerPrimaryLinks += oldCount;
    if (oldCount && relativePath !== 'index.html') oldLinks.push(relativePath);
    newPrimaryLinks += content.match(new RegExp(`wa\\.me/${PRIMARY_PHONE}`, 'g'))?.length || 0;
  }

  assert.equal(oldLinks.length, 0, oldLinks.join('\n'));
  assert.equal(formerPrimaryLinks, 1, 'the former primary line must remain only once as a footer backup');
  assert.ok(newPrimaryLinks > 500, `Expected broad primary-number coverage, found ${newPrimaryLinks}`);
});

test('homepage header and Contacto footer identify the primary line and all six sales numbers', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0] || '';
  const contact = html.match(/<address\b[^>]*class=["'][^"']*reference-footer-contact[^"']*["'][^>]*>[\s\S]*?<\/address>/i)?.[0] || '';

  assert.match(header, /<small>33 2668 4296<\/small>/i);
  assert.match(contact, /WhatsApp principal/i);
  for (const phone of SALES_PHONES) {
    assert.match(contact, new RegExp(`https://wa\\.me/${phone}(?:\\?|["'])`));
  }
});
