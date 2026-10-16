import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CookieBannerComponent } from '../components/cookie-banner.component';

export class ProductDetailPage extends BasePage {
  readonly cookieBanner: CookieBannerComponent;

  constructor(page: Page) {
    super(page);
    this.cookieBanner = new CookieBannerComponent(page);
  }

  get title(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get price(): Locator {
    return this.page.locator('text=/€|EUR/i');
  }

  get addToCartButton(): Locator {
    return this.page.getByRole('button', {
      name: /in den warenkorb|add to cart/i,
    });
  }

  async addToCart(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? 25_000;
    await this.cookieBanner.dismissIfPresent();
    await this.dismissBlockingOverlays();

    await expect(this.addToCartButton).toBeVisible({ timeout: 10_000 });
    await expect(this.addToCartButton).toBeEnabled({ timeout: 10_000 });

    const postAddIndicator = this.page
      .getByRole('button', { name: /\bzum warenkorb\b/i })
      .or(this.page.getByRole('link', { name: /\bzum warenkorb\b/i }))
      .first();

    await Promise.all([
      Promise.race([
        this.page.waitForResponse(
          (resp) =>
            (/pushtobasket\.php/i.test(resp.url()) ||
              /warenkorb/i.test(resp.url()) ||
              /basket/i.test(resp.url())) &&
            resp.ok(),
          { timeout },
        ),
        postAddIndicator.waitFor({ state: 'visible', timeout }),
      ]).catch(() => null),
      this.addToCartButton.click(),
    ]);

    await this.page.waitForLoadState('networkidle').catch(() => null);
  }
}


