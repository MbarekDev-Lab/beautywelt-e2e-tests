const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    httpCredentials: {
      username: 'test',
      password: 'joBW!2023',
    },
  });
  const page = await context.newPage();

  await page.goto('https://www.haarpflege-beauty.de/suche.php?qs=babor');

  await page.waitForTimeout(5000);
  
  const links = await page.locator('a[href*="/a/"]').all();
  if (links.length > 0) {
    console.log(`Found ${links.length} product links on search page for 'babor'`);
  } else {
    console.log('No product links found on search page for babor.');
  }

  await page.goto('https://www.haarpflege-beauty.de/parfuem');
  await page.waitForTimeout(5000);
  const catLinks = await page.locator('a[href*="/a/"]').all();
  console.log(`Found ${catLinks.length} product links on category page`);

  await browser.close();
})();
