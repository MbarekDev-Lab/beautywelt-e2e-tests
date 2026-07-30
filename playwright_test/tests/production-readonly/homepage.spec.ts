import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Homepage @production-readonly', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.gotoHome();
    await homePage.cookieBanner.dismissIfPresent();
  });

  test('should display the page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Beautywelt/i);
  });

  test('should display header and footer landmarks', async ({ homePage }) => {
    await expect(homePage.header).toBeVisible();
    await expect(homePage.footer).toBeVisible();
  });

  test('should display search control', async ({ homePage }) => {
    await expect(homePage.searchInput).toBeVisible();
  });

  test('main content landmark is visible', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible();
  });
});
