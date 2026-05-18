import Fastify from 'fastify';
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

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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