import { ShipmentStatus } from "../enums/shipment-status.enum";

export interface CarrierShipment {
  id:               number;
  trackingNumber:   string;
  status:           ShipmentStatus;
  origin:           string;
  destination:      string;
  currentLocation:  string;
  estimatedDelivery?: string;
  updatedAt:        string;
}

export type AllowedCarrierStatus =
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

export interface StatusUpdatePayload {
  status:          AllowedCarrierStatus;
  currentLocation: string;
}

export type GpsState = 'idle' | 'acquiring' | 'broadcasting' | 'error' | 'manual';