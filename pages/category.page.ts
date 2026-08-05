import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CategoryPage extends BasePage {
  readonly title: Locator;
  readonly mainContent: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.title = page.getByRole('heading', { level: 1 });
    this.mainContent = page.getByRole('main');
    this.errorMessage = page.getByText(
      /entschuldigung, diese seite wurde leider/i,
    );
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
