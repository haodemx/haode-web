import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { prepareOpenAIEvent } from '../scripts/chatgpt-event-mapping.mjs';
const source = fs.readFileSync(new URL('../conversion-tracking.js', import.meta.url), 'utf8');
function harness({ consent = { analytics: true, advertising: true }, search = '', stored = new Map(), restricted = false } = {}) {
  const handlers = {};
  const window = {
    location: { pathname: '/producto/mica-hd/', hash: '', search, href: `https://haode.com.mx/producto/mica-hd/${search}` },
    document: { referrer: 'https://chatgpt.com/', addEventListener(name, fn) { handlers[`document:${name}`] = fn; } },
    HaodePrivacy: { getConsent: () => consent },
    sessionStorage: { getItem(k) { if (restricted) throw Error('denied'); return stored.get(k); }, setItem(k, v) { if (restricted) throw Error('denied'); stored.set(k, v); }, removeItem(k) { if (restricted) throw Error('denied'); stored.delete(k); } },
    crypto: { randomUUID: () => crypto.randomUUID() },
    addEventListener(name, fn) { handlers[name] = fn; }, dispatchEvent() {}
  };
  vm.runInNewContext(source, { window, URL, URLSearchParams, Date, CustomEvent: class { constructor(name, options) { this.type=name; this.detail=options.detail; } } });
  return { api: window.HaodeConversions, window, stored, handlers, changeConsent(next) { consent=next; handlers['haode:privacy-consent'](); } };
}
const id = 'a1234567-1234-4321-8234-123456789abc';

test('unknown events and Purchase never produce an event', () => {
  const h = harness();
  assert.equal(h.api.track('SecretEvent', {}).reason, 'event_not_allowed');
  assert.equal(h.api.track('Purchase', { paid: true, amount: 1 }).reason, 'purchase_not_configured');
  assert.equal(h.api.getEvents().length, 0);
});

test('requires BOTH consent choices; denial never queues or persists; withdrawal clears', () => {
  for (const consent of [{ analytics: false, advertising: false }, { analytics: true, advertising: false }, { analytics: false, advertising: true }]) {
    const h = harness({ consent, search: '?utm_source=chatgpt' });
    assert.equal(h.api.track('WhatsAppClick').reason, 'consent_required');
    assert.equal(h.stored.size, 0);
    h.changeConsent({ analytics: true, advertising: true });
    assert.equal(h.api.getEvents().length, 0);
    assert.equal(h.api.track('WhatsAppClick').accepted, true);
    h.changeConsent({ analytics: false, advertising: false });
    assert.equal(h.api.getEvents().length, 0);
    assert.equal(h.stored.size, 0);
  }
});

test('allowlist strips customer payload and URLs, preserves all campaign tokens across navigation', () => {
  const h = harness({ search: '?utm_source=chatgpt&utm_medium=paid&utm_campaign=pilot&utm_content=ad_v1&utm_term=hydrogel&email=private@example.com' });
  const result = h.api.track('ViewProduct', { product_id: 'mica-hd', customer_name: 'Private Name', email: 'private@example.com', href: 'https://wa.me/?text=private', value: 900 });
  assert.equal(result.event.utm_term, 'hydrogel');
  assert.equal(result.event.source, 'chatgpt');
  assert.equal(JSON.stringify(result).includes('private'), false);
  assert.equal('value' in result.event, false);
  const next = harness({ stored: h.stored });
  assert.equal(next.api.track('WhatsAppClick').event.utm_campaign, 'pilot');
  const newer = harness({ stored: h.stored, search: '?utm_source=google&utm_campaign=new' });
  const event = newer.api.track('WhatsAppClick').event;
  assert.equal(event.source, 'google');
  assert.equal('utm_content' in event, false);
});

test('sensitive/invalid attribution is omitted and storage failures are safe', () => {
  const h = harness({ search: '?utm_source=user@example.com&utm_content=5512345678&utm_campaign=hello%20world', restricted: true });
  const event = h.api.track('ViewProduct', { product_id: 'mica-hd' }).event;
  assert.equal(event.utm_source, undefined);
  assert.equal(event.utm_content, undefined);
  assert.equal(event.utm_campaign, undefined);
  assert.equal(h.api.track('ViewProduct', { product_id: 'private@example.com' }).reason, 'product_required');
});

test('views and repeated clicks deduplicate; Lead requires success and UUID, survives reload', () => {
  const h = harness();
  assert.equal(h.api.viewProduct('mica-hd').accepted, true);
  assert.equal(h.api.viewProduct('mica-hd').reason, 'duplicate');
  assert.equal(h.api.track('WhatsAppClick').accepted, true);
  assert.equal(h.api.track('WhatsAppClick').reason, 'duplicate');
  assert.equal(h.api.track('Lead', { request_id: id, lead_registered: false }).reason, 'registered_lead_required');
  assert.equal(h.api.track('Lead', { request_id: 'order-123', lead_registered: true }).reason, 'registered_lead_required');
  assert.equal(h.api.track('Lead', { request_id: id, lead_registered: true }).accepted, true);
  const next = harness({ stored: h.stored });
  assert.equal(next.api.track('Lead', { request_id: id, lead_registered: true }).reason, 'duplicate');
});

test('OpenAI adapter prepares actual taxonomy, strips extras and blocks Purchase', () => {
  const h = harness();
  const view = prepareOpenAIEvent(h.api.viewProduct('mica-hd').event);
  assert.equal(view.name, 'contents_viewed');
  assert.equal(view.data.contents[0].id, 'mica-hd');
  const click = prepareOpenAIEvent(h.api.track('WhatsAppClick').event);
  assert.equal(click.options.custom_event_name, 'whatsapp_click');
  assert.equal(prepareOpenAIEvent({ event: 'Purchase', event_id: id }), null);
  assert.equal(prepareOpenAIEvent({ event: 'Lead', event_id: id, lead_registered: false }), null);
});

test('phone-like identifiers with separators never enter attribution', () => {
  for (const value of ['55-1234-5678', '55_1234_5678', 'prefix-55-1234-5678']) {
    const h = harness({ search: `?utm_content=${value}` });
    const result = h.api.track('WhatsAppClick');
    assert.equal(result.event.utm_content, undefined);
    assert.equal(JSON.stringify([...h.stored.values()]).includes(value), false);
  }
});

test('leaving a view resets context while rerendering the current view deduplicates', () => {
  const h = harness();
  h.api.viewProduct('mica-hd');
  assert.equal(h.api.viewProduct('mica-hd').reason, 'duplicate');
  h.api.viewProduct(null);
  assert.equal(h.api.viewProduct('mica-hd').accepted, true);
});

test('adapter and Lead API reject scalar coercion without throwing or leaking objects', () => {
  for (const invalid of [[id], { toString: () => id, phone: 'synthetic-private' }, 123, null]) {
    assert.equal(prepareOpenAIEvent({ event: 'WhatsAppClick', event_id: invalid }), null);
    assert.equal(harness().api.track('Lead', { request_id: invalid, lead_registered: true }).reason, 'registered_lead_required');
  }
  for (const invalid of [['mica-hd'], { toString: () => 'mica-hd' }, 123, null, 'a'.repeat(101)]) {
    assert.equal(prepareOpenAIEvent({ event: 'ViewProduct', event_id: id, product_id: invalid }), null);
  }
});
