// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Authentication Tests
 * Tests for login, registration, and logout functionality
 */

test.describe('Authentication', () => {

  test.describe('Login', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/login.html');
    });

    test('should display login form', async ({ page }) => {
      await expect(page.locator('#bwpi')).toHaveText('Anmelden');
      await expect(page.locator('#bwjz')).toBeVisible();
      await expect(page.locator('#bwjz bwagp')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Fill in invalid credentials
      await page.locator('#bwjz').fill('wrong@email.com');
      await page.locator('#bwjz bwagp').fill('wrongpassword');

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Verify error message
      const errorMessage = page.locator('#errorMessage');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Invalid credentials');
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      // Fill in valid demo credentials
      await page.locator('#bwjz').fill('test@beautywelt.com');
      await page.locator('#bwjz bwagp').fill('test123');

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Verify toast message
      const toast = page.locator('#toast');
      await expect(toast).toContainText('Login successful');

      // Verify redirect to homepage
      await page.waitForURL('/');
    });

    test('should show validation for empty fields', async ({ page }) => {
      // Try to submit empty form
      await page.locator('button[type="submit"]').click();

      // Check that email field shows validation error (browser built-in)
      const emailInput = page.locator('#bwjz');
      const isInvalid = await emailInput.evaluate((el) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    });

    test('should have link to registration page', async ({ page }) => {
      const signUpLink = page.locator('text=Neu hier? Jetzt registrieren');
      await expect(signUpLink).toBeVisible();

      await signUpLink.click();
      await expect(page).toHaveURL('/register.html');
    });

    test('should display demo credentials', async ({ page }) => {
      const demoSection = page.locator('.login_php_login');
      await expect(demoSection).toBeVisible();
      await expect(demoSection).toContainText('test@beautywelt.com');
      await expect(demoSection).toContainText('test123');
    });

  });

  test.describe('Registration', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/registrieren.php');
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.locator('h5')).toHaveText('Mein Konto anmelden');
      await expect(page.locator('h1')).toHaveText('Neues Kundenkonto erstellen');

      await expect(page.locator('.bwzc')).toBeVisible();
      await expect(page.locator('.bwjz')).toBeVisible();
      await expect(page.locator('.bwjz .bwagp')).toBeVisible();
      await expect(page.locator('.bwbtn .bwdp .bwhe')).toBeVisible();
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      await page.locator('.bwkb .bwjz').fill('Test Vorname');
      await page.locator('.bwkb .bwjz').fill('Test Nachname');
      await page.locator('.bwjz').fill('test@beautywelt.com');
      await page.locator('.bwjz .bwagp').fill('password123');
      //await page.locator('.bwbtn .bwdp .bwhe').fill('different123');

      await page.locator('button[type="submit"]').click();

      const errorMessage = page.locator('#errorMessage');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Passwords do not match');
    });

    test('should register new user successfully', async ({ page }) => {
      // Generate unique email to avoid conflicts
      const uniqueEmail = `test${Date.now()}@example.com`;

      await page.locator('.bwkb .bwjz').fill('User Vorname'); // Vorname*
      await page.locator('.bwkb .bwjz').fill('User Nachname'); // Nachname*
      await page.locator('.bwza .bwkb .bwjz').fill('21244'); // PLZ*
      await page.locator('.bwt6 .bwjz').fill('Buchholz'); //strasse
      await page.locator('.bwjz .bwt7 .bwvh').fill('9');  //Hausnummer*
      await page.locator('.bwz8 .bwkb .bwjz').fill('Buchholz'); //Ort*
      await page.locator('.bwkb .bwjz .bwt8').fill('2 Stockwerk'); //Adresszusatz*
      await page.locator('.bwkb .bwjz').fill('0123456789'); //Telefon*

      await page.locator('.bwjz').fill(uniqueEmail);
      await page.locator('.bwjz .bwagp').fill('password123');
      //await page.locator('.bwbtn .bwdp .bwhe').fill('password123');

      await page.locator('button[type="submit"]').click();

      // Verify toast message
      const toast = page.locator('#toast');
      await expect(toast).toContainText('Account created');

      // Verify redirect to homepage
      await page.waitForURL('https://www.beautywelt.de/');
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.locator('text=Anmelden');
      await expect(loginLink).toBeVisible();

      await loginLink.click();
      await expect(page).toHaveURL('https://www.beautywelt.de/registrieren.php');
    });

  });

  test.describe('Logout', () => {

    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('https://www.beautywelt.de/login.html');
      await page.locator('.bwjz').fill('test@beautywelt.com');
      await page.locator('.bwjz .bwagp').fill('test123');
      await page.locator('button[type="submit"]').click();

      // Wait for redirect and user to be logged in
      await page.waitForURL('https://www.beautywelt.de/');
      await page.waitForTimeout(500);

      // Verify logged in state
      await expect(page.locator('.authArea')).toContainText('Hi, Demo User');

      // Click logout button
      await page.locator('.logoutBtn').click();

      // Verify logged out state
      await expect(page.locator('.authArea')).toContainText('Login');
    });

  });

});
