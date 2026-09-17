import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Returns only the visible elements from a multi-element locator.
 *
 * Use this when a CSS selector matches both visible and hidden elements
 * (e.g. desktop + mobile duplicates) and you need to filter to the ones
 * the user can actually see.
 */
export async function getVisibleLocators(locator: Locator): Promise<Locator[]> {
  const matches: Locator[] = [];
  const count = await locator.count();

  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);

    if (await candidate.isVisible()) {
      matches.push(candidate);
    }
  }

  return matches;
}

/**
 * Asserts that a link's destination stays within the same origin as the
 * provided baseURL. Used to verify promotional and brand links don't
 * navigate off-site.
 */
export async function assertSameOriginDestination(
  link: Locator,
  baseURL: string,
): Promise<void> {
  const href = await link.getAttribute('href');

  expect(href, 'A visible promotional link must have an href.').toBeTruthy();

  const destination = new URL(href ?? '', baseURL);

  expect(destination.protocol).toBe('https:');
  expect(destination.origin).toBe(new URL(baseURL).origin);
}
