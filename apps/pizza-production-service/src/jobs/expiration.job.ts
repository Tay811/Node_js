import { PgBoss } from 'pg-boss';
import { ShipmentRepository } from '../repositories/shipment.repository.js';

const EXPIRATION_JOB_NAME = 'delete-expired-shipments';
const ONE_WEEK_IN_DAYS = 7;

export class ExpirationJob {
    constructor(
        private readonly boss: PgBoss,
        private readonly shipmentRepository = new ShipmentRepository()
    ) {}

    async register(): Promise<void> {
        await this.boss.createQueue(EXPIRATION_JOB_NAME);

        await this.boss.schedule(
            EXPIRATION_JOB_NAME,
            '0 0 * * *'
        );

        await this.boss.work(EXPIRATION_JOB_NAME, async () => {
            await this.run();
        });
    }

    async run(): Promise<number> {
        const expirationDate = new Date();

        expirationDate.setDate(
            expirationDate.getDate() - ONE_WEEK_IN_DAYS
        );

        return this.shipmentRepository.deleteShipmentsOlderThan(expirationDate);
    }
}