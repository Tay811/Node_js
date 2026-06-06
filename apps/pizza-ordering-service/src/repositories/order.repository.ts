export type OrderStatus =
    | 'pending'
    | 'ready'
    | 'stale';

export interface Order {
    id: string;
    status: OrderStatus;
    createdAt: Date;
}

export class OrderRepository {
    private readonly orders = new Map<string, Order>();

    create(id: string): Order {
        const order: Order = {
            id,
            status: 'pending',
            createdAt: new Date()
        };

        this.orders.set(id, order);

        return order;
    }

    getById(id: string): Order | undefined {
        return this.orders.get(id);
    }

    markReady(id: string): void {
        const order = this.orders.get(id);

        if (!order) {
            return;
        }

        order.status = 'ready';
    }

    markStale(id: string): void {
        const order = this.orders.get(id);

        if (!order) {
            return;
        }

        order.status = 'stale';
    }
}