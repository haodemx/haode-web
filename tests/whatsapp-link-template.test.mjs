import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const WHATSAPP_PHONE = '525645866014';
const SKIP_DIRS = new Set(['.git', 'node_modules', 'playwright-report', 'test-results']);

function collectFiles(dir = ROOT, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT, fullPath);
    if (relativePath.startsWith(`data${path.sep}backups${path.sep}`)) continue;
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }
    const isStaticHtml = entry.isFile() && entry.name.endsWith('.html');
    const isMarketingJson = entry.isFile() && relativePath.startsWith(`data${path.sep}marketing${path.sep}`) && entry.name.endsWith('.json');
    if (isStaticHtml || isMarketingJson) files.push(fullPath);
  }
  return files;
}

function decodedWhatsappText(encodedText = '') {
  return decodeURIComponent(encodedText.replace(/\+/g, '%20'));
}

test('static HAODE WhatsApp links ask for quote details before opening chat', () => {
  const whatsappUrlPattern = new RegExp(`https://wa\\.me/${WHATSAPP_PHONE}(?:\\?text=([^"'<>\\s]+))?`, 'g');
  const missing = [];
  let total = 0;

  for (const file of collectFiles()) {
    const relativePath = path.relative(ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(whatsappUrlPattern)) {
      total += 1;
      const message = decodedWhatsappText(match[1] || '');
      const hasCompletePrompt = [
        /stock en M[eé]xico/i,
        /precio por cantidad/i,
        /garant[ií]a local/i,
        /env[ií]o/i,
      ].every((pattern) => pattern.test(message));
      if (!hasCompletePrompt) {
        missing.push(`${relativePath}: ${message.slice(0, 120) || '(sin texto)'}`);
      }
    }
  }

  assert.equal(missing.length, 0, missing.join('\n'));
  assert.ok(total > 500, `Expected broad WhatsApp coverage, found ${total}`);
});
