import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CookieBannerComponent } from '../components/cookie-banner.component';

/**
 * Returns true if the response URL looks like a cart/basket mutation endpoint.
 * Covers:
 *  - pushtobasket.php
 *  - any path containing "warenkorb" or "basket"
 *  - query params like ?add=1, ?action=add, ?addtocart=
 *  - common REST paths: /cart/add, /cart/items
 */
function isCartMutationResponse(resp: { url(): string; ok(): boolean }): boolean {
  if (!resp.ok()) return false;
  const url = resp.url();
  return (
    /pushtobasket\.php/i.test(url) ||
    /[/?&]warenkorb/i.test(url) ||
    /[/?&]basket/i.test(url) ||
    /[/?&]cart/i.test(url) ||
    /[?&]add(tocart|_to_cart|=)/i.test(url) ||
    /[?&]action=(add|addtocart|putinbasket)/i.test(url)
  );
}

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

  /**
   * Returns the cart item-count badge in the header (e.g. the number next to
   * the basket icon). Used as a secondary success signal: if the count is > 0
   * after clicking "In den Warenkorb" we know the add succeeded even when the
   * network response URL did not match our patterns or the modal text changed.
   */
  private get cartBadge(): Locator {
    return this.page.locator(
      // Covers common badge patterns: aria-label, data-count attribute, or a
      // small <span>/<sup> adjacent to the cart icon in the header.
      'header [aria-label*="Warenkorb"] .badge, ' +
      'header .cart-count, ' +
      'header .bwwk-count, ' +
      'a[href*="warenkorb"] .badge, ' +
      'a[href*="warenkorb"] sup, ' +
      // Generic: any element with a numeric data-count > 0
      '[data-count]:not([data-count="0"]):not([data-count=""])',
    ).first();
  }

  async addToCart(options?: { timeout?: number }): Promise<void> {
    const timeout = options?.timeout ?? 30_000;
    // Half-way point: if neither signal fires by then we attempt a retry-click.
    const halfTimeout = Math.floor(timeout / 2);

    // --- Pre-click housekeeping ---
    await this.cookieBanner.dismissIfPresent();
    await this.dismissBlockingOverlays();
    // Dismiss cookie banner one more time in case it reappeared after overlay dismissal.
    await this.cookieBanner.dismissIfPresent();

    await expect(this.addToCartButton).toBeVisible({ timeout: 10_000 });
    await expect(this.addToCartButton).toBeEnabled({ timeout: 10_000 });

    // Scroll the button into the viewport so pointer events are not blocked.
    await this.addToCartButton.scrollIntoViewIfNeeded();

    // --- Success signals ---

    // Signal 1: "Zum Warenkorb" button/link that appears after a successful add.
    const postAddIndicator = this.page
      .getByRole('button', { name: /\bzum warenkorb\b/i })
      .or(this.page.getByRole('link', { name: /\bzum warenkorb\b/i }))
      // Also cover text-only confirmation messages inside modals/drawers.
      .or(this.page.locator('text=/zum warenkorb/i'))
      .first();

    // Track whether any success signal fired.
    let cartResponseOk = false;

    // --- Race all success signals concurrently with the button click ---
    await Promise.all([
      Promise.race([
        // Signal 1a: Network response from a cart mutation endpoint.
        this.page
          .waitForResponse(isCartMutationResponse, { timeout })
          .then(() => {
            cartResponseOk = true;
          })
          .catch(() => { /* timed out – ok, other signals still running */ }),

        // Signal 1b: "Zum Warenkorb" UI indicator.
        postAddIndicator
          .waitFor({ state: 'visible', timeout })
          .then(() => {
            cartResponseOk = true;
          })
          .catch(() => { /* timed out */ }),

        // Signal 1c: Cart badge appears / becomes non-zero.
        this.cartBadge
          .waitFor({ state: 'visible', timeout })
          .then(() => {
            cartResponseOk = true;
          })
          .catch(() => { /* timed out */ }),
      ]),

      // Fire the click, then after half the timeout retry if nothing confirmed yet.
      (async () => {
        await this.addToCartButton.click();

        // Grace period: wait half the timeout before deciding to retry.
        await this.page.waitForTimeout(halfTimeout);

        if (!cartResponseOk) {
          // The first click may have been swallowed by a transient overlay.
          // Dismiss any lingering overlays and try once more.
          await this.cookieBanner.dismissIfPresent();
          await this.dismissBlockingOverlays();

          const stillEnabled = await this.addToCartButton
            .isEnabled()
            .catch(() => false);

          if (stillEnabled) {
            await this.addToCartButton.click().catch(() => { /* best-effort */ });
          }
        }
      })(),
    ]);

    // Wait for any pending XHRs/fetches to settle before the caller navigates away.
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null);

    // --- Final verification ---
    if (!cartResponseOk) {
      // Last-chance poll: check all signals synchronously after networkidle.
      const indicatorVisible = await postAddIndicator.isVisible().catch(() => false);
      const badgeVisible = await this.cartBadge.isVisible().catch(() => false);

      if (!indicatorVisible && !badgeVisible) {
        throw new Error(
          'addToCart: Neither a successful basket API response, the ' +
            '"Zum Warenkorb" indicator, nor a cart badge count were detected ' +
            'after clicking "In den Warenkorb". The item may not have been added. ' +
            'Check for session/auth issues, CSRF token expiry, blocking overlays, ' +
            'or product availability on staging.',
        );
      }
    }
  }
}
