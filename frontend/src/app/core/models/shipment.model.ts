import { ShipmentStatus } from "../enums/shipment-status.enum";

export interface Shipment {
    id: number;
    trackingNumber: string;
    origin: string;
    destination: string;
    status: ShipmentStatus;
    createdAt: string;
    updatedAt: string;
    currentLocation: string;
    estimatedDelivery?: string;
};

export type CreateShipmentDto = Omit<Shipment, 
'id' |'trackingNumber' | 'status' |'createdAt'|'updatedAt'|'currentLocation'>;

export type UpdateStatusDto = Omit<Shipment, 
'id' |'trackingNumber' |'origin' | 'destination' |'createdAt'|'updatedAt'|'estimatedDelivery'>;