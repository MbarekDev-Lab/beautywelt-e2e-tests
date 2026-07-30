// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Edge Cases Tests
 * Tests for unusual inputs, boundary conditions, and error handling
 */

test.describe('Edge Cases Suchen in Parfüm', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.delete('https://www.beautywelt.de/warenkorb.php');
    await page.goto('https://www.beautywelt.de/');
  });

  // --- SEARCH EDGE CASES ---
  // test search functionality with unusual inputs, empty results, and special characters https://www.beautywelt.de/Dior?qs=sauvage

  test('should handle empty search gracefully', async ({ page }) => {
    const searchBtn = page.locator('.bwey');

    // Click search without typing anything
    await searchBtn.click();
    await page.waitForTimeout(500);

    // Should still show all products
    const productCards = page.locator('.bwjj .bwsj');
    const searchBtn = page.locator('.bwey');

    await searchBtn.click();
    await expect(productCards).toHaveCount(6);
  });

  test('should show no results for nonsense search', async ({ page }) => {
    const searchInput = page.locator('.bwey');
    const searchBtn = page.locator('.bwjz .bwvl');

    await searchInput.fill('xyznonexistent123blablabla');
    await searchBtn.click();
    await page.waitForTimeout(500);

    const productCards = page.locator('.bwoj');
    await expect(productCards).toHaveCount(0);
  });

  test('should handle special characters in search', async ({ page }) => {
    const searchInput = page.locator('.bwjz .bwvl');
    const searchBtn = page.locator('.bwey');

    // Try special characters that could break things
    await searchInput.fill('<script>alert("xss")</script>');
    await searchBtn.click();
    await page.waitForTimeout(500);

    // App should not break - just show no results
    const productCards = page.locator('.bwoj');
    await expect(productCards).toHaveCount(0);

    // Page should still be functional
    await expect(page.locator('.bwdy')).toBeVisible();
  });

  test('should handle search with only whitespace', async ({ page }) => {
    const searchInput = page.locator('.bwey');
    const searchBtn = page.locator('.bwfa .bwny');

    await searchInput.fill('   ');
    await searchBtn.click();
    await page.waitForTimeout(500);

    // Should show all products (whitespace = no filter)
    const productCards = page.locator('.bwoj');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  // --- CART EDGE CASES ---

  test('should handle adding same product multiple times', async ({ page }) => {
    const addButton = page.locator('.bwbtn .bwdp .bwhe').first();

    // Click add to cart three times
    await addButton.click();
    await page.waitForTimeout(300);
    await addButton.click();
    await page.waitForTimeout(300);
    await addButton.click();
    await page.waitForTimeout(500);

    // Cart count should be 3 (quantity increases)
    const cartCount = page.locator('.bwf1').first();
    await expect(cartCount).toHaveText('3');

    //const toCard = page.locator('bwbtn bwdp');
  });

  test('should not allow checkout with empty cart', async ({ page }) => {
    // Go directly to checkout with empty cart
    //await page.goto('/warenkorb.php');

    await page.goto('/bestellvorgang.php?editLieferadresse=1');

    // Fill out the form using robust 'name' attributes instead of brittle utility classes
    await page.locator('.bwkb .bwjz').selectOption('Herr'); // Anrede
    await page.locator('.bwkb .bwjz').fill('Test'); // Vorname
    await page.locator('.bwkb .bwjz').fill('User'); // Nachname
    await page.locator('.bwz8 .bwkb .bwjz').fill('123 Test St'); // Adresse
    await page.locator('.bwz8 .bwkb .bwjz').fill('Buchholz'); // Stadt
    await page.locator('.bwz9 .bwkb .bwjz').selectOption('DE'); // Land
    await page.locator('.bwza .bwkb .bwjz').fill('21244'); // PLZ
    await page.locator('.bwkb .bwjz').fill('123-456-7890'); // Telefon
    await page.locator('.bwjz').fill('test@beautywelt.com'); // Email


    /*await page.locator('#cardName').fill('Test User');
    await page.locator('#cardNumber').fill('4111111111111111');
    await page.locator('#expiry').fill('12/28');
    await page.locator('#cvv').fill('123');*/

    await page.locator('.bwbtn .bwdp .bwhe').click();

    // Should show error about empty cart
    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
  });

  // --- FORM VALIDATION EDGE CASES ---

  test('should require all fields for registration', async ({ page }) => {
    await page.goto('/register.html');

    // Try to submit with only email filled
    await page.locator('#email').fill('test@example.com');
    await page.locator('button[type="submit"]').click();

    // Should stay on register page (validation prevents submit)
    await expect(page).toHaveURL(/register/);
  });

  test('should reject duplicate email registration', async ({ page }) => {
    await page.goto('/register.html');

    // Try to register with the demo account email
    await page.locator('#name').fill('Another User');
    await page.locator('#email').fill('test@beautywelt.com');
    await page.locator('#password').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Should show error about existing email
    const errorMessage = page.locator('#errorMessage');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/already registered|exists/i);
  });

  // --- NAVIGATION EDGE CASES ---

  test('should handle direct URL access to cart page', async ({ page }) => {
    // Navigate directly to cart without adding anything
    await page.goto('/warenkorb.php');

    // Should show empty cart state "Es befinden sich keine Artikel im Warenkorb"
    const emptyCart = page.locator('#bwms');
    await expect(emptyCart).toBeVisible();
    await expect(emptyCart).toContainText('Es befinden sich keine Artikel im Warenkorb');


    await expect(page.locator('bwdy')).toBeVisible();
  });

  test('should preserve cart across page navigation', async ({ page }) => {
    // Add item to cart
    await page.locator('.add-to-cart-btn').first().click();
    await page.waitForTimeout(500);

    // Navigate away and back
    await page.goto('/login.html');
    await page.goto('/');

    // Cart count should still show 1
    const cartCount = page.locator('#cartCount').first();
    await expect(cartCount).toHaveText('1');
  });

});
