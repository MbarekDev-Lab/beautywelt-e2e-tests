import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

test.beforeEach(async ({ baseURL }): Promise<void> => {
  requireAuthorizedStaging(baseURL);
});

test.describe('Cart @staging @stateful @requires-authorization', () => {
  test.beforeEach(async ({ baseURL }) => {
    if (!baseURL) {
      throw new Error('BASE_URL is required.');
    }

    /*if (isProductionHost(baseURL)) {
      test.skip(true, 'Cart mutations are prohibited against production.');
    }*/
  });

  test('adds item and updates quantity on staging', async ({
    page,
    homePage,
    searchResultsPage,
    productDetailPage,
    cartPage,
  }) => {
    // Navigate and consent
    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();
    await homePage.dismissBlockingOverlays();

    // Search and select (Bypassing search as it is currently broken on staging)
    await page.goto('/parfuem');
    await searchResultsPage.waitForMainContent();
    await page.waitForLoadState('domcontentloaded');
    // The consent banner may reappear on the catalog page – dismiss it again.
    await homePage.cookieBanner.dismissIfPresent();
    await homePage.dismissBlockingOverlays();
    await searchResultsPage.clickFirstVisibleProductLink();


    // Add to cart
    await productDetailPage.waitForMainContent();
    await productDetailPage.addToCart();

    // Go to cart
    await page.goto('/warenkorb.php');
    // Wait for network to settle so the session/basket state is fully committed
    // before we start asserting — staging can lag behind due to slow backends.
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => null);
    await homePage.cookieBanner.dismissIfPresent();
    await cartPage.waitForMainContent();

    // Verify cart is populated
    await expect(cartPage.cartItem).not.toHaveCount(0, {
      timeout: 15_000,
      message:
        'Cart appears empty after adding a product. ' +
        'Possible causes: add-to-cart XHR failed, session did not persist, ' +
        'or the cart item selector no longer matches the staging DOM.',
    });

    // Update quantity: wait for controls to appear, then update and confirm
    const quantity = cartPage.quantityInput.first();
    await expect(quantity).toBeVisible({ timeout: 5000 });
    await quantity.fill('2');

    const updateBtn = cartPage.updateButton.first();
    if ((await updateBtn.count()) > 0) {
      await expect(updateBtn).toBeVisible({ timeout: 5000 });
      await Promise.all([
        updateBtn.click(),
        Promise.race([
          page
            .waitForResponse(
              (resp) => /warenkorb/i.test(resp.url()) && resp.ok(),
              { timeout: 15000 },
            )
            .catch(() => null),
          page
            .waitForLoadState('networkidle', { timeout: 15000 })
            .catch(() => null),
        ]),
      ]);
    } else {
      // Some carts apply quantity changes on blur/enter — try both
      await quantity.press('Enter');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    await cartPage.waitForMainContent();
    // Accept values that start with 2 (e.g. "2", "2.00")
    await expect(quantity).toHaveValue(/^\s*2/, { timeout: 10000 });
  });
});
