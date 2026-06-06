import { PgBoss } from 'pg-boss';
import { OrderRepository } from '../repositories/order.repository.js';

const STALE_ORDER_JOB_NAME = 'mark-stale-order';
const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

interface StaleOrderJobData {
    orderId: string;
}

export class StaleOrderJob {
    constructor(
        private readonly boss: PgBoss,
        private readonly orderRepository: OrderRepository
    ) {}

    async register(): Promise<void> {
        await this.boss.createQueue(STALE_ORDER_JOB_NAME);

        await this.boss.work<StaleOrderJobData>(
            STALE_ORDER_JOB_NAME,
            async ([job]) => {
                const orderId = job.data.orderId;

                await this.run(orderId);
            }
        );
    }

    async schedule(orderId: string): Promise<void> {
        await this.boss.send(
            STALE_ORDER_JOB_NAME,
            { orderId },
            {
                startAfter: TWO_HOURS_IN_SECONDS
            }
        );
    }

    async run(orderId: string): Promise<void> {
        const order = this.orderRepository.getById(orderId);

        if (!order || order.status === 'ready') {
            return;
        }

        this.orderRepository.markStale(orderId);
    }
}