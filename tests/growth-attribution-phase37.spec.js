const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4175';

test.describe('HAODE growth attribution phase 37', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    }));
    await page.route('https://www.google-analytics.com/**', (route) => route.fulfill({ status: 204, body: '' }));
  });

  test('App queues tracked WhatsApp and App-open events', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({
        version: 1,
        analytics: true,
        advertising: false,
      }));
    });
    await page.goto(
      `${baseURL}/app/?utm_source=facebook&utm_medium=organic_social&utm_campaign=mayoreo_julio&utm_content=video_1#inicio`,
      { waitUntil: 'domcontentloaded' },
    );
    await page.waitForFunction(() => window.HaodeAnalytics && window.HaodeCampaign);

    const result = await page.evaluate(() => {
      const clickWithoutNavigation = (link) => {
        link.addEventListener('click', (event) => event.preventDefault(), { once: true });
        link.click();
      };
      clickWithoutNavigation(document.querySelector('a[href*="wa.me"]'));

      const appLink = document.createElement('a');
      appLink.href = '/app/#lista';
      document.body.appendChild(appLink);
      clickWithoutNavigation(appLink);

      const events = window.dataLayer
        .map((entry) => Array.from(entry))
        .filter((entry) => entry[0] === 'event')
        .map((entry) => ({ name: entry[1], parameters: entry[2] }));
      return {
        measurementId: window.HaodeAnalytics.measurementId,
        reference: window.HaodeCampaign.reference(window.HaodeCampaign.capture()),
        events,
      };
    });

    expect(result.measurementId).toBe('G-22TCLJDXYS');
    expect(result.reference).toBe('facebook/mayoreo_julio/video_1');
    expect(result.events.map(({ name }) => name)).toEqual(
      expect.arrayContaining(['contact', 'app_open']),
    );
    expect(result.events.map(({ name }) => name)).not.toContain('whatsapp_click');
    expect(result.events.find(({ name }) => name === 'contact').parameters)
      .toMatchObject({
        source: 'facebook',
        campaign: 'mayoreo_julio',
        campaign_reference: 'facebook/mayoreo_julio/video_1',
      });
  });

  test('campaign attribution survives a new session for up to 30 days', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('haode-privacy-consent-v1', JSON.stringify({
        version: 1,
        analytics: true,
        advertising: false,
      }));
    });
    await page.goto(
      `${baseURL}/productos/?utm_source=instagram&utm_medium=organic_social&utm_campaign=pantallas&utm_content=reel_2`,
      { waitUntil: 'domcontentloaded' },
    );
    await page.waitForFunction(() => window.HaodeCampaign);
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`${baseURL}/categoria/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.HaodeCampaign);

    const attribution = await page.evaluate(() => window.HaodeCampaign.capture());
    expect(attribution).toMatchObject({
      source: 'instagram',
      medium: 'organic_social',
      campaign: 'pantallas',
      content: 'reel_2',
      landingPage: '/productos/',
    });
  });

  test('untracked Google search traffic is classified as organic search', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto(`${baseURL}/productos/`, {
      referer: 'https://www.google.com/search?q=pantallas+celular+mayoreo+mexico',
      waitUntil: 'domcontentloaded',
    });
    await page.waitForFunction(() => window.HaodeCampaign);

    const attribution = await page.evaluate(() => window.HaodeCampaign.capture());
    expect(attribution).toMatchObject({
      source: 'google',
      medium: 'organic_search',
      landingPage: '/productos/',
    });
  });

  test('shared product pages activate analytics and decorate WhatsApp', async ({ page }) => {
    await page.goto(
      `${baseURL}/producto.html?id=iphone-incell-14&utm_source=google_business&utm_medium=organic&utm_campaign=iphone_14&utm_content=perfil`,
      { waitUntil: 'domcontentloaded' },
    );
    await page.waitForFunction(() => window.HaodeAnalytics && window.HaodeCampaign);
    const whatsapp = page.getByRole('link', { name: /Cotizar modelo por WhatsApp/i }).first();
    await expect(whatsapp).toBeVisible();
    await expect.poll(async () => {
      const href = await whatsapp.getAttribute('href');
      return new URL(href).searchParams.get('text') || '';
    }).toContain('Origen: google_business/iphone_14/perfil');
  });
});
