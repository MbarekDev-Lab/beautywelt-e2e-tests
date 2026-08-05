import { isApprovedStagingHost } from '../config/environment';

export function requireAuthorizedStaging(
  baseURL: string | undefined,
): asserts baseURL is string {
  if (!baseURL) {
    throw new Error('BASE_URL is required.');
  }

  let hostname: string;

  try {
    hostname = new URL(baseURL).hostname.toLowerCase();
  } catch {
    throw new Error('BASE_URL must be a valid URL.');
  }

  if (!isApprovedStagingHost(baseURL)) {
    throw new Error(
      `Stateful tests require an approved staging host. Current host: ${hostname}`,
    );
  }

  if (process.env.TARGET_ENV !== 'staging') {
    throw new Error('Stateful tests require TARGET_ENV=staging.');
  }

  if (process.env.ALLOW_STATE_CHANGES !== 'true') {
    throw new Error('Stateful tests require ALLOW_STATE_CHANGES=true.');
  }

  if (!process.env.TEST_AUTHORIZATION_REFERENCE?.trim()) {
    throw new Error('Stateful tests require TEST_AUTHORIZATION_REFERENCE.');
  }
}
