import type { Locator, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

import { CookieBannerComponent } from '../components/cookie-banner.component';
import { FooterComponent } from '../components/footer.component';
import { HeaderComponent } from '../components/header.component';
import { ProductCardComponent } from '../components/product-card.component';
import { SearchComponent } from '../components/search.component';
import { BasePage } from './base.page';

const PRODUCT_LINK_SELECTOR =
  'li > a[href*="/a/"][href][title]:has(img[alt][data-src*="/product/"]), ' +
  'li > a[href*="/a/"][href][title]:has(img[alt][src*="/product/"])';

const CATEGORY_LINK_SELECTOR = [
  'a[href="/parfuem"]',
  'a[href="/gesicht"]',
  'a[href="/koerper"]',
  'a[href="/make-up"]',
  'a[href="/haare"]',
  'a[href="/natur"]',
  'a[href="/maenner"]',
  'a[href="/drogerie"]',
  'a[href="/geschenke"]',
  'a[href="/sale"]',
].join(', ');

export class HomePage extends BasePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly search: SearchComponent;
  readonly cookieBanner: CookieBannerComponent;

  override readonly mainContent: Locator;
  readonly heading: Locator;
  readonly productLinks: Locator;
  readonly categoryLinks: Locator;
  readonly brandLinks: Locator;
  readonly newsletterForm: Locator;

  /**
   * Compatibility alias for existing tests.
   * Prefer `homePage.search.input` in new tests.
   */
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);

    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.search = new SearchComponent(page);
    this.cookieBanner = new CookieBannerComponent(page);

    this.mainContent = page.locator('main#bwzo');

    this.heading = this.mainContent.getByRole('heading', {
      level: 1,
      name: /beautywelt.*beauty-onlineshop/i,
    });

    /*
     * Product detail links contain `/a/<numeric product ID>` and a title.
     * Requiring a product image excludes promotional links targeting a
     * product URL but not representing a catalog card.
     */
    this.productLinks = this.mainContent.locator(PRODUCT_LINK_SELECTOR);

    this.categoryLinks = this.header.root.locator(CATEGORY_LINK_SELECTOR);

    this.brandLinks = this.mainContent.locator(
      'a[role="img"][aria-label][href]',
    );

    this.newsletterForm = this.mainContent.locator(
      'form[action="/newsletter.php"][method="post" i]',
    );

    this.searchInput = this.search.input;
  }

  override async gotoHome(): Promise<Response | null> {
    return this.goto('/');
  }

  async assertPageIdentity(): Promise<void> {
    await expect(this.mainContent).toHaveCount(1);
    await expect(this.mainContent).toBeVisible();
    await expect(this.heading).toHaveCount(1);
    await expect(this.heading).toBeVisible();

    await expect(this.page).toHaveTitle(/online parf.*merie.*beautywelt/i);
  }

  async assertAuthorizedApplicationLoaded(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: /unauthorized/i,
      }),
    ).toHaveCount(0);

    await expect(this.page.locator('body')).not.toContainText(
      /could not verify that you are authorized/i,
    );
  }

  /**
   * Safety gate for staging flows.
   *
   * The inspected HTML contains an absolute `<base>` element. If the base
   * origin differs from the current page origin, relative links and forms can
   * lead to a different environment. Stateful tests must stop in that case.
   */
  async assertBaseOriginMatchesCurrentPage(): Promise<void> {
    const pageUrl = new URL(this.page.url());

    const documentBaseUrl = await this.page.evaluate(() => {
      return document.baseURI;
    });

    const documentBaseOrigin = new URL(documentBaseUrl).origin;

    if (documentBaseOrigin !== pageUrl.origin) {
      throw new Error(
        [
          'Unsafe document base origin detected.',
          `Current page origin: ${pageUrl.origin}.`,
          `Document base origin: ${documentBaseOrigin}.`,
          'Relative links or forms may navigate to another environment.',
        ].join(' '),
      );
    }
  }

  async getVisibleProductCards(): Promise<ProductCardComponent[]> {
    const productLinkCount = await this.productLinks.count();
    const productCards: ProductCardComponent[] = [];

    for (let index = 0; index < productLinkCount; index += 1) {
      const productLink = this.productLinks.nth(index);

      if (await productLink.isVisible()) {
        productCards.push(new ProductCardComponent(productLink));
      }
    }

    return productCards;
  }

  async getVisibleProductCardCount(): Promise<number> {
    const productCards = await this.getVisibleProductCards();

    return productCards.length;
  }
}
