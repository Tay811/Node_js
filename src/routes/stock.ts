import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { stockShipmentSchema } from '../schemas/stock.schema.js';
import { ShipmentService } from '../services/shipment.service.js';

const shipmentService = new ShipmentService();

export async function stockRoutes(app: FastifyInstance) {
    app.post('/stock/shipments', async (request, reply) => {
        try {
            const parsedBody = stockShipmentSchema.parse(request.body);

            const result = await shipmentService.registerShipment(parsedBody);

            return reply.status(200).send(result);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.status(400).send({
                    message: 'Invalid request body',
                    issues: error.issues
                });
            }

            if (error instanceof Error) {
                return reply.status(400).send({
                    message: error.message
                });
            }

            return reply.status(500).send({
                message: 'Internal server error'
            });
        }
    });
}