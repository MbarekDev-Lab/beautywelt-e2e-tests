import { test, expect } from '../../fixtures/pom-fixtures';
import { RESTRICTED_PRODUCTION_ROUTES } from '../../config/restricted-routes';

function validatePublicCategoryUrl(rawHref: string, baseURL: string): URL {
  const destination = new URL(rawHref, baseURL);
  const productionUrl = new URL(baseURL);

  if (destination.protocol !== 'https:') {
    throw new Error(
      `Category destination must use HTTPS. Received protocol: ${destination.protocol}`,
    );
  }

  if (destination.origin !== productionUrl.origin) {
    throw new Error(
      `Category destination must remain same-origin: ${destination.origin}${destination.pathname}`,
    );
  }

  if (destination.username || destination.password) {
    throw new Error('Category destination must not contain URL credentials.');
  }

  const isRestrictedRoute = RESTRICTED_PRODUCTION_ROUTES.some((pattern) =>
    pattern.test(destination.pathname),
  );

  if (isRestrictedRoute) {
    throw new Error(
      `Category destination matched a restricted route: ${destination.pathname}`,
    );
  }

  return destination;
}

test.describe('Category Page @production-readonly', () => {
  test('should identify the public Parfum category destination', async ({ page, homePage, baseURL, }): Promise<void> => {
    if (!baseURL) {
      throw new Error('baseURL is required.');
    }

    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();

    /* WARNING: The following logic is intentionally designed to be resilient against changes in the homepage layout and menu structure.
     * The desktop and mobile menus may render duplicate category entries.
     * We locate anchors by their href and text, but do not click the menu.
     */

    const parfumAnchors = page
      .locator('a[href]')
      .filter({ hasText: /\bparfum\b/i });

    const anchorCount = await parfumAnchors.count();

    if (anchorCount === 0) {
      throw new Error(
        'No public anchor containing the text "Parfum" was found on the homepage.',
      );
    }

    const safeDestinations = new Map<string, URL>();

    for (let index = 0; index < anchorCount; index += 1) {
      const anchor = parfumAnchors.nth(index);
      const href = await anchor.getAttribute('href');

      if (!href) {
        continue;
      }

      const destination = validatePublicCategoryUrl(href, baseURL);

      safeDestinations.set(destination.href, destination);
    }

    expect(safeDestinations.size).toBeGreaterThan(0);

    const destination = [...safeDestinations.values()][0];

    if (!destination) {
      throw new Error('No valid public Parfum category destination was found.');
    }

    expect(destination.origin).toBe(new URL(baseURL).origin);
    expect(destination.pathname).not.toBe('/');
  });
});
