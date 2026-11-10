import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../campaign-attribution.js', import.meta.url), 'utf8');
function harness(search, consent = true, referrer = '', readyState = 'loading') {
  const makeStorage = () => { const data = new Map(); return {getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k)}; };
  const window = {
    location: {search, pathname: '/categoria/oled-diagnostica/', origin: 'https://haode.com.mx'},
    document: {referrer, readyState, addEventListener() {}, querySelectorAll: () => []},
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

test('search and AI referrers keep distinct source, medium and host', () => {
  for (const [referrer, source, medium] of [
    ['https://www.google.com/search?q=haode', 'google', 'organic_search'],
    ['https://www.bing.com/search?q=haode', 'bing', 'organic_search'],
    ['https://chatgpt.com/c/abc', 'chatgpt', 'ai_referral'],
    ['https://www.perplexity.ai/search/haode', 'perplexity', 'ai_referral'],
    ['https://gemini.google.com/app/abc', 'gemini', 'ai_referral'],
    ['https://copilot.microsoft.com/chats/abc', 'copilot', 'ai_referral'],
    ['https://claude.ai/chat/abc', 'claude', 'ai_referral']
  ]) {
    const result = harness('', true, referrer).HaodeCampaign.capture();
    assert.equal(result.source, source, referrer);
    assert.equal(result.medium, medium, referrer);
    assert.equal(result.referrerHost, new URL(referrer).hostname.replace(/^www\./, ''), referrer);
  }
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

test('an organic arrival keeps its original page and source through an old tagged App link', () => {
  const w = harness('', true, 'https://www.google.com/', 'complete');
  w.location.pathname = '/app/';
  w.location.search = '?utm_source=seo&utm_medium=organic&utm_campaign=iphone_mayoreo&utm_content=landing_cta';
  w.document.referrer = 'https://haode.com.mx/categoria/oled-diagnostica/';
  const result = w.HaodeCampaign.capture({channel: 'haode_app'});
  assert.equal(result.source, 'google');
  assert.equal(result.landingPage, '/categoria/oled-diagnostica/');
});

test('own-site navigation with no prior attribution does not create a referral', () => {
  const w = harness('', true, 'https://haode.com.mx/productos/');
  assert.equal(w.HaodeCampaign.capture().source, 'direct');
});

test('a Google or ChatGPT arrival replaces old direct or internal SEO attribution', () => {
  for (const previous of [{ source: 'direct' }, { source: 'seo', medium: 'organic', content: 'landing_cta' }]) {
    for (const [referrer, expected] of [['https://www.google.com.mx/', 'google'], ['https://chatgpt.com/', 'chatgpt']]) {
      const w = harness('', true, referrer);
      w.sessionStorage.setItem('haode-campaign-attribution-v1', JSON.stringify({ ...previous, landingPage: '/app/' }));
      const result = w.HaodeCampaign.capture();
      assert.equal(result.source, expected);
      assert.equal(result.landingPage, '/categoria/oled-diagnostica/');
    }
  }
});

test('an external campaign on an App link still takes precedence', () => {
  const w = harness('');
  w.location.pathname = '/app/';
  w.location.search = '?utm_source=facebook&utm_medium=organic_social&utm_campaign=test';
  assert.equal(w.HaodeCampaign.capture({channel: 'haode_app'}).source, 'facebook');
});

test('ChatGPT domain tags and previously stored domain aliases use the same source', () => {
  for (const domain of ['chatgpt.com', 'chat.openai.com']) {
    const w = harness(`?utm_source=${domain}`);
    const tagged = w.HaodeCampaign.capture();
    assert.equal(tagged.source, 'chatgpt');
    assert.equal(tagged.medium, 'ai_referral');
    w.location.search = '';
    w.sessionStorage.setItem('haode-campaign-attribution-v1', JSON.stringify({ source: domain.replaceAll('.', '_'), medium: 'campaign' }));
    const stored = w.HaodeCampaign.capture();
    assert.equal(stored.source, 'chatgpt');
    assert.equal(stored.medium, 'ai_referral');
  }
});
