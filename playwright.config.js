const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    launchOptions: {
      // Keep QA isolated from real order submission, messaging, and measurement.
      // Existing route.fulfill fixtures still work before Chromium resolves hosts.
      args: ['--host-resolver-rules=MAP erp.haode.com.mx ~NOTFOUND, MAP wa.me ~NOTFOUND, MAP *.whatsapp.com ~NOTFOUND, MAP *.google-analytics.com ~NOTFOUND, MAP *.googletagmanager.com ~NOTFOUND, MAP *.openai.com ~NOTFOUND']
    }
  }
});
