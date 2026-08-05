import {
  defineConfig,
  devices,
  type HTTPCredentials,
  type PlaywrightTestConfig,
} from '@playwright/test';
import { validateEnvironment } from './config/environment';

const environment = validateEnvironment();

const isCI = Boolean(process.env.CI);
const baseURL = environment.baseURL;

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_EXPECT_TIMEOUT_MS = 5_000;
const DEFAULT_ACTION_TIMEOUT_MS = 10_000;
const DEFAULT_NAVIGATION_TIMEOUT_MS = 15_000;

function createStagingHttpCredentials(): HTTPCredentials | undefined {
  if (environment.targetEnv !== 'staging') {
    return undefined;
  }

  const username = environment.basicAuthUsername?.trim();
  const password = environment.basicAuthPassword?.trim();

  if (!username || !password) {
    throw new Error(
      [
        'Staging execution requires HTTP Basic Authentication.',
        'Configure BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD',
        `in ${environment.selectedEnvFile}.`,
      ].join(' '),
    );
  }

  return {
    username,
    password,
    origin: new URL(baseURL).origin,
    send: 'always',
  };
}

const stagingHttpCredentials = createStagingHttpCredentials();

const config: PlaywrightTestConfig = {
  testDir: './tests',
  outputDir: './test-results',

  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: isCI,

  timeout: DEFAULT_TIMEOUT_MS,

  expect: {
    timeout: DEFAULT_EXPECT_TIMEOUT_MS,
  },

  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report',
      },
    ],
    [
      'junit',
      {
        outputFile: 'reports/junit.xml',
      },
    ],
  ],

  use: {
    baseURL,

    actionTimeout: DEFAULT_ACTION_TIMEOUT_MS,
    navigationTimeout: DEFAULT_NAVIGATION_TIMEOUT_MS,

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',

    ignoreHTTPSErrors: false,
  },

  projects: [
    {
      name: 'production-readonly',

      testMatch: /production-readonly\/.*\.spec\.ts/,

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
      name: 'staging-auth',

      testMatch: /staging\/auth-smoke\.spec\.ts/,

      fullyParallel: false,
      workers: 1,
      retries: 0,

      use: {
        ...devices['Desktop Chrome'],

        channel: 'chrome',
        baseURL,

        httpCredentials: stagingHttpCredentials,

        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'staging-desktop',

      testMatch: /staging\/desktop\/.*\.spec\.ts/,

      fullyParallel: false,
      workers: 1,
      retries: 0,

      use: {
        ...devices['Desktop Chrome'],

        channel: 'chrome',
        baseURL,

        httpCredentials: stagingHttpCredentials,

        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'staging-mobile',

      testMatch: /staging\/mobile\/.*\.spec\.ts/,

      fullyParallel: false,
      workers: 1,
      retries: 0,

      use: {
        ...devices['iPhone 13'],

        baseURL,

        httpCredentials: stagingHttpCredentials,

        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'offline',

      testMatch: /offline\/.*\.spec\.ts/,

      fullyParallel: false,
      workers: 1,
      retries: 0,

      use: {
        baseURL: undefined,

        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
      },
    },

    {
      name: 'unit',

      testMatch: /unit\/.*\.spec\.ts/,

      fullyParallel: false,
      workers: 1,
      retries: 0,

      use: {
        baseURL: undefined,

        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
  ],
};

export default defineConfig(config);
