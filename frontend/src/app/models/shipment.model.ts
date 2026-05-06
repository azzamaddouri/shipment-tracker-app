export const SHIPMENT_STATUSES = {
    ORDER_PLACED: 'ORDER_PLACED',
    PROCESSING: 'PROCESSING',
    PICKED_UP: 'PICKED_UP',
    IN_TRANSIT: 'IN_TRANSIT',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    EXCEPTION: 'EXCEPTION'
} as const;

export type ShipmentStatus = keyof typeof SHIPMENT_STATUSES;

export interface Shipment {
    id: number;
    trackingNumber: string;
    origin: string;
    destination: string;
    status: ShipmentStatus;
    createdAt: String;
    updatedAt: String;
    currentLocation: string;
    estimatedDelivery?: string;
};


export interface CreateShipmentRequest {
    origin: string;
    destination: string;
    estimatedDelivery?: string;
};


export interface UpdateStatusRequest {
    status: ShipmentStatus;
    currentLocation?: string;
};

export interface StatusUpdateMessage{
    shipmentId: number;
    trackingNumber: string;
    status: ShipmentStatus;
    currentLocation: string;
    timestamp: String;
    message: string;

};

export const STATUS_LABELS: Readonly<Record<ShipmentStatus, string>> = {
    [SHIPMENT_STATUSES.ORDER_PLACED]: 'Order Placed',
    [SHIPMENT_STATUSES.PROCESSING]: 'Processing',
    [SHIPMENT_STATUSES.PICKED_UP]: 'Picked Up',
    [SHIPMENT_STATUSES.IN_TRANSIT]: 'In Transit',
    [SHIPMENT_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [SHIPMENT_STATUSES.DELIVERED]: 'Delivered',
    [SHIPMENT_STATUSES.EXCEPTION]: 'Exception'
};