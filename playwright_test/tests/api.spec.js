// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * API Tests
 */

const BASE_URL = 'https://www.beautywelt.de/';

test.describe('API Tests', () => {

  test.describe('Marken API', () => {

    test('GET /api/products should return all Marken', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/Marken`);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBe(6);
    });

    test('GET /api/products should filter by category Damenparfüm', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/parfuem-damenparfuem-duefte`);

      expect(response.ok()).toBeTruthy();

      const products = await response.json();
      expect(products.length).toBeGreaterThan(0);
      products.forEach(product => {
        expect(product.category).toBe('Eau de Parfum');
      });
    });

    test('GET /api/products should filter by search term Extrait de Parfum', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/parfuem-damenparfuem-duefte?mf=6590`);

      expect(response.ok()).toBeTruthy();

      const products = await response.json();
      expect(products.length).toBe(474); // Assuming there are 474 products matching the search term
      expect(products[0].name.toLowerCase()).toContain('extrait de parfum');
    });

    test('GET /api/products/:id should return single product', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/products/1`);

      expect(response.ok()).toBeTruthy();

      const product = await response.json();
      expect(product.id).toBe(1);
      expect(product.name).toBeDefined();
      expect(product.price).toBeDefined();
    });

    test('GET /api/products/:id should return 404 for non-existent product', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/products/999`);

      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Product not found');
    });

  });

  test.describe('Cart API', () => {

    test.beforeEach(async ({ request }) => {
      // Clear cart before each test
      await request.delete(`${BASE_URL}/warenkorb.php`);
    });

    test('GET /api/cart should return empty cart initially', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/warenkorb.php`);

      expect(response.ok()).toBeTruthy();

      const cart = await response.json();
      expect(cart.items).toEqual([]);
      expect(cart.total).toBe('0.00');
    });

    test('POST /api/cart should add item to cart', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/warenkorb.php`, {
        data: { productId: 1, quantity: 2 }
      });

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.message).toBe('Added to cart');
      expect(data.cart.length).toBe(1);
      expect(data.cart[0].productId).toBe(1);
      expect(data.cart[0].quantity).toBe(2);
    });

    test('POST /api/cart should return 404 for non-existent product', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/warenkorb.php`, {
        data: { productId: 999, quantity: 1 }
      });

      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Product not found');
    });

    test('PUT /api/cart/:productId should update quantity', async ({ request }) => {
      // Add item first
      await request.post(`${BASE_URL}/warenkorb.php`, {
        data: { productId: 1, quantity: 1 }
      });

      // Update quantity
      const response = await request.put(`${BASE_URL}/warenkorb.php/1`, {
        data: { quantity: 5 }
      });

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.cart[0].quantity).toBe(5);
    });

    test('DELETE /api/cart/:productId should remove item', async ({ request }) => {
      // Add item first
      await request.post(`${BASE_URL}/warenkorb.php`, {
        data: { productId: 1, quantity: 1 }
      });

      // Remove item
      const response = await request.delete(`${BASE_URL}/warenkorb.php/1`);

      expect(response.ok()).toBeTruthy();

      // Verify cart is empty
      const cartResponse = await request.get(`${BASE_URL}/warenkorb.php`);
      const cart = await cartResponse.json();
      expect(cart.items.length).toBe(0);
    });

    test('DELETE /api/cart should clear entire cart', async ({ request }) => {
      // Add multiple items
      await request.post(`${BASE_URL}/warenkorb.php`, {
        data: { productId: 1, quantity: 1 }
      });
      await request.post(`${BASE_URL}/warenkorb.php`, {
        data: { productId: 2, quantity: 1 }
      });

      // Clear cart
      const response = await request.delete(`${BASE_URL}/warenkorb.php`);

      expect(response.ok()).toBeTruthy();

      // Verify cart is empty
      const cartResponse = await request.get(`${BASE_URL}/warenkorb.php`);
      const cart = await cartResponse.json();
      expect(cart.items.length).toBe(0);
    });

  });

  test.describe('Auth API', () => {

    test('POST /api/login should succeed with valid credentials', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/login`, {
        data: { email: 'test@beautywelt.com', password: 'test123' }
      });

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.message).toBe('Login successful');
      expect(data.user.email).toBe('test@beautywelt.com');
    });

    test('POST /api/login should fail with invalid credentials', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/login`, {
        data: { email: 'wrong@email.com', password: 'wrongpassword' }
      });

      expect(response.status()).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
    });

    test('POST /api/login should require email and password', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/login`, {
        data: {}
      });

      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Email and password required');
    });

    test('POST /api/register should create new user', async ({ request }) => {
      const uniqueEmail = `test${Date.now()}@example.com`;

      const response = await request.post(`${BASE_URL}/api/register`, {
        data: {
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123'
        }
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.message).toBe('Registration successful');
      expect(data.user.email).toBe(uniqueEmail);
    });

  });

  test.describe('Health API', () => {

    test('GET /api/health should return healthy status', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
    });

  });

});
