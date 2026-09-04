import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../style.css',import.meta.url),'utf8');
test('audited small orange text and brand-band button have dedicated accessible colors',()=>{
  assert.match(css,/body\.home-page-reference \.home-hl-brand-band \.section-kicker\s*\{\s*color: #b9470a;/);
  assert.match(css,/body\.home-page-reference \.home-hl-brand-band \.reference-btn-solid\s*\{\s*border-color: #b9470a;\s*background: #b9470a;/);
  assert.match(css,/\.high-end-seo-card a\s*\{[^}]*color: #b9470a;/);
});
test('detail header app accessible label contains its visible action verbatim',()=>{
  const script=readFileSync(new URL('../detail-header.js',import.meta.url),'utf8');
  assert.match(script,/app\.setAttribute\('aria-label', 'Comprar en APP HAODE'\)/);
});
test('App loading layout contains margins and keeps the directory below the desktop viewport',()=>{
  const appCss=readFileSync(new URL('../app/app.css',import.meta.url),'utf8');
  assert.match(appCss,/\.app-shell\s*\{[^}]*display: flow-root;/);
  assert.match(appCss,/\[data-view-root\]\s*\{\s*display: flow-root;\s*min-height: 100dvh;/);
});
