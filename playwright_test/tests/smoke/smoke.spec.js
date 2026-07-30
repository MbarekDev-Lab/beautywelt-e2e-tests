const { test, expect } = require('@playwright/test');

test.describe('Smoke @smoke', () => {
    test('homepage loads with key elements and dismisses cookie banner', async ({ page }) => {
        await page.goto('/');
        const acceptButton = page.getByRole('button', { name: /alle akzeptieren|akzeptieren|zustimmen/i }).first();
        if (await acceptButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await acceptButton.click();
        }
        await expect(page).toHaveTitle(/beautywelt/i);
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.getByLabel(/suchen in allen marken|suchen/i).first()).toBeVisible();
    });
});
