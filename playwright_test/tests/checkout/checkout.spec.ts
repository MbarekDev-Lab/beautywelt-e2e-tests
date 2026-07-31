import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Checkout Flow @production-readonly', () => {

    // Cart is shared DB state — run serially to avoid race conditions
    test.describe.configure({ mode: 'serial' });

    const BASE = process.env.ENVIRONMENT_URL || '';

    test.beforeEach(async ({ homePage }) => {
        await request.delete(`${BASE}/warenkorb.php`);

        // update database to ensure cart is empty before each test
        // create a new cart for the user
        /* await request.post(`${BASE}/warenkorb.php`, {
             data: {
                 action: 'create',
             },
         });*/
    });

    test('POST /warenkorb.php should create a new orer and decrements the stock', async ({ request }) => {
        // Get initial stock for record 1
        const before = await (await request.get(`${BASE}/warenkorb.php`)).json();
        const checkoutRes = await request.post(`${BASE}/warenkorb.php`, {
            data: {
                action: 'create',
            },
        });

        expect(checkoutRes.status).toBe(200);
        expect(checkoutRes).toBeOK();
        const order = await checkoutRes.json();

        expect(order).toHaveProperty('orderId');
        expect(order.items).toHaveLength(1);
        expect(order.items[0].recordId).toBe(1);
        expect(order.total).toBe(before.price);

        // Verify stock decremented
        const after = await (await request.get(`${BASE}/warenkorb.php`)).json();
        expect(after.stock).toBe(before.stock - 1);

    });

    test('GET /warenkorb.php should display the cart contents', async ({ request }) => {
        const response = await request.get(`${BASE}/warenkorb.php`);
        await expect(response).toBeOK();




    });

    test('POST /warenkorb.php/checkout without customer details returns 400', async ({ request }) => {
        await request.post(`${BASE}/warenkorb.php`, { data: { recordId: 1, quantity: 1 } });
        const res = await request.post(`${BASE}/warenkorb.php/checkout`, {
            data: { name: 'Test User' }, //missing email and address
        });

        expect(res.status()).toBe(400);
        const body = await res.json();
        expect(body.error).toContain('required');
    });

    test('POST /warenkorb.php with multiple items totals correctly', async ({ request }) => {
        const rec1 = await (await request.get(`${BASE}/warenkorb.php`)).json();
        const rec2 = await (await request.get(`${BASE}/warenkorb.php`)).json();

        await request.post(`${BASE}/warenkorb.php`, { data: { recordId: 1, quantity: 1 } });
        await request.post(`${BASE}/warenkorb.php`, { data: { recordId: 2, quantity: 3 } });

        const checkoutRes = await request.post(`${BASE}/warenkorb.php`, {
            data: { name: 'Test User', email: 'testUser@beautywelt.de', address: '21244 Buchholz' },
        });
        expect(checkoutRes.status()).toBe(200);

        const order = await checkoutRes.json();
        expect(order.items).toHaveLength(2);
        const expectedTotal = Math.round((rec1.price + rec2.price * 3) * 100) / 100;
        expect(order.total).toBe(expectedTotal);
    });


});
