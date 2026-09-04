import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../campaign-attribution.js', import.meta.url), 'utf8');
function harness(search, consent = true) {
  const makeStorage = () => { const data = new Map(); return {getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k)}; };
  const window = {
    location: {search, pathname: '/categoria/oled-diagnostica/', origin: 'https://haode.com.mx'},
    document: {referrer: '', readyState: 'loading', addEventListener() {}},
    localStorage: makeStorage(), sessionStorage: makeStorage(), addEventListener() {},
    HaodePrivacy: {getConsent: () => ({analytics: consent})}
  };
  vm.runInNewContext(source, {window, URL, URLSearchParams});
  return window;
}

test('tagged keyword survives consented navigation to the App', () => {
  const w = harness('?utm_source=google&utm_medium=cpc&utm_term=Pantallas%20Diagn%C3%B3stico%20iPhone');
  assert.equal(w.HaodeCampaign.capture().term, 'pantallas_diagnostico_iphone');
  w.location.search = ''; w.location.pathname = '/app/';
  const result = w.HaodeCampaign.capture({channel: 'haode_app'});
  assert.equal(result.term, 'pantallas_diagnostico_iphone');
  assert.equal(result.landingPage, '/categoria/oled-diagnostica/');
});

test('a new campaign without a keyword clears the previous keyword', () => {
  const w = harness('?utm_source=google&utm_term=incell');
  w.HaodeCampaign.capture(); w.location.search = '?utm_source=instagram&utm_campaign=new';
  assert.equal(w.HaodeCampaign.capture().term, '');
});

for (const value of ['cliente@example.com', '+52 55 1234 5678', '5512345678']) {
  test(`sensitive keyword is not persisted: ${value}`, () => {
    const w = harness('?utm_term=' + encodeURIComponent(value));
    assert.equal(w.HaodeCampaign.capture().term, '');
    assert.ok(!w.localStorage.getItem('haode-campaign-attribution-v1').includes(value));
  });
}

test('no keyword is invented for an organic referral', () => {
  const w = harness(''); w.document.referrer = 'https://www.google.com/';
  assert.equal(w.HaodeCampaign.capture().term, '');
});

test('without consent a current keyword is not persisted across pages', () => {
  const w = harness('?utm_source=google&utm_term=oled', false);
  assert.equal(w.HaodeCampaign.capture().term, 'oled');
  assert.equal(w.localStorage.getItem('haode-campaign-attribution-v1'), null);
  assert.equal(w.sessionStorage.getItem('haode-campaign-attribution-v1'), null);
  w.location.search = '';
  assert.equal(w.HaodeCampaign.capture().term, '');
});

test('App fallback and ERP payload retain the same normalized field', () => {
  const app = fs.readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('term: normalizeAttributionToken(hasIncomingCampaign ? params.get("utm_term") : stored.term)'));
  assert.match(app, /utm_term: state\.attribution\.term/);
});
