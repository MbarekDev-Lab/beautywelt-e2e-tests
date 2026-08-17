const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    httpCredentials: {
      username: 'test',
      password: 'joBW!2023'
    }
  });
  const page = await context.newPage();
  
  await page.goto('https://www.haarpflege-beauty.de/suche.php?qs=parfum');
  
  // Wait for products to load
  await page.waitForTimeout(5000);
  
  const productTitles = await page.locator('article, .product-card, [data-testid="product-card"], .article-wrapper').allInnerTexts();
  console.log('Products for parfum:', productTitles.slice(0, 5));

  await page.goto('https://www.haarpflege-beauty.de/suche.php?qs=ROJA+Isola+Blu');
  await page.waitForTimeout(5000);
  const rojaTitles = await page.locator('article, .product-card, [data-testid="product-card"], .article-wrapper').allInnerTexts();
  console.log('Products for ROJA Isola Blu:', rojaTitles.slice(0, 5));

  await browser.close();
})();
