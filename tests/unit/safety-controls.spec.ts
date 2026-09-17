import { test, expect } from '@playwright/test';
import {
  isProductionHost,
  validateEnvironment,
} from '../../config/environment';
import { validateStagingAuthorization } from '../../fixtures/staging-guard.fixture';

test.describe('Safety Controls - Unit Tests', () => {
  const originalEnv = process.env;

  test.beforeEach(() => {
    process.env = { ...originalEnv };
  });

  test.afterAll(() => {
    process.env = originalEnv;
  });

  test('isProductionHost should identify production URLs', () => {
    expect(isProductionHost('https://www.beautywelt.de')).toBe(true);
    expect(isProductionHost('https://beautywelt.de')).toBe(true);
    expect(isProductionHost('https://beautywelt.de/some/path')).toBe(true);

    expect(isProductionHost('https://www.haarpflege-beauty.de')).toBe(false);
    expect(isProductionHost('https://staging.haarpflege-beauty.de')).toBe(
      false,
    );

    expect(isProductionHost('http://localhost:3000')).toBe(false);
    expect(isProductionHost('invalid-url')).toBe(false);
  });

  test('the authorized test domain should be treated as staging only', () => {
    process.env.BASE_URL = 'https://www.haarpflege-beauty.de';
    process.env.TARGET_ENV = 'production';
    process.env.ALLOW_STATE_CHANGES = 'false';
    expect(() => validateEnvironment()).toThrow(
      /authorized test domain cannot be used as production/i,
    );
  });

  test('validateEnvironment should throw if BASE_URL is missing', () => {
    delete process.env.BASE_URL;
    expect(() => validateEnvironment()).toThrow(/BASE_URL/);
  });

  test('validateEnvironment should throw if state changes are allowed on production', () => {
    process.env.BASE_URL = 'https://www.haarpflege-beauty.de';
    process.env.ALLOW_STATE_CHANGES = 'true';
    expect(() => validateEnvironment()).toThrow(
      /state-changing tests are prohibited/,
    );
  });

  test('validateEnvironment should pass for production if state changes are disabled', () => {
    process.env.BASE_URL = 'https://www.beautywelt.de';
    process.env.TARGET_ENV = 'production';
    process.env.ALLOW_STATE_CHANGES = 'false';
    expect(() => validateEnvironment()).not.toThrow();
  });

  test('validateEnvironment should pass for staging if state changes are enabled', () => {
    process.env.BASE_URL = 'https://www.haarpflege-beauty.de/';
    process.env.TARGET_ENV = 'staging';
    process.env.ALLOW_STATE_CHANGES = 'true';
    process.env.TEST_AUTHORIZATION_REFERENCE = 'unit-test-auth';
    process.env.BASIC_AUTH_USERNAME = 'unit';
    process.env.BASIC_AUTH_PASSWORD = 'unit';
    expect(() => validateEnvironment()).not.toThrow();
  });

  test('validateStagingAuthorization should reject non-approved hosts', () => {
    expect(() =>
      validateStagingAuthorization('https://example.com', {
        TARGET_ENV: 'staging',
        ALLOW_STATE_CHANGES: 'true',
        TEST_AUTHORIZATION_REFERENCE: 'abc',
      } as NodeJS.ProcessEnv),
    ).toThrow(/approved staging host/i);
  });

  test('validateStagingAuthorization should accept approved staging settings', () => {
    expect(() =>
      validateStagingAuthorization('https://www.haarpflege-beauty.de/', {
        TARGET_ENV: 'staging',
        ALLOW_STATE_CHANGES: 'true',
        TEST_AUTHORIZATION_REFERENCE: 'abc',
      } as NodeJS.ProcessEnv),
    ).not.toThrow();
  });
});
