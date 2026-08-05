import { test, expect } from '../../../fixtures/pom-fixtures';
import { isProductionHost } from '../../../config/environment';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

test.beforeEach(async ({ baseURL }): Promise<void> => {
  requireAuthorizedStaging(baseURL);
});

test.describe('Mobile Staging Navigation @staging @stateful @requires-authorization', () => {
  test.beforeEach(async ({ baseURL }) => {
    if (!baseURL) {
      throw new Error('BASE_URL is required.');
    }

    if (isProductionHost(baseURL)) {
      test.skip(
        true,
        'Mutations and stateful tests are prohibited against production.',
      );
    }
  });

  test('completes guest checkout flow with POM on mobile', async ({
    page,
    homePage,
    searchResultsPage,
    productDetailPage,
    cartPage,
    checkoutPage,
  }) => {
    // 1. Visit homepage
    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();

    // 2. Search for product
    await expect(homePage.searchInput).toBeVisible();
    await homePage.searchInput.fill('shampoo');
    await homePage.searchInput.press('Enter');

    // 3. View results and click first product
    await searchResultsPage.waitForMainContent();
    await expect(searchResultsPage.productCards).not.toHaveCount(0);
    await searchResultsPage.firstProductLink.click();

    // 4. Add to cart
    await productDetailPage.waitForMainContent();
    await expect(productDetailPage.addToCartButton).toBeEnabled();
    await productDetailPage.addToCartButton.click();

    // 5. Navigate to Cart (using direct URL or UI if available, direct URL is stable)
    await page.goto('/warenkorb.php');
    await cartPage.waitForMainContent();
    await expect(cartPage.cartItem).not.toHaveCount(0);
    await cartPage.checkoutButton.click();

    // 6. Reach checkout and select guest option
    await checkoutPage.waitForMainContent();
    await expect(checkoutPage.guestCheckoutOption).toBeVisible();
    await checkoutPage.guestCheckoutOption.check();
    await expect(checkoutPage.guestCheckoutOption).toBeChecked();
  });
});
