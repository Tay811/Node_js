import { describe, expect, it, vi } from 'vitest';
import { ExpirationJob } from '../src/jobs/expiration.job.js';

describe('ExpirationJob', () => {
    it('should delete shipments older than one week', async () => {
        const boss = {
            createQueue: vi.fn(),
            schedule: vi.fn(),
            work: vi.fn()
        };

        const shipmentRepository = {
            deleteShipmentsOlderThan: vi.fn().mockResolvedValue(3)
        };

        const job = new ExpirationJob(
            boss as never,
            shipmentRepository
        );

        const deletedCount = await job.run();

        expect(deletedCount).toBe(3);
        expect(shipmentRepository.deleteShipmentsOlderThan).toHaveBeenCalledTimes(1);

        const expirationDate =
            shipmentRepository.deleteShipmentsOlderThan.mock.calls[0][0];

        expect(expirationDate).toBeInstanceOf(Date);
    });

    it('should register daily scheduled job', async () => {
        const boss = {
            createQueue: vi.fn(),
            schedule: vi.fn(),
            work: vi.fn()
        };

        const shipmentRepository = {
            deleteShipmentsOlderThan: vi.fn().mockResolvedValue(0)
        };

        const job = new ExpirationJob(
            boss as never,
            shipmentRepository
        );

        await job.register();

        expect(boss.createQueue).toHaveBeenCalledWith(
            'delete-expired-shipments'
        );

        expect(boss.schedule).toHaveBeenCalledWith(
            'delete-expired-shipments',
            '0 0 * * *'
        );

        expect(boss.work).toHaveBeenCalledTimes(1);
    });
});