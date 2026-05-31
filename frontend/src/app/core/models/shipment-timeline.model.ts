import { ShipmentStatus } from "../enums/shipment-status.enum";

export interface TimelineEvent {
    status: ShipmentStatus;
    location: string;
    timestamp: string;
    note?: string;
}

export interface ShipmentDetails {
    weight?: number;
    type?: string;
    dimensions?: string;
    declaredValue?: number;
    dutyFees?: number;
    deliveryMode?: string;
    pickedUpAt?: string;
    shippedAt?: string;
}

export interface ShipmentParty {
    name: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
}