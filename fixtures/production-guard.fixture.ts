import type { Page, Route } from '@playwright/test';
import { RESTRICTED_PRODUCTION_ROUTES } from '../config/restricted-routes';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function sanitizeURL(rawURL: string): string {
  const url = new URL(rawURL);
  return `${url.origin}${url.pathname}`;
}

function isRestrictedPath(pathname: string): boolean {
  return RESTRICTED_PRODUCTION_ROUTES.some((pattern) => pattern.test(pathname));
}

export async function installProductionGuard(page: Page, baseURL: string,): Promise<void> {
  const productionOrigin = new URL(baseURL).origin;

  await page.route('**/*', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method().toUpperCase();
    const target = sanitizeURL(request.url());

    if (isRestrictedPath(url.pathname)) {
      await route.abort('blockedbyclient');
      throw new Error(`Blocked restricted production route: ${target}`);
    }

    if (url.origin === productionOrigin && !SAFE_METHODS.has(method)) {
      await route.abort('blockedbyclient');
      throw new Error(
        `Blocked state-changing production request: ${method} ${target}`,
      );
    }

    await route.continue();
  });
}
