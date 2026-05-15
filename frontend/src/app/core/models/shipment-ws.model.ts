import { ShipmentStatus } from "..";

export interface StatusUpdateMessage{
    shipmentId: number;
    trackingNumber: string;
    status: ShipmentStatus;
    currentLocation: string;
    timestamp: string;
    message: string;

};