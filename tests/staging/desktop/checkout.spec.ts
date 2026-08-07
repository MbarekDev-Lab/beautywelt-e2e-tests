import type { APIRequestContext, APIResponse } from '@playwright/test';
import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

const CART_ENDPOINT = '/warenkorb.php';
const CHECKOUT_ENDPOINT = `${CART_ENDPOINT}/checkout`;

const FIRST_RECORD_ID = 1;
const SECOND_RECORD_ID = 2;

type CartState = {
  readonly price: number;
  readonly stock: number;
};

type OrderItem = {
  readonly recordId: number;
  readonly quantity?: number;
};

type CreatedOrder = {
  readonly orderId: string | number;
  readonly items: readonly OrderItem[];
  readonly total: number;
};

type ErrorResponse = {
  readonly error: string;
};

function requireDestructiveTestAuthorization(): void {
  if (process.env.DESTRUCTIVE_TEST_AUTHORIZATION_REFERENCE?.trim()) {
    return;
  }

  throw new Error(
    [
      'Destructive checkout execution requires',
      'DESTRUCTIVE_TEST_AUTHORIZATION_REFERENCE.',
      'The authorization must explicitly permit order creation',
      'and inventory mutation on the approved test domain.',
    ].join(' '),
  );
}

async function expectSuccessfulResponse(response: APIResponse, operation: string,): Promise<void> {
  expect(
    response.status(),
    `${operation} returned HTTP ${response.status()}.`,
  ).toBeGreaterThanOrEqual(200);

  expect(
    response.status(),
    `${operation} returned HTTP ${response.status()}.`,
  ).toBeLessThan(300);
}

async function readCartState(request: APIRequestContext): Promise<CartState> {
  const response = await request.get(CART_ENDPOINT);

  await expectSuccessfulResponse(response, 'Reading the cart state');

  const body = (await response.json()) as Partial<CartState>;

  if (typeof body.price !== 'number' || !Number.isFinite(body.price)) {
    throw new Error('Cart response must contain a finite numeric price.');
  }

  if (typeof body.stock !== 'number' || !Number.isInteger(body.stock)) {
    throw new Error('Cart response must contain an integer stock value.');
  }

  return {
    price: body.price,
    stock: body.stock,
  };
}

async function readCreatedOrder(response: APIResponse): Promise<CreatedOrder> {
  await expectSuccessfulResponse(response, 'Creating the checkout order');

  const body = (await response.json()) as Partial<CreatedOrder>;

  if (typeof body.orderId !== 'string' && typeof body.orderId !== 'number') {
    throw new Error('Created order response must contain an orderId.');
  }

  if (!Array.isArray(body.items)) {
    throw new Error('Created order response must contain an items array.');
  }

  if (typeof body.total !== 'number' || !Number.isFinite(body.total)) {
    throw new Error(
      'Created order response must contain a finite numeric total.',
    );
  }

  return {
    orderId: body.orderId,
    items: body.items,
    total: body.total,
  };
}

async function resetCart(request: APIRequestContext): Promise<void> {
  const response = await request.delete(CART_ENDPOINT);

  /*
   * Accepted cleanup outcomes:
   *
   * 200: cart was cleared and a response body was returned.
   * 204: cart was cleared without a response body.
   * 404: no cart existed, so the desired empty state already existed.
   */
  expect([200, 204, 404], `Cart cleanup returned unexpected HTTP ${response.status()}.`,).toContain(response.status());
}

test.describe('Checkout API @staging @destructive @requires-authorization', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ baseURL, request }): Promise<void> => {
    requireAuthorizedStaging(baseURL);

    test.skip(
      process.env.RUN_DESTRUCTIVE_TESTS !== 'true',
      [
        'Destructive checkout tests are disabled.',
        'Set RUN_DESTRUCTIVE_TESTS=true only after receiving',
        'explicit authorization for order and stock mutation.',
      ].join(' '),
    );

    requireDestructiveTestAuthorization();

    await resetCart(request);
  });

  test.afterEach(async ({ request }): Promise<void> => {
    if (process.env.RUN_DESTRUCTIVE_TESTS !== 'true') {
      return;
    }

    await resetCart(request);
  });

  test('creates an order and decrements controlled test stock', async ({ request, }): Promise<void> => {
    const before = await test.step('Read stock and price before checkout', async (): Promise<CartState> => {
      return readCartState(request);
    });

    const order = await test.step('Create an authorized destructive test order', async (): Promise<CreatedOrder> => {
      const response = await request.post(CART_ENDPOINT, {
        data: {
          action: 'create',
          recordId: FIRST_RECORD_ID,
          quantity: 1,
        },
      });

      return readCreatedOrder(response);
    });

    await test.step('Validate the created order', async (): Promise<void> => {
      expect(order.orderId).toBeTruthy();
      expect(order.items).toHaveLength(1);

      expect(order.items[0]?.recordId).toBe(FIRST_RECORD_ID);

      expect(order.total).toBeCloseTo(before.price, 2);
    });

    await test.step('Verify controlled stock was decremented', async (): Promise<void> => {
      const after = await readCartState(request);

      expect(after.stock).toBe(before.stock - 1);
    });
  });

  test('returns the current cart contents', async ({ request, }): Promise<void> => {
    const response = await request.get(CART_ENDPOINT);

    await expectSuccessfulResponse(response, 'Reading the cart contents');
  });

  test('rejects checkout without required customer details', async ({
    request,
  }): Promise<void> => {
    await test.step('Add the controlled test item', async (): Promise<void> => {
      const response = await request.post(CART_ENDPOINT, {
        data: {
          recordId: FIRST_RECORD_ID,
          quantity: 1,
        },
      });

      await expectSuccessfulResponse(
        response,
        'Adding the controlled test item',
      );
    });

    const response =
      await test.step('Submit incomplete checkout data', async (): Promise<APIResponse> => {
        return request.post(CHECKOUT_ENDPOINT, {
          data: {
            name: 'Automated Test Customer',
          },
        });
      });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as Partial<ErrorResponse>;

    expect(typeof body.error).toBe('string');
    expect(body.error).toMatch(/required/i);
  });

  test('calculates the total for multiple controlled test items', async ({
    request,
  }): Promise<void> => {
    const firstRecord = await readCartState(request);
    const secondRecord = await readCartState(request);

    await test.step('Add the first controlled test item', async (): Promise<void> => {
      const response = await request.post(CART_ENDPOINT, {
        data: {
          recordId: FIRST_RECORD_ID,
          quantity: 1,
        },
      });

      await expectSuccessfulResponse(
        response,
        'Adding the first controlled test item',
      );
    });

    await test.step('Add three units of the second controlled test item', async (): Promise<void> => {
      const response = await request.post(CART_ENDPOINT, {
        data: {
          recordId: SECOND_RECORD_ID,
          quantity: 3,
        },
      });

      await expectSuccessfulResponse(
        response,
        'Adding the second controlled test item',
      );
    });

    const order =
      await test.step('Create the authorized multiple-item test order', async (): Promise<CreatedOrder> => {
        const response = await request.post(CART_ENDPOINT, {
          data: {
            action: 'create',
            name: 'Automated Test Customer',
            email: 'automated-test@example.test',
            address: 'Approved Test Address',
          },
        });

        return readCreatedOrder(response);
      });

    expect(order.items).toHaveLength(2);

    const expectedTotal =
      Math.round((firstRecord.price + secondRecord.price * 3) * 100) / 100;

    expect(order.total).toBeCloseTo(expectedTotal, 2);
  });
});
