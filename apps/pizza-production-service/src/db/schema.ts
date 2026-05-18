import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const shipmentsTable = pgTable('shipments', {
    id: uuid('id').defaultRandom().primaryKey(),
    targetWarehouse: text('target_warehouse').notNull(),
    ingredientId: text('ingredient_id').notNull(),
    units: integer('units').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});