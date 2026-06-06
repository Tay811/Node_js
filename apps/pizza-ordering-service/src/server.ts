import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import {
    buildFastifyRoute,
    buildFastifyRouteHandler
} from '@lokalise/fastify-api-contracts';
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider
} from 'fastify-type-provider-zod';
import { markPizzasReadyContract } from '@pizza/api-contracts/src/index.js';
import { boss } from './jobs/boss.js';
import { StaleOrderJob } from './jobs/stale-order.job.js';
import { OrderRepository } from './repositories/order.repository.js';

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const orderRepository = new OrderRepository();
const staleOrderJob = new StaleOrderJob(boss, orderRepository);

app.post('/orders', async () => {
    const order = orderRepository.create(randomUUID());

    await staleOrderJob.schedule(order.id);

    return {
        order
    };
});

app.post('/orders/:orderId/ready', async (request, reply) => {
    const { orderId } = request.params as {
        orderId: string;
    };

    const order = orderRepository.getById(orderId);

    if (!order) {
        return reply.code(404).send({
            error: 'Order not found'
        });
    }

    orderRepository.markReady(orderId);

    return {
        success: true
    };
});

const markPizzasReadyHandler = buildFastifyRouteHandler(
    markPizzasReadyContract,
    async (request, reply) => {
        console.log('Received ready pizzas:', request.body);

        return reply.status(200).send({
            success: true
        });
    }
);

app.withTypeProvider<ZodTypeProvider>().route(
    buildFastifyRoute(markPizzasReadyContract, markPizzasReadyHandler)
);

const start = async () => {
    await boss.start();

    await staleOrderJob.register();

    app.addHook('onClose', async () => {
        await boss.stop();
    });

    try {
        await app.listen({
            port: 4000
        });

        console.log('Ordering service running on http://localhost:4000');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();