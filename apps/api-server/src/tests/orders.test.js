const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Order API', () => {
    let authToken;
    let orderId;

    beforeAll(async () => {
        // Login to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'testPassword123'
            });
        authToken = res.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/orders', () => {
        it('should reject order with empty cart', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    addressId: 'someAddressId',
                    paymentMethod: 'Prepaid'
                });

            // Should fail because cart is empty
            expect([400, 500]).toContain(res.statusCode);
        });

        it('should reject order without authentication', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    addressId: 'someAddressId',
                    paymentMethod: 'COD'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/orders/verify', () => {
        it('should reject invalid signature', async () => {
            const res = await request(app)
                .post('/api/orders/verify')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    razorpay_order_id: 'fake_order_id',
                    razorpay_payment_id: 'fake_payment_id',
                    razorpay_signature: 'fake_signature'
                });

            expect([400, 404]).toContain(res.statusCode);
        });
    });

    describe('POST /api/orders/failed', () => {
        it('should record payment failure', async () => {
            const res = await request(app)
                .post('/api/orders/failed')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    razorpay_order_id: 'non_existent_order',
                    error_description: 'Test failure'
                });

            expect(res.statusCode).toBe(200);
        });
    });
});
