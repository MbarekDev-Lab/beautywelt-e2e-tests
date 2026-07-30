import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Smoke @smoke', () => {
    test('homepage loads with key elements and dismisses cookie banner', async ({ homePage, page }) => {
        await homePage.gotoHome();
        await homePage.acceptCookiesIfPresent();
        await expect(page).toHaveTitle(/beautywelt/i);
        await expect(homePage.header).toBeVisible();
        await expect(homePage.footer).toBeVisible();
        await expect(homePage.searchInput).toBeVisible();
        await expect(homePage.page.locator('body')).toContainText(/beautywelt/i);
    });

    test('search returns a product listing page and exposes a product link',
        async ({ homePage, searchResultsPage, page }) => {
            await homePage.gotoHome();
            await homePage.acceptCookiesIfPresent();
            await homePage.searchFor('Dior');
            await expect(page).toHaveURL(/dior|search|suche/i);
            await expect(searchResultsPage.firstProductLink.first()).toBeVisible();
            await expect(page.locator('body')).toContainText(/dior|parfum/i);
        });
});
