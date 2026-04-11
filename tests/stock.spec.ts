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
                targetWarehouse: '',
                ingredients: []
            }
        });

        expect(response.statusCode).toBe(400);

        const body = response.json();
        expect(body.message).toBe('Invalid request body');
    });

    it('should return 200 for valid request', async () => {
        const payload = {
            targetWarehouse: 'warehouse-a',
            ingredients: [
                {
                    id: 'mozzarella',
                    units: 100
                }
            ]
        };

        const response = await app.inject({
            method: 'POST',
            url: '/stock/shipments',
            payload
        });

        expect(response.statusCode).toBe(200);

        const body = response.json();

        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toMatchObject({
            targetWarehouse: 'warehouse-a',
            ingredientId: 'mozzarella',
            units: 100
        });
    });
});