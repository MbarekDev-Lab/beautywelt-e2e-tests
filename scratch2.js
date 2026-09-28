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

  await page.goto('https://www.haarpflege-beauty.de/');

  // Wait for products to load
  await page.waitForTimeout(5000);
  
  const html = await page.content();
  console.log('Main HTML length:', html.length);
  
  const productTitles = await page.locator('article, .product-card, [data-testid="product-card"], .article-wrapper').allInnerTexts();
  console.log('Homepage products:', productTitles.slice(0, 10));
  
  const links = await page.locator('a[href*="/a/"]').all();
  for (const l of links.slice(0, 5)) {
    console.log('Product link:', await l.getAttribute('href'), await l.innerText());
  }

  await browser.close();
})();
