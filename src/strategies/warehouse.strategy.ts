export interface WarehouseStrategy {
    warehouseId: string;
    isWithinWorkingHours(date: Date): boolean;
    getMinimumUnits(): number;
    getMaximumUnits(): number;
}