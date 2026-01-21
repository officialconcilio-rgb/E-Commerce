const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Products API', () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /api/products', () => {
        it('should return paginated products', async () => {
            const res = await request(app)
                .get('/api/products');

            expect(res.statusCode).toBe(200);
            expect(res.body.products).toBeDefined();
            expect(Array.isArray(res.body.products)).toBe(true);
        });

        it('should filter by category', async () => {
            const res = await request(app)
                .get('/api/products?category=shirts');

            expect(res.statusCode).toBe(200);
        });

        it('should support search', async () => {
            const res = await request(app)
                .get('/api/products?search=shirt');

            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/products/categories', () => {
        it('should return all categories', async () => {
            const res = await request(app)
                .get('/api/products/categories');

            expect(res.statusCode).toBe(200);
            expect(res.body.categories).toBeDefined();
            expect(Array.isArray(res.body.categories)).toBe(true);
        });
    });

    describe('GET /api/products/:slug', () => {
        it('should return product by slug', async () => {
            // First get a product slug
            const productsRes = await request(app).get('/api/products');
            if (productsRes.body.products.length > 0) {
                const slug = productsRes.body.products[0].slug;

                const res = await request(app)
                    .get(`/api/products/${slug}`);

                expect(res.statusCode).toBe(200);
                expect(res.body.product.slug).toBe(slug);
            }
        });

        it('should return 404 for non-existent product', async () => {
            const res = await request(app)
                .get('/api/products/non-existent-product-slug');

            expect(res.statusCode).toBe(404);
        });
    });
});
