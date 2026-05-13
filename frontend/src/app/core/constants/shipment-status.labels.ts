import { ShipmentStatus, SHIPMENT_STATUS } from "../enums/shipment-status.enum";

export const STATUS_LABELS: Readonly<Record<ShipmentStatus, string>> = {
    [SHIPMENT_STATUS.ORDER_PLACED]: 'Order Placed',
    [SHIPMENT_STATUS.PROCESSING]: 'Processing',
    [SHIPMENT_STATUS.PICKED_UP]: 'Picked Up',
    [SHIPMENT_STATUS.IN_TRANSIT]: 'In Transit',
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [SHIPMENT_STATUS.DELIVERED]: 'Delivered',
    [SHIPMENT_STATUS.EXCEPTION]: 'Exception'
};