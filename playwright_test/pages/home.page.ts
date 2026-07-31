import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly header: Locator;
  readonly footer: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.header = this.page.getByRole('banner');
    this.footer = this.page.getByRole('contentinfo');
    this.searchInput = this.header.getByRole('searchbox');
  }

  // Safe navigation checks 
  







}
