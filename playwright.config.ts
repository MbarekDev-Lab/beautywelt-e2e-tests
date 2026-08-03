import { defineConfig, devices } from '@playwright/test';
import { validateEnvironment } from './config/environment';

const environment = validateEnvironment();

const isCI = Boolean(process.env.CI);
const baseURL = environment.baseURL;

const httpCredentials = environment.hasBasicAuth
  ? {
      username: environment.basicAuthUsername!,
      password: environment.basicAuthPassword!,
    }
  : undefined;

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: 0,
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
    video: 'off',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'production-readonly',
      testMatch: /.*production-readonly\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL,
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'staging',
      testMatch: /.*staging\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL,
        httpCredentials,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'offline',
      testMatch: /.*offline\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'unit',
      testMatch: /.*unit\/.*\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      retries: 0,
    },
  ],
});
