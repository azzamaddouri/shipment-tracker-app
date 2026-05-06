import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateShipmentRequest } from '../models/shipment.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/shipments';

  createShipment(createShipmentRequest: CreateShipmentRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, createShipmentRequest);
  }

  getAllShipments(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getShipmentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getShipmentByTrackingNumber(trackingNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/track/${trackingNumber}`);
  }

  updateShipmentStatus(id: number, statusUpdateRequest: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, statusUpdateRequest);
  }
}
