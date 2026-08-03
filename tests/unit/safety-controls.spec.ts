import { test, expect } from '@playwright/test';
import {
  isProductionHost,
  validateEnvironment,
} from '../../config/environment';

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

    expect(isProductionHost('https://staging.beautywelt.de')).toBe(false);
    expect(isProductionHost('http://localhost:3000')).toBe(false);
    expect(isProductionHost('invalid-url')).toBe(false);
  });

  test('validateEnvironment should throw if BASE_URL is missing', () => {
    delete process.env.BASE_URL;
    expect(() => validateEnvironment()).toThrow(/BASE_URL/);
  });

  test('validateEnvironment should throw if state changes are allowed on production', () => {
    process.env.BASE_URL = 'https://www.beautywelt.de';
    process.env.ALLOW_STATE_CHANGES = 'true';
    expect(() => validateEnvironment()).toThrow(
      /state-changing tests are prohibited/,
    );
  });

  test('validateEnvironment should pass for production if state changes are disabled', () => {
    process.env.BASE_URL = 'https://www.beautywelt.de';
    process.env.ALLOW_STATE_CHANGES = 'false';
    expect(() => validateEnvironment()).not.toThrow();
  });

  test('validateEnvironment should pass for staging if state changes are enabled', () => {
    process.env.BASE_URL = 'https://staging.beautywelt.de';
    process.env.ALLOW_STATE_CHANGES = 'true';
    expect(() => validateEnvironment()).not.toThrow();
  });
});
