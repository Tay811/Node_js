import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ShipmentRepository } from '../src/repositories/shipment.repository.js';
import { db } from '../src/db/index.js';
import { shipmentsTable } from '../src/db/schema.js';

const repository = new ShipmentRepository();

describe('ShipmentRepository', () => {
    beforeAll(async () => {
        // очистим таблицу перед тестами
        await db.delete(shipmentsTable);
    });

    afterAll(async () => {
        // очистим после тестов
        await db.delete(shipmentsTable);
    });

    it('should create shipment', async () => {
        const shipment = await repository.createShipment({
            targetWarehouse: 'warehouse-a',
            ingredientId: 'cheese',
            units: 100
        });

        expect(shipment).toHaveProperty('id');
        expect(shipment.targetWarehouse).toBe('warehouse-a');
        expect(shipment.ingredientId).toBe('cheese');
        expect(shipment.units).toBe(100);
    });

    it('should get shipment by id', async () => {
        const created = await repository.createShipment({
            targetWarehouse: 'warehouse-a',
            ingredientId: 'tomato',
            units: 200
        });

        const found = await repository.getShipmentById(created.id);

        expect(found).toBeDefined();
        expect(found.id).toBe(created.id);
        expect(found.ingredientId).toBe('tomato');
    });

    it('should get all shipments', async () => {
        const all = await repository.getAllShipments();

        expect(Array.isArray(all)).toBe(true);
    });

    it('should delete shipment', async () => {
        const created = await repository.createShipment({
            targetWarehouse: 'warehouse-a',
            ingredientId: 'flour',
            units: 300
        });

        await repository.deleteShipment(created.id);

        const deleted = await repository.getShipmentById(created.id);

        expect(deleted).toBeUndefined();
    });
});