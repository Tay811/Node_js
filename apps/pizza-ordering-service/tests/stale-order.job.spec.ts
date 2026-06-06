import { describe, expect, it, vi } from 'vitest';
import { StaleOrderJob } from '../src/jobs/stale-order.job.js';
import { OrderRepository } from '../src/repositories/order.repository.js';

describe('StaleOrderJob', () => {
    it('should register stale order queue worker', async () => {
        const boss = {
            createQueue: vi.fn(),
            work: vi.fn()
        };

        const orderRepository = new OrderRepository();
        const job = new StaleOrderJob(boss as never, orderRepository);

        await job.register();

        expect(boss.createQueue).toHaveBeenCalledWith('mark-stale-order');
        expect(boss.work).toHaveBeenCalledTimes(1);
    });

    it('should schedule stale order job after two hours', async () => {
        const boss = {
            send: vi.fn()
        };

        const orderRepository = new OrderRepository();
        const job = new StaleOrderJob(boss as never, orderRepository);

        await job.schedule('order-1');

        expect(boss.send).toHaveBeenCalledWith(
            'mark-stale-order',
            {
                orderId: 'order-1'
            },
            {
                startAfter: 7200
            }
        );
    });

    it('should mark pending order as stale', async () => {
        const boss = {};
        const orderRepository = new OrderRepository();
        const order = orderRepository.create('order-1');

        const job = new StaleOrderJob(boss as never, orderRepository);

        await job.run(order.id);

        expect(orderRepository.getById(order.id)?.status).toBe('stale');
    });

    it('should not mark ready order as stale', async () => {
        const boss = {};
        const orderRepository = new OrderRepository();
        const order = orderRepository.create('order-1');

        orderRepository.markReady(order.id);

        const job = new StaleOrderJob(boss as never, orderRepository);

        await job.run(order.id);

        expect(orderRepository.getById(order.id)?.status).toBe('ready');
    });
});