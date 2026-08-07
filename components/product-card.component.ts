import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';

const PRODUCT_DESTINATION_PATTERN = /\/a\/\d+(?:[/?#]|$)/i;
const PRODUCT_IMAGE_SOURCE_PATTERN = /\/product\/\d+\//i;

export class ProductCardComponent {
  readonly root: Locator;
  readonly image: Locator;

  constructor(productLink: Locator) {
    this.root = productLink;

    this.image = this.root.locator(
      'img[alt][data-src*="/product/"], img[alt][src*="/product/"]',
    );
  }

  async readProductName(): Promise<string> {
    const productName = (await this.root.getAttribute('title'))?.trim();

    if (!productName) {
      throw new Error(
        'Product card link must have a non-empty title attribute.',
      );
    }

    return productName;
  }

  async readDestination(): Promise<string> {
    const destination = (await this.root.getAttribute('href'))?.trim();

    if (!destination) {
      throw new Error(
        'Product card link must have a non-empty href attribute.',
      );
    }

    if (!PRODUCT_DESTINATION_PATTERN.test(destination)) {
      throw new Error(
        `Product card destination does not contain a valid product ID: ${destination}`,
      );
    }

    return destination;
  }

  async readImageSource(): Promise<string> {
    await expect(this.image).toHaveCount(1);

    const imageSource =
      (await this.image.getAttribute('data-src'))?.trim() ||
      (await this.image.getAttribute('src'))?.trim();

    if (!imageSource) {
      throw new Error(
        'Product card image must have a non-empty data-src or src attribute.',
      );
    }

    return imageSource;
  }

  async expectCompleteInformation(): Promise<void> {
    await expect(this.root).toHaveCount(1);
    await expect(this.root).toBeVisible();

    const productName = await this.readProductName();
    const destination = await this.readDestination();
    const imageSource = await this.readImageSource();

    expect(productName, 'Product card title must not be empty.').not.toBe('');

    expect(
      destination,
      'Product card destination must contain a numeric product ID.',
    ).toMatch(PRODUCT_DESTINATION_PATTERN);

    expect(
      imageSource,
      'Product image source must contain a numeric product ID.',
    ).toMatch(PRODUCT_IMAGE_SOURCE_PATTERN);

    await expect(this.image).toHaveCount(1);

    await expect(
      this.image,
      'Product image alternative text must match the product title.',
    ).toHaveAttribute('alt', productName);
  }
}
