import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ShipmentWebsocketService } from '../../../../core';
import { pipe } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private destroyRef = inject(DestroyRef);
  private websocketService = inject(ShipmentWebsocketService);
  title = 'Shipment Tracker';
  isConnected = signal(false);


  ngOnInit(): void {
    this.websocketService.isConnected()
    .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (connected) => {
        this.isConnected.set(connected);
      }
    );
  }
}
