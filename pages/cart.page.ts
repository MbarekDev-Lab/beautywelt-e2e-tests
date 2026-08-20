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
    return this.page.locator('tbody tr, .cart-item, .basket-item');
  }

  get checkoutButton(): Locator {
    return this.page.getByRole('link', { name: /zur kasse|kasse/i });
  }
}
