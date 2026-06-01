export interface RoutePoint {
  latitude:   number;
  longitude:  number;
  label?:     string;
  recordedAt: string;
}

export interface LocationUpdateMessage {
  trackingNumber: string;
  latitude:       number;
  longitude:      number;
  label?:         string;
  recordedAt:     string;
}