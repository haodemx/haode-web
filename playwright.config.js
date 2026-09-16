const { defineConfig } = require('@playwright/test');

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

module.exports = defineConfig({
  testDir: './tests',
  use: {
    launchOptions: executablePath ? { executablePath } : {},
  },
});
