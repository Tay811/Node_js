import { z } from 'zod';

export const stockShipmentSchema = z.object({
    targetWarehouse: z.string().min(1, 'targetWarehouse is required'),
    ingredients: z.array(
        z.object({
            id: z.string().min(1, 'ingredient id is required'),
            units: z.number().int().positive('units must be greater than 0')
        })
    ).min(1, 'ingredients must contain at least one item')
});

export type StockShipmentInput = z.infer<typeof stockShipmentSchema>;