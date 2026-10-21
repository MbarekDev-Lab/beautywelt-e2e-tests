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

    // "Zum Warenkorb" button/link that appears after a successful add.
    const postAddIndicator = this.page
      .getByRole('button', { name: /\bzum warenkorb\b/i })
      .or(this.page.getByRole('link', { name: /\bzum warenkorb\b/i }))
      .first();

    // Track whether the server acknowledged the add-to-cart action.
    let cartResponseOk = false;

    const [responseResult] = await Promise.all([
      Promise.race([
        this.page
          .waitForResponse(
            (resp) =>
              (/pushtobasket\.php/i.test(resp.url()) ||
                /warenkorb/i.test(resp.url()) ||
                /basket/i.test(resp.url())) &&
              resp.ok(),
            { timeout },
          )
          .then((resp) => {
            cartResponseOk = true;
            return resp;
          }),
        postAddIndicator.waitFor({ state: 'visible', timeout }).then(() => {
          cartResponseOk = true;
          return null;
        }),
      ]).catch(() => null),
      this.addToCartButton.click(),
    ]);

    // Wait for any pending XHRs/fetches to settle before the caller navigates away.
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null);

    // If neither the server response nor the UI indicator confirmed the add,
    // check for the indicator one last time with a short grace period.
    if (!cartResponseOk) {
      const indicatorVisible = await postAddIndicator
        .isVisible()
        .catch(() => false);

      if (!indicatorVisible) {
        throw new Error(
          'addToCart: Neither a successful basket API response nor the ' +
            '"Zum Warenkorb" indicator was detected after clicking ' +
            '"In den Warenkorb". The item may not have been added. ' +
            'Check for session/auth issues, CSRF token expiry, or ' +
            'product availability on staging.',
        );
      }
    }
  }
}


