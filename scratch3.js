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

  await page.goto('https://www.haarpflege-beauty.de/suche.php?qs=diesel');

  await page.waitForTimeout(5000);
  
  const links = await page.locator('a[href*="/a/"]').all();
  if (links.length > 0) {
    const parentHTML = await links[0].evaluate(el => el.parentElement.parentElement.outerHTML);
    console.log('Parent HTML of product link:', parentHTML);
  } else {
    console.log('No product links found on search page.');
  }

  await browser.close();
})();
