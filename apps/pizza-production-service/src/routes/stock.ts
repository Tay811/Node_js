import { buildClient, sendByApiContract } from '@lokalise/backend-http-client';
import { markPizzasReadyContract } from '@pizza/api-contracts/src/index.js';
import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { stockShipmentSchema } from '../schemas/stock.schema.js';
import { ShipmentService } from '../services/shipment.service.js';

const shipmentService = new ShipmentService();

const orderingServiceClient = buildClient('http://localhost:4000');

export async function stockRoutes(app: FastifyInstance) {
    app.post('/stock/shipments', async (request, reply) => {
        try {
            const parsedBody = stockShipmentSchema.parse(request.body);

            const result = await shipmentService.registerShipment(parsedBody);

            const orderingServiceResponse = await sendByApiContract(
                orderingServiceClient,
                markPizzasReadyContract,
                {
                    body: {
                        pizzas: [
                            {
                                type: 'margherita',
                                amount: 1
                            }
                        ]
                    }
                }
            );

            if (orderingServiceResponse.error) {
                throw new Error('Failed to notify ordering service');
            }

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