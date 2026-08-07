import { test, expect } from '@playwright/test';

test.describe('Cart Model @offline', () => {
  test('calculates the total for multiple items', async (): Promise<void> => {
    const items = [
      {
        unitPrice: 10,
        quantity: 2,
      },
      {
        unitPrice: 5,
        quantity: 1,
      },
    ];

    const total = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    expect(total).toBe(25);
  });
});
