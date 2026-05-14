import { ShipmentStatus, SHIPMENT_STATUS } from "../enums/shipment-status.enum";

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


export interface UpdateStatusRequest {
    status: ShipmentStatus;
    currentLocation?: string;
};

export interface StatusUpdateMessage{
    shipmentId: number;
    trackingNumber: string;
    status: ShipmentStatus;
    currentLocation: string;
    timestamp: string;
    message: string;

};