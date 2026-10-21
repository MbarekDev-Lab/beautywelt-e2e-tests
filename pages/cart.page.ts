import { Locator, Page } from '@playwright/test';
//import { BasePage } from './base.page';
import { BasePage } from '../pages/base.page';

/*import { CookieBannerComponent } from '../components/cookie-banner.component';
import { AccountPage } from '../pages/account.page';
import { CategoryPage } from '../pages/category.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { SearchResultsPage } from '../pages/search-results.page';*/

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get cartItem(): Locator {
    return this.page.locator(
      [
        'tbody tr',           // Table-based carts (classic JTL)
        '.cart-item',         // Generic cart-item class
        '.basket-item',       // Generic basket-item class
        '[data-product-id]',  // JTL data-attribute row variant
        '.bw-cart-product',   // Beautywelt-specific cart product row
        '.bwop_position',     // JTL order-position row class
        '.warenkorb-item',    // German-language variant
        'tr.kZeile',          // JTL table row variant (kZeile = cart row)
      ].join(', '),
    );
  }

  get quantityInput(): Locator {
    return this.page.locator(
      'input[name^="anzahl"], input[name*="anzahl"], input[type="number"]',
    );
  }

  get updateButton(): Locator {
    return this.page
      .locator(
        'button[title*="aktualisieren" i], [aria-label*="aktualisieren" i], button.bwmn, button[name*="aktualisieren" i]',
      )
      .or(this.page.getByRole('button', { name: /aktualisieren|update/i }))
      .or(
        this.page
          .locator('input[type="submit"], input[type="button"]')
          .filter({ hasText: /aktualisieren|update/i }),
      );
  }

  get checkoutButton(): Locator {
    return this.page.getByRole('link', { name: /zur kasse|kasse/i });
  }
}

