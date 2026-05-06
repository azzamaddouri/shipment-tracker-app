export const SHIPMENT_STATUS = {
    ORDER_PLACED: 'ORDER_PLACED',
    PROCESSING: 'PROCESSING',
    PICKED_UP: 'PICKED_UP',
    IN_TRANSIT: 'IN_TRANSIT',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    EXCEPTION: 'EXCEPTION'
} as const;

export type ShipmentStatus = keyof typeof SHIPMENT_STATUS;

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
    timestamp: string;
    message: string;

};

export const STATUS_LABELS: Readonly<Record<ShipmentStatus, string>> = {
    [SHIPMENT_STATUS.ORDER_PLACED]: 'Order Placed',
    [SHIPMENT_STATUS.PROCESSING]: 'Processing',
    [SHIPMENT_STATUS.PICKED_UP]: 'Picked Up',
    [SHIPMENT_STATUS.IN_TRANSIT]: 'In Transit',
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [SHIPMENT_STATUS.DELIVERED]: 'Delivered',
    [SHIPMENT_STATUS.EXCEPTION]: 'Exception'
};