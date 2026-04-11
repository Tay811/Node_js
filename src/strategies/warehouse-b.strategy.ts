import { WarehouseStrategy } from './warehouse.strategy.js';

export class WarehouseBStrategy implements WarehouseStrategy {
    warehouseId = 'warehouse-b';

    isWithinWorkingHours(date: Date): boolean {
        const hour = date.getHours();
        return hour >= 10 && hour < 18;
    }

    getMinimumUnits(): number {
        return 20;
    }

    getMaximumUnits(): number {
        return 800;
    }
}