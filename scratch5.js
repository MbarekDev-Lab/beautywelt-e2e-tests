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

  await page.goto('https://www.haarpflege-beauty.de/parfuem');
  await page.waitForTimeout(5000);
  
  const links = await page.locator('a[href*="/a/"]').evaluateAll(elements => elements.map(e => e.href));
  
  console.log(`Found ${links.length} product links on category page`);
  
  for (const link of links.slice(0, 5)) {
    console.log(`Navigating to ${link}...`);
    await page.goto(link);
    await page.waitForTimeout(2000);
    const addToCart = await page.locator('button, input[type="submit"], a').filter({ hasText: /in den warenkorb|add to cart/i }).count();
    console.log(`- Add to cart buttons: ${addToCart}`);
    if (addToCart > 0) {
      console.log(`=> Found a product with Add to Cart: ${link}`);
      break;
    }
  }

  await browser.close();
})();
