import { test as base, expect } from '@playwright/test';

import { AccountPage } from '../pages/account.page';
import { BasePage } from '../pages/base.page';
import { CartPage } from '../pages/cart.page';
import { CategoryPage } from '../pages/category.page';
import { CheckoutPage } from '../pages/checkout.page';
import { HomePage } from '../pages/home.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { SearchResultsPage } from '../pages/search-results.page';

type PageObjectFixtures = {
  readonly accountPage: AccountPage;
  readonly basePage: BasePage;
  readonly cartPage: CartPage;
  readonly categoryPage: CategoryPage;
  readonly checkoutPage: CheckoutPage;
  readonly homePage: HomePage;
  readonly productDetailPage: ProductDetailPage;
  readonly searchResultsPage: SearchResultsPage;
};

export const test = base.extend<PageObjectFixtures>({
  
  basePage: async ({ page }, use): Promise<void> => {
    await use(new BasePage(page));
  },

  homePage: async ({ page }, use): Promise<void> => {
    await use(new HomePage(page));
  },

  categoryPage: async ({ page }, use): Promise<void> => {
    await use(new CategoryPage(page));
  },

  searchResultsPage: async ({ page }, use): Promise<void> => {
    await use(new SearchResultsPage(page));
  },

  productDetailPage: async ({ page }, use): Promise<void> => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use): Promise<void> => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use): Promise<void> => {
    await use(new CheckoutPage(page));
  },

  accountPage: async ({ page }, use): Promise<void> => {
    await use(new AccountPage(page));
  },
});

export { expect };
