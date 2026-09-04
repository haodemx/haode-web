import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../style.css',import.meta.url),'utf8');
test('audited small orange text and brand-band button have dedicated accessible colors',()=>{
  assert.match(css,/body\.home-page-reference \.home-hl-brand-band \.section-kicker\s*\{\s*color: #b9470a;/);
  assert.match(css,/body\.home-page-reference \.home-hl-brand-band \.reference-btn-solid\s*\{\s*border-color: #b9470a;\s*background: #b9470a;/);
  assert.match(css,/\.high-end-seo-card a\s*\{[^}]*color: #b9470a;/);
});
test('detail header accessible labels contain their visible action verbatim',()=>{
  const script=readFileSync(new URL('../detail-header.js',import.meta.url),'utf8');
  assert.match(script,/whatsapp\.setAttribute\('aria-label', 'WhatsApp privado[^']*'/);
  assert.match(script,/app\.setAttribute\('aria-label', 'Comprar en APP[^']*'/);
  assert.match(script,/<span>WhatsApp privado<\/span>/);
  assert.match(script,/<span>Comprar en APP<\/span>/);
});
test('post-deploy accessibility findings remain fixed',()=>{
  assert.match(css,/body\.category-page\[data-screen-seo-page\][\s\S]*?small \{\s*color: #5d626c !important;/);
  assert.match(css,/body\.seo-conversion-page\[data-screen-seo-page\]:not\(\.category-page\)[\s\S]*?small \{\s*color: #c9cccd !important;/);
  assert.match(css,/body\.seo-conversion-page \.section-kicker,[\s\S]*?color: #b9470a;/);
  const samsungTipoOriginal=readFileSync(new URL('../categoria/samsung-tipo-original/index.html',import.meta.url),'utf8');
  assert.doesNotMatch(samsungTipoOriginal,/<h3>Galaxy Ultra<\/h3>/);
});
test('App loading layout contains margins and keeps the directory below the desktop viewport',()=>{
  const appCss=readFileSync(new URL('../app/app.css',import.meta.url),'utf8');
  assert.match(appCss,/\.app-shell\s*\{[^}]*display: flow-root;/);
  assert.match(appCss,/\[data-view-root\]\s*\{\s*display: flow-root;\s*min-height: 100dvh;/);
});
