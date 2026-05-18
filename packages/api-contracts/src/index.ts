import { defineApiContract } from '@lokalise/api-contracts';
import { z } from 'zod/v4';

export const pizzaMadeSchema = z.object({
    type: z.string().min(1, 'pizza type is required'),
    amount: z.number().int().positive('amount must be greater than 0')
});

export const markPizzasReadyContract = defineApiContract({
    method: 'post',
    pathResolver: () => '/orders/ready',
    requestBodySchema: z.object({
        pizzas: z.array(pizzaMadeSchema).min(1, 'pizzas must contain at least one item')
    }),
    responsesByStatusCode: {
        200: z.object({
            success: z.boolean()
        })
    }
});

export type PizzaMade = z.infer<typeof pizzaMadeSchema>;
export type MarkPizzasReadyRequest = z.infer<typeof markPizzasReadyContract.requestBodySchema>;