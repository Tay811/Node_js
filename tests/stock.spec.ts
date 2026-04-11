import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';

const app = buildApp();

beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

describe('POST /stock/shipments', () => {
    it('should return 400 for invalid request', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/stock/shipments',
            payload: {
                items: [
                    {
                        ingredientName: '',
                        quantity: -5,
                        unit: ''
                    }
                ]
            }
        });

        expect(response.statusCode).toBe(400);

        const body = response.json();
        expect(body.message).toBe('Invalid request body');
    });

    it('should return 200 for valid request', async () => {
        const payload = {
            items: [
                {
                    ingredientName: 'mozzarella',
                    quantity: 10,
                    unit: 'kg'
                },
                {
                    ingredientName: 'flour',
                    quantity: 25,
                    unit: 'kg'
                }
            ]
        };

        const response = await app.inject({
            method: 'POST',
            url: '/stock/shipments',
            payload
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual(payload);
    });
});