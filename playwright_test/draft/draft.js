const { test, expect } = require('@playwright/test');

test('should handle adding same product multiple times', async ({ page }) => {
  const addButton = page.locator('.bwbtn.bwdp.bwhe').first();

  // Click add to cart three times
  await addButton.click();
  await addButton.click();
  await addButton.click();

  // Cart count should be 3 (quantity increases)
  const cartCount = page.locator('#bwf1').first();
  
  // Playwright will automatically poll this assertion until it passes or times out
  await expect(cartCount).toHaveText('3', { timeout: 10000 }); 
});

test('should not allow checkout with empty cart', async ({ page }) => {
  // Go directly to checkout with empty cart
  await page.goto('/bestellvorgang.php?editLieferadresse=1');

  // Fill out the form using robust 'name' attributes instead of brittle utility classes
  
  // 'Herr' has the value 'm' in your HTML snippet
  await page.locator('select[name="anrede"]').selectOption('m'); 
  
  await page.locator('input[name="vorname"]').fill('Test');
  await page.locator('input[name="nachname"]').fill('User');
  await page.locator('input[name="strasse"]').fill('123 Test St'); 
  await page.locator('input[name="ort"]').fill('Buchholz'); 
  
  // 'DE' is indeed the correct value for Deutschland
  await page.locator('select[name="land"]').selectOption('DE'); 
  
  await page.locator('input[name="plz"]').fill('21244');
  await page.locator('input[name="tel"]').fill('123-456-7890');
  
  // The email input has the name 'bwadr'
  await page.locator('input[name="bwadr"]').fill('test@beautywelt.com'); 

  // Using getByRole for buttons is the most resilient method
  await page.getByRole('button', { name: 'Kundendaten abschicken' }).click();

  // Should show error about empty cart (Assuming #toast is a valid ID)
  const toast = page.locator('#toast');
  await expect(toast).toBeVisible();
});