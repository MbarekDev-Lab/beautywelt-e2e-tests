import { test } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

test.beforeEach(async ({ baseURL }): Promise<void> => {
  requireAuthorizedStaging(baseURL);
});

test('dump storage', async ({ page, homePage }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  
  await homePage.cookieBanner.dismissIfPresent();
  await page.waitForTimeout(1000);
  
  const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
  console.log("localStorage:", localStorage);
  
  const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
  console.log("sessionStorage:", sessionStorage);
  
  const cookies = await page.context().cookies();
  console.log("Cookies:");
  cookies.forEach(c => console.log(`${c.name}=${c.value}`));
});
