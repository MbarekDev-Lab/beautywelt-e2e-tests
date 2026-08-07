import dotenv from 'dotenv';

const DEFAULT_ENV_FILE = '.env.prod';

export const SELECTED_ENV_FILE = process.env.ENV_FILE ?? DEFAULT_ENV_FILE;

dotenv.config({ path: SELECTED_ENV_FILE });

export const PRODUCTION_HOSTS = new Set(['beautywelt.de', 'www.beautywelt.de']);

export const APPROVED_STAGING_HOSTS = new Set([
  'haarpflege-beauty.de',
  'www.haarpflege-beauty.de',
]);

export type TargetEnvironment = 'production' | 'staging' | 'offline' | 'unit';

const ALLOWED_TARGET_ENVIRONMENTS = new Set<TargetEnvironment>([
  'production',
  'staging',
  'offline',
  'unit',
]);

export type EnvironmentConfig = {
  readonly selectedEnvFile: string;
  readonly baseURL: string;
  readonly targetEnv: TargetEnvironment;
  readonly allowStateChanges: boolean;
  readonly authorizationReference: string;
  readonly hostname: string;
  readonly isProduction: boolean;
  readonly isApprovedStaging: boolean;
  readonly productionTestBudget: number;
  readonly productionNavigationBudget: number;
  readonly basicAuthUsername?: string;
  readonly basicAuthPassword?: string;
  readonly hasBasicAuth: boolean;
};

function getOptionalEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value && value.length > 0 ? value : undefined;
}

function requireEnvValue(name: string): string {
  const value = getOptionalEnvValue(name);

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

function parseBoolean(
  value: string | undefined,
  variableName: string,
): boolean {
  if (value === 'true') {
    return true;
  }

  if (value === 'false' || value === undefined || value.trim() === '') {
    return false;
  }

  throw new Error(
    `${variableName} must be either "true" or "false". Current value: ${value}`,
  );
}

function parsePositiveInteger(
  value: string | undefined,
  variableName: string,
  defaultValue: number,
): number {
  if (!value || value.trim().length === 0) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `${variableName} must be a positive integer. Current value: ${value}`,
    );
  }

  return parsed;
}

function parseTargetEnvironment(value: string): TargetEnvironment {
  if (ALLOWED_TARGET_ENVIRONMENTS.has(value as TargetEnvironment)) {
    return value as TargetEnvironment;
  }

  throw new Error(
    `TARGET_ENV must be one of: production, staging, offline, unit. Current value: ${value}`,
  );
}

export function getHostname(baseURL: string): string {
  return new URL(baseURL).hostname.toLowerCase();
}

export function isProductionHost(baseURL: string): boolean {
  try {
    return PRODUCTION_HOSTS.has(getHostname(baseURL));
  } catch {
    return false;
  }
}

export function isApprovedStagingHost(baseURL: string): boolean {
  try {
    return APPROVED_STAGING_HOSTS.has(getHostname(baseURL));
  } catch {
    return false;
  }
}

function validateBaseURL(baseURL: string): void {
  let parsedURL: URL;

  try {
    parsedURL = new URL(baseURL);
  } catch {
    throw new Error(`BASE_URL must be a valid URL. Current value: ${baseURL}`);
  }

  if (parsedURL.protocol !== 'https:') {
    throw new Error(
      `BASE_URL must use HTTPS. Current protocol: ${parsedURL.protocol}`,
    );
  }
}

export function loadEnvironmentConfig(): EnvironmentConfig {
  const baseURL = requireEnvValue('BASE_URL');

  validateBaseURL(baseURL);

  const targetEnv = parseTargetEnvironment(requireEnvValue('TARGET_ENV'));

  const allowStateChanges = parseBoolean(
    process.env.ALLOW_STATE_CHANGES,
    'ALLOW_STATE_CHANGES',
  );

  const authorizationReference =
    getOptionalEnvValue('TEST_AUTHORIZATION_REFERENCE') ?? '';

  const hostname = getHostname(baseURL);
  const isProduction = isProductionHost(baseURL);
  const isApprovedStaging = isApprovedStagingHost(baseURL);

  const productionTestBudget = parsePositiveInteger(
    process.env.PRODUCTION_TEST_BUDGET,
    'PRODUCTION_TEST_BUDGET',
    10,
  );

  const productionNavigationBudget = parsePositiveInteger(
    process.env.PRODUCTION_NAVIGATION_BUDGET,
    'PRODUCTION_NAVIGATION_BUDGET',
    10,
  );

  const basicAuthUsername = getOptionalEnvValue('BASIC_AUTH_USERNAME');
  const basicAuthPassword = getOptionalEnvValue('BASIC_AUTH_PASSWORD');

  return {
    selectedEnvFile: SELECTED_ENV_FILE,
    baseURL,
    targetEnv,
    allowStateChanges,
    authorizationReference,
    hostname,
    isProduction,
    isApprovedStaging,
    productionTestBudget,
    productionNavigationBudget,
    basicAuthUsername,
    basicAuthPassword,
    hasBasicAuth: Boolean(basicAuthUsername && basicAuthPassword),
  };
}

export function validateEnvironment(): EnvironmentConfig {
  const config = loadEnvironmentConfig();

  if (config.targetEnv === 'production' && config.allowStateChanges) {
    throw new Error(
      'Unsafe configuration: state-changing tests are prohibited in production.',
    );
  }

  if (config.targetEnv === 'production' && config.isApprovedStaging) {
    throw new Error(
      'Unsafe configuration: the authorized test domain cannot be used as production.',
    );
  }

  if (config.targetEnv === 'production' && config.allowStateChanges) {
    throw new Error(
      'Unsafe configuration: ALLOW_STATE_CHANGES must be false in production.',
    );
  }

  if (config.targetEnv === 'production' && !config.isProduction) {
    throw new Error(
      `Unsafe configuration: TARGET_ENV=production requires an approved production host. Current host: ${config.hostname}`,
    );
  }

  if (config.targetEnv === 'staging') {
    if (!config.isApprovedStaging) {
      throw new Error(
        `Unsafe configuration: staging tests require an approved staging host. Current host: ${config.hostname}`,
      );
    }

    if (config.isProduction) {
      throw new Error(
        'Unsafe configuration: production hosts cannot be used for staging tests.',
      );
    }

    if (!config.allowStateChanges) {
      throw new Error(
        'Staging state-changing tests require ALLOW_STATE_CHANGES=true.',
      );
    }

    if (!config.authorizationReference) {
      throw new Error(
        'Staging state-changing tests require TEST_AUTHORIZATION_REFERENCE.',
      );
    }

    if (!config.hasBasicAuth) {
      throw new Error(
        'Staging tests require BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD.',
      );
    }
  }

  if (config.targetEnv === 'offline' || config.targetEnv === 'unit') {
    if (config.allowStateChanges) {
      throw new Error(
        `${config.targetEnv} tests must not require ALLOW_STATE_CHANGES=true.`,
      );
    }
  }

  return config;
}
