import { WarehouseStrategy } from './warehouse.strategy.js';

export class WarehouseAStrategy implements WarehouseStrategy {
    warehouseId = 'warehouse-a';

    isWithinWorkingHours(date: Date): boolean {
        const hour = date.getHours();
        return hour >= 8 && hour < 20;
    }

    getMinimumUnits(): number {
        return 10;
    }

    getMaximumUnits(): number {
        return 1000;
    }
}