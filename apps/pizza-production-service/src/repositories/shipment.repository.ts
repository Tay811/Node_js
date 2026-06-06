import { db } from '../db';
import { shipmentsTable } from '../db/schema';
import { eq, lt } from 'drizzle-orm';

export class ShipmentRepository {
    async createShipment(data: {
        targetWarehouse: string;
        ingredientId: string;
        units: number;
    }) {
        const result = await db
            .insert(shipmentsTable)
            .values(data)
            .returning();

        return result[0];
    }

    async getShipmentById(id: string) {
        const result = await db
            .select()
            .from(shipmentsTable)
            .where(eq(shipmentsTable.id, id));

        return result[0];
    }

    async getAllShipments() {
        return db.select().from(shipmentsTable);
    }

    async deleteShipment(id: string) {
        await db
            .delete(shipmentsTable)
            .where(eq(shipmentsTable.id, id));
    }

    async deleteShipmentsOlderThan(date: Date) {
        const deletedShipments = await db
            .delete(shipmentsTable)
            .where(lt(shipmentsTable.createdAt, date))
            .returning();

        return deletedShipments.length;
    }
}