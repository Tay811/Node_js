import { describe, expect, it, vi } from 'vitest';
import { ShipmentService } from '../src/services/shipment.service.js';

describe('ShipmentService', () => {
    it('should create one shipment when units are within warehouse limits', async () => {
        const createShipment = vi.fn(async (data) => ({
            id: '1',
            ...data,
            createdAt: new Date()
        }));

        const service = new ShipmentService({ createShipment });

        const result = await service.registerShipment({
            targetWarehouse: 'warehouse-a',
            ingredients: [{ id: 'cheese', units: 100 }]
        });

        expect(result).toHaveLength(1);
        expect(createShipment).toHaveBeenCalledTimes(1);
        expect(createShipment).toHaveBeenCalledWith({
            targetWarehouse: 'warehouse-a',
            ingredientId: 'cheese',
            units: 100
        });
    });

    it('should split shipment into multiple records when units exceed maximum', async () => {
        const createShipment = vi.fn(async (data) => ({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date()
        }));

        const service = new ShipmentService({ createShipment });

        const result = await service.registerShipment({
            targetWarehouse: 'warehouse-b',
            ingredients: [{ id: 'cheese', units: 1700 }]
        });

        expect(result).toHaveLength(3);
        expect(createShipment).toHaveBeenCalledTimes(3);
        expect(createShipment).toHaveBeenNthCalledWith(1, {
            targetWarehouse: 'warehouse-b',
            ingredientId: 'cheese',
            units: 800
        });
        expect(createShipment).toHaveBeenNthCalledWith(2, {
            targetWarehouse: 'warehouse-b',
            ingredientId: 'cheese',
            units: 800
        });
        expect(createShipment).toHaveBeenNthCalledWith(3, {
            targetWarehouse: 'warehouse-b',
            ingredientId: 'cheese',
            units: 100
        });
    });

    it('should reject shipment when units are below minimum', async () => {
        const createShipment = vi.fn();
        const service = new ShipmentService({ createShipment });

        await expect(
            service.registerShipment({
                targetWarehouse: 'warehouse-b',
                ingredients: [{ id: 'cheese', units: 10 }]
            })
        ).rejects.toThrow('Ingredient "cheese" has less than minimum amount of units');

        expect(createShipment).not.toHaveBeenCalled();
    });

    it('should reject shipment for unknown warehouse', async () => {
        const createShipment = vi.fn();
        const service = new ShipmentService({ createShipment });

        await expect(
            service.registerShipment({
                targetWarehouse: 'warehouse-x',
                ingredients: [{ id: 'cheese', units: 100 }]
            })
        ).rejects.toThrow('Unknown warehouse: warehouse-x');

        expect(createShipment).not.toHaveBeenCalled();
    });

    it('should reject shipment outside working hours', async () => {
        const createShipment = vi.fn();
        const service = new ShipmentService({ createShipment });

        const earlyMorning = new Date();
        earlyMorning.setHours(3, 0, 0, 0); // вне рабочего времени

        await expect(
            service.registerShipment({
                targetWarehouse: 'warehouse-a',
                ingredients: [{ id: 'cheese', units: 100 }],
                submittedAt: earlyMorning
            })
        ).rejects.toThrow('Shipment is submitted out of warehouse working hours');

        expect(createShipment).not.toHaveBeenCalled();
    });
});