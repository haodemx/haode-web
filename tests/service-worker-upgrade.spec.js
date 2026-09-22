const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:4173";

test("service worker replaces old HAODE caches without clearing site storage", async ({ page }) => {
  await page.goto(`${BASE_URL}/app/`, { waitUntil: "domcontentloaded" });

  const result = await page.evaluate(async () => {
    for (const registration of await navigator.serviceWorker.getRegistrations()) {
      await registration.unregister();
    }
    for (const cacheName of await caches.keys()) await caches.delete(cacheName);

    localStorage.setItem("haode-sw-upgrade-sentinel", "preserved");
    sessionStorage.setItem("haode-attribution", JSON.stringify({ source: "upgrade-test" }));

    const legacy = await caches.open("haode-pwa-v2026-07-legacy-shell");
    await legacy.put("/admin/marketing-drafts/index.html", new Response("legacy-private"));
    const unrelated = await caches.open("third-party-test-cache");
    await unrelated.put("/keep.txt", new Response("keep"));

    const registration = await navigator.serviceWorker.register(`/service-worker.js?upgrade=${Date.now()}`, {
      scope: "/",
    });
    const worker = registration.installing || registration.waiting || registration.active;
    if (worker && worker.state !== "activated") {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`activation timeout: ${worker.state}`)), 15000);
        worker.addEventListener("statechange", () => {
          if (worker.state === "activated") {
            clearTimeout(timer);
            resolve();
          } else if (worker.state === "redundant") {
            clearTimeout(timer);
            reject(new Error("service worker became redundant"));
          }
        });
      });
    }

    const cacheNames = await caches.keys();
    return {
      cacheNames,
      localSentinel: localStorage.getItem("haode-sw-upgrade-sentinel"),
      sessionAttribution: sessionStorage.getItem("haode-attribution"),
      legacyResponseFound: Boolean(await caches.match("/admin/marketing-drafts/index.html")),
      unrelatedResponse: await caches.match("/keep.txt").then((response) => response?.text()),
    };
  });

  expect(result.cacheNames).toContain("haode-pwa-v2026-09-22-c-layout-release-shell");
  expect(result.cacheNames).not.toContain("haode-pwa-v2026-07-legacy-shell");
  expect(result.cacheNames).toContain("third-party-test-cache");
  expect(result.legacyResponseFound).toBe(false);
  expect(result.unrelatedResponse).toBe("keep");
  expect(result.localSentinel).toBe("preserved");
  expect(result.sessionAttribution).toBe(JSON.stringify({ source: "upgrade-test" }));
});
