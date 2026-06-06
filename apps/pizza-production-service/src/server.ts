import { buildApp } from './app.js';
import { boss } from './jobs/boss.js';
import { ExpirationJob } from './jobs/expiration.job.js';

console.log('server.ts started');

const app = buildApp();

const start = async () => {
    await boss.start();

    const expirationJob = new ExpirationJob(boss);

    await expirationJob.register();

    app.addHook('onClose', async () => {
        await boss.stop();
    });

    try {
        await app.listen({ port: 3000 });
        console.log('Server is running on http://localhost:3000');
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

start();