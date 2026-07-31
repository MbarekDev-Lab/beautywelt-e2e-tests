import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { validateEnvironment } from './config/environment';

dotenv.config();

// Validate the environment configuration immediately
validateEnvironment();

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL || 'https://www.beautywelt.de';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1, // Mandatory: 1 worker for production safety (npx playwright test --workers=1)
  forbidOnly: isCI,
  retries: 0, // Mandatory: 0 retries on production
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off', // Disabled by default for production safety
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  // Configure projects for major browsers Desktop and Mobile
  projects: [
    {
      name: 'production-readonly',
      testMatch: /.*production-readonly\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'staging',
      testMatch: /.*staging\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'offline',
      testMatch: /.*offline\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'unit',
      testMatch: /.*unit\/.*\.spec\.ts/,
    },

    // Test against desktop browsers. 
    {
      name: 'chromuim',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      fullyParallel: true,
    },
    {
      name: 'integration-chrome-macos',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'integration-chrome-windows',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'integration-safari-macos',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        channel: 'safari'
        ,
      },
    },
    {
      name: 'integration-firefox-windows',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        channel: 'firefox',
      },
    },
    {
      name: 'integration-webkit-macos',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        channel: 'safari',
      },
    },
    {
      name: 'integration-edge-windows',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    // Test against mobile viewports.
    {
      name: 'integration-mobile-safari-ios',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        channel: 'safari',
      },
    },
    {
      name: 'integration-mobile-chrome-ios',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        channel: 'chrome',
      },
    },
    {
      name: 'integration-mobile-safari-ios',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone 12'],
        channel: 'safari',
      },
    },
    {
      name: 'integration-iPad-safari-ios',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['iPad Pro 11'],
        channel: 'safari',

      }
    },
    {
      name: 'integration-iPad-chrome-ios',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['iPad Pro 11'],
        channel: 'chrome',
      },
    },
    {
      name: 'integration-mobile-chrome-android',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['samsung Galaxy S20'],
        channel: 'chrome',
      },
    },
    {
      name: 'integration-mobile-chrome-android',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome',
      },
    },
    /*{
      name: 'integration-mobile-android-webview',
      testMatch: /.*integration\/.*\.spec\.ts/,
      use: {
        ...devices['']
      }
    },*/

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
