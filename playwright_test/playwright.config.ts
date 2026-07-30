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
  workers: 1, // Mandatory: 1 worker for production safety
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
  ],
});
