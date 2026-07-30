import { test as base } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { CategoryPage } from '../pages/category.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { AccountPage } from '../pages/account.page';
import { installProductionGuard } from './production-guard.fixture';

export type TestFixtures = {
  basePage: BasePage;
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  categoryPage: CategoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  accountPage: AccountPage;
};

export const test = base.extend<TestFixtures>({
  page: async ({ page, baseURL }, use) => {
    await installProductionGuard(page, baseURL);
    await use(page);
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
});

export { expect } from '@playwright/test';
