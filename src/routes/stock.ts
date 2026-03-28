import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { stockShipmentSchema } from '../schemas/stock.schema.js';

export async function stockRoutes(app: FastifyInstance) {
    app.post('/stock/shipments', async (request, reply) => {
        try {
            const parsedBody = stockShipmentSchema.parse(request.body);

            return reply.status(200).send(parsedBody);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    message: 'Invalid request body',
                    issues: error.issues
                });
            }

            return reply.status(500).send({
                message: 'Internal server error'
            });
        }
    });
}