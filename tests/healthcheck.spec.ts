import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';

const app = buildApp();

beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

describe('GET /healthcheck', () => {
    it('should return OK', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/healthcheck'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('OK');
    });
});