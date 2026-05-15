import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ShipmentWebSocketService } from '../../../../core';
import { pipe } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header  {
  private destroyRef = inject(DestroyRef);
  private websocketService = inject(ShipmentWebSocketService);
  title = 'Shipment Tracker';
  isConnected = signal(false);


  
}
