import { ShipmentRepository } from '../repositories/shipment.repository.js';
import { WarehouseAStrategy } from '../strategies/warehouse-a.strategy.js';
import { WarehouseBStrategy } from '../strategies/warehouse-b.strategy.js';
import { WarehouseStrategy } from '../strategies/warehouse.strategy.js';

type ShipmentIngredient = {
    id: string;
    units: number;
};

type RegisterShipmentParams = {
    targetWarehouse: string;
    ingredients: ShipmentIngredient[];
    submittedAt?: Date;
};

type ShipmentCreateData = {
    targetWarehouse: string;
    ingredientId: string;
    units: number;
};

type Shipment = {
    id: string;
    targetWarehouse: string;
    ingredientId: string;
    units: number;
    createdAt: Date;
};

type ShipmentRepositoryLike = {
    createShipment(data: ShipmentCreateData): Promise<Shipment>;
};

export class ShipmentService {
    private readonly strategies: Map<string, WarehouseStrategy>;
    private readonly shipmentRepository: ShipmentRepositoryLike;

    constructor(
        shipmentRepository: ShipmentRepositoryLike = new ShipmentRepository()
    ) {
        const warehouseStrategies: WarehouseStrategy[] = [
            new WarehouseAStrategy(),
            new WarehouseBStrategy()
        ];

        this.strategies = new Map(
            warehouseStrategies.map((strategy) => [strategy.warehouseId, strategy])
        );

        this.shipmentRepository = shipmentRepository;
    }

    async registerShipment(params: RegisterShipmentParams): Promise<Shipment[]> {
        if (!params.ingredients.length) {
            throw new Error('Ingredients are required');
        }

        const strategy = this.getStrategy(params.targetWarehouse);
        const submittedAt = params.submittedAt ?? new Date();

        if (!strategy.isWithinWorkingHours(submittedAt)) {
            throw new Error('Shipment is submitted out of warehouse working hours');
        }

        const createdShipments: Shipment[] = [];

        for (const ingredient of params.ingredients) {
            if (ingredient.units <= 0) {
                throw new Error(`Ingredient "${ingredient.id}" must have positive units`);
            }

            if (ingredient.units < strategy.getMinimumUnits()) {
                throw new Error(`Ingredient "${ingredient.id}" has less than minimum amount of units`);
            }

            const shipmentsToCreate = this.splitIngredient(
                params.targetWarehouse,
                ingredient.id,
                ingredient.units,
                strategy.getMaximumUnits()
            );

            for (const shipment of shipmentsToCreate) {
                const createdShipment = await this.shipmentRepository.createShipment(shipment);
                createdShipments.push(createdShipment);
            }
        }

        return createdShipments;
    }

    private getStrategy(targetWarehouse: string): WarehouseStrategy {
        const strategy = this.strategies.get(targetWarehouse);

        if (!strategy) {
            throw new Error(`Unknown warehouse: ${targetWarehouse}`);
        }

        return strategy;
    }

    private splitIngredient(
        targetWarehouse: string,
        ingredientId: string,
        units: number,
        warehouseMaximumUnits: number
    ): ShipmentCreateData[] {
        const result: ShipmentCreateData[] = [];
        const chunkSize = Math.min(warehouseMaximumUnits, 1000);

        let remainingUnits = units;

        while (remainingUnits > chunkSize) {
            result.push({
                targetWarehouse,
                ingredientId,
                units: chunkSize
            });

            remainingUnits -= chunkSize;
        }

        result.push({
            targetWarehouse,
            ingredientId,
            units: remainingUnits
        });

        return result;
    }
}
