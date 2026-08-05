import { test, expect } from '../../../fixtures/pom-fixtures';
import { requireAuthorizedStaging } from '../../../fixtures/staging-guard.fixture';

test.beforeEach(async ({ baseURL }): Promise<void> => {
  requireAuthorizedStaging(baseURL);
});

const PRODUCTION_HOSTS = new Set(['beautywelt.de', 'www.beautywelt.de']);

function assertStagingAuthorization(baseURL: string): void {
  const url = new URL(baseURL);
  const hostname = url.hostname.toLowerCase();

  if (PRODUCTION_HOSTS.has(hostname)) {
    throw new Error(
      'Checkout tests are prohibited against Beautywelt production.',
    );
  }

  if (process.env.TARGET_ENV !== 'staging') {
    throw new Error('Checkout tests require TARGET_ENV=staging.');
  }

  if (process.env.ALLOW_STATE_CHANGES !== 'true') {
    throw new Error('Checkout tests require ALLOW_STATE_CHANGES=true.');
  }

  if (!process.env.TEST_AUTHORIZATION_REFERENCE) {
    throw new Error('Checkout tests require TEST_AUTHORIZATION_REFERENCE.');
  }
}

test.describe('Checkout Flow @staging @stateful @requires-authorization', () => {
  test.describe.configure({ mode: 'serial' });

  const BASE = process.env.BASE_URL || process.env.ENVIRONMENT_URL || '';

  test.beforeEach(async ({ request }) => {
    assertStagingAuthorization(BASE);

    await request.delete(`${BASE}/warenkorb.php`);
  });

  test('POST /warenkorb.php should create a new order and decrement stock', async ({ request, }) => {
    assertStagingAuthorization(BASE);

    const beforeResponse = await request.get(`${BASE}/warenkorb.php`);
    await expect(beforeResponse).toBeOK();

    const before = await beforeResponse.json();

    const checkoutRes = await request.post(`${BASE}/warenkorb.php`, {
      data: {
        action: 'create',
      },
    });

    expect(checkoutRes.status()).toBe(200);
    await expect(checkoutRes).toBeOK();

    const order = await checkoutRes.json();

    expect(order).toHaveProperty('orderId');
    expect(order.items).toHaveLength(1);
    expect(order.items[0].recordId).toBe(1);
    expect(order.total).toBe(before.price);

    const afterResponse = await request.get(`${BASE}/warenkorb.php`);
    await expect(afterResponse).toBeOK();

    const after = await afterResponse.json();
    expect(after.stock).toBe(before.stock - 1);
  });

  test('GET /warenkorb.php should display the cart contents', async ({ request, }) => {
    assertStagingAuthorization(BASE);

    const response = await request.get(`${BASE}/warenkorb.php`);
    await expect(response).toBeOK();
  });

  test('POST /warenkorb.php/checkout without customer details returns 400', async ({ request, }) => {
    assertStagingAuthorization(BASE);

    await request.post(`${BASE}/warenkorb.php`, {
      data: {
        recordId: 1,
        quantity: 1,
      },
    });

    const res = await request.post(`${BASE}/warenkorb.php/checkout`, {
      data: {
        name: 'Test User',
      },
    });

    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error).toContain('required');
  });

  test('POST /warenkorb.php with multiple items totals correctly', async ({ request, }) => {
    assertStagingAuthorization(BASE);

    const rec1Response = await request.get(`${BASE}/warenkorb.php`);
    await expect(rec1Response).toBeOK();
    const rec1 = await rec1Response.json();

    const rec2Response = await request.get(`${BASE}/warenkorb.php`);
    await expect(rec2Response).toBeOK();
    const rec2 = await rec2Response.json();

    await request.post(`${BASE}/warenkorb.php`, {
      data: {
        recordId: 1,
        quantity: 1,
      },
    });

    await request.post(`${BASE}/warenkorb.php`, {
      data: {
        recordId: 2,
        quantity: 3,
      },
    });

    const checkoutRes = await request.post(`${BASE}/warenkorb.php`, {
      data: {
        name: 'Test User',
        email: 'test-user@example.test',
        address: 'Test Address',
      },
    });

    expect(checkoutRes.status()).toBe(200);

    const order = await checkoutRes.json();
    expect(order.items).toHaveLength(2);

    const expectedTotal = Math.round((rec1.price + rec2.price * 3) * 100) / 100;
    expect(order.total).toBe(expectedTotal);
  });
});
