import { z } from 'zod';

export const stockShipmentSchema = z.object({
    items: z.array(
        z.object({
            ingredientName: z.string().min(1, 'ingredientName is required'),
            quantity: z.number().positive('quantity must be greater than 0'),
            unit: z.string().min(1, 'unit is required')
        })
    ).min(1, 'items must contain at least one ingredient')
});

export type StockShipmentInput = z.infer<typeof stockShipmentSchema>;