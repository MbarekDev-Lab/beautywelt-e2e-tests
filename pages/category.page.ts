import type { Locator, Page, Response } from '@playwright/test';
import { BasePage, type NavigationWaitUntil } from './base.page';

export class CategoryPage extends BasePage {
  readonly title: Locator;
  readonly errorMessage: Locator;
  readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);

    this.title = this.mainContent.getByRole('heading', {
      level: 1,
    });

    this.errorMessage = this.mainContent.getByText(
      /entschuldigung, diese seite wurde leider/i,
    );

    this.productLinks = this.mainContent.locator(
      [
        'li > a[href*="/a/"]has(img[alt][data-src*="/product/"])',
        'li > a[href*="/a/"]has(img[alt][src*="/product/"])',
      ].join(', '),
    );
  }

  override async goto(
    path: string,
    waitUntil: NavigationWaitUntil = 'domcontentloaded',
  ): Promise<Response | null> {
    return super.goto(path, waitUntil);
  }
}
