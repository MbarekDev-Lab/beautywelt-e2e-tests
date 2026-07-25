// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for TechMart e-commerce tests
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // Run tests serially for consistent state (demo app uses in-memory storage)
  fullyParallel: false,
  workers: 1,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:3000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm start',
    cwd: '../sample-app',                 // Steps up out of playwright_test and into sample-app
    url: 'http://localhost:3000',        // Waits for backend server to respond on port 3000
    reuseExistingServer: !process.env.CI,// Reuses open local server during dev; starts fresh in CI
    timeout: 120 * 1000,                 // 2-minute max startup timeout
    stdout: 'pipe',                       // Streams server console.log output into terminal/CI logs
    stderr: 'pipe',                       // Streams server crash/error output into terminal/CI logs
  },
});