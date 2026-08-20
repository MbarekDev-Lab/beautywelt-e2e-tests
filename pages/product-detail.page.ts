import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

import { FooterComponent } from '../components/footer.component';
import { HeaderComponent } from '../components/header.component';
import { ProductCardComponent } from '../components/product-card.component';
import { CookieBannerComponent } from '../components/cookie-banner.component';


export class ProductDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get title(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get price(): Locator {
    return this.page.locator('text=/€|EUR/i');
  }

  get addToCartButton(): Locator {
    return this.page.getByRole('button', {
      name: /in den warenkorb|add to cart|zum warenkorb/i,
    });
  }
}
