import { test, expect } from '../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../fixtures/staging-guard.fixture';

test.describe('Staging Authentication Smoke @staging', () => {
  test.beforeEach(async ({ baseURL }): Promise<void> => {
    requireAuthorizedStaging(baseURL);
  });

  test('loads the authorized staging homepage', async ({
    page,
  }): Promise<void> => {
    const response = await page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    if (!response) {
      throw new Error(
        'Staging homepage navigation returned no document response.',
      );
    }

    const status = response.status();

    if (status === 401) {
      throw new Error(
        [
          'Staging returned HTTP 401 Unauthorized.',
          'Playwright was configured with Basic Auth credentials, but the server',
          'rejected the credentials or requires another access condition.',
          'Verify BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD, the canonical hostname,',
          'VPN access, proxy requirements, and IP allowlisting.',
        ].join(' '),
      );
    }

    if (status === 403) {
      throw new Error(
        [
          'Staging returned HTTP 403 Forbidden.',
          'Authentication may have succeeded, but access is denied.',
          'Verify VPN access, IP allowlisting, proxy configuration,',
          'and staging account permissions.',
        ].join(' '),
      );
    }

    expect(status).toBeLessThan(400);

    await expect(
      page.getByRole('heading', { name: /unauthorized/i }),
    ).toHaveCount(0);

    await expect(page.locator('body')).not.toContainText(
      /could not verify that you are authorized/i,
    );

    await expect(page.getByRole('main')).toBeVisible();
  });
});
