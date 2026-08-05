import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class SearchComponent {
  readonly form: Locator;
  readonly input: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.form = page.locator('form[action="/suche"][method="GET"]');

    this.input = this.form.locator(
      'input[name="qs"][type="text"][aria-label="Suchen in allen Marken"]',
    );

    this.submitButton = this.form.getByRole('button', {
      name: 'Suchen',
      exact: true,
    });
  }

  async expectReady(): Promise<void> {
    await expect(this.form).toBeVisible();
    await expect(this.input).toHaveCount(1);
    await expect(this.input).toBeVisible();
    await expect(this.input).toBeEditable();
    await expect(this.submitButton).toBeVisible();
  }

  async searchFor(searchTerm: string): Promise<void> {
    const normalizedSearchTerm = searchTerm.trim();

    if (!normalizedSearchTerm) {
      throw new Error('Search term must not be empty.');
    }

    await this.expectReady();
    await this.input.fill(normalizedSearchTerm);
    await this.submitButton.click();
  }
}
