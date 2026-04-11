import Fastify from 'fastify';
import { healthcheckRoutes } from './routes/healthcheck.js';
import { stockRoutes } from './routes/stock.js';

export function buildApp() {
    const app = Fastify();

    app.register(healthcheckRoutes);
    app.register(stockRoutes);

    return app;
}