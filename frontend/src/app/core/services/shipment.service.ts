import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateShipmentRequest, Shipment } from '..';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/shipments';

  createShipment(createShipmentRequest: CreateShipmentRequest): Observable<Shipment> {
    return this.http.post<Shipment>(this.apiUrl, createShipmentRequest);
  }

  getAllShipments(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(this.apiUrl);
  }

  getShipmentById(id: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/${id}`);
  }
  
  getShipmentByTrackingNumber(trackingNumber: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/track/${trackingNumber}`);
  }

  updateShipmentStatus(id: number, statusUpdateRequest: any): Observable<Shipment> {
    return this.http.put<Shipment>(`${this.apiUrl}/${id}/status`, statusUpdateRequest);
  }
}
