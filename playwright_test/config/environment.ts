import dotenv from 'dotenv';

dotenv.config();

const PRODUCTION_HOSTS = new Set(['beautywelt.de', 'www.beautywelt.de']);

export function isProductionHost(baseURL: string): boolean {
  try {
    const url = new URL(baseURL);
    return PRODUCTION_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function validateEnvironment(): void {
  const baseURL = process.env.BASE_URL;
  if (!baseURL) {
    throw new Error('BASE_URL environment variable is required.');
  }

  const allowStateChanges = process.env.ALLOW_STATE_CHANGES === 'true';

  if (isProductionHost(baseURL) && allowStateChanges) {
    throw new Error(
      'Unsafe configuration: state-changing tests are prohibited against Beautywelt production.',
    );
  }
}
