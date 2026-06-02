import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core';
import { CarrierService } from '../../core/services/carrier.service';

@Component({
  selector: 'app-carrier-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-50 flex"
         style="font-family: 'Plus Jakarta Sans', sans-serif">

      <!-- ══ SIDEBAR ════════════════════════════════════════════════════ -->
      <aside class="shrink-0 bg-white border-r border-slate-200 flex flex-col
                    sticky top-0 h-screen transition-all duration-300 ease-in-out"
             [class]="collapsed() ? 'w-[60px]' : 'w-56'">

        <!-- Logo + toggle button -->
        <div class="h-14 flex items-center border-b border-slate-100 px-3
                    justify-between overflow-hidden">

          <!-- Logo — hidden when collapsed -->
          @if (!collapsed()) {
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 bg-orange-500 rounded-lg flex items-center
                          justify-center shrink-0">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                     stroke="white" stroke-width="2.2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div class="flex flex-col leading-none">
                <span class="text-[12px] font-extrabold text-slate-900 tracking-wide"
                      style="font-family:'Syne',sans-serif;">CARRIER</span>
                <span class="text-[10px] text-slate-400">Portal</span>
              </div>
            </div>
          }

          <!-- Toggle button -->
          <button (click)="collapsed.update(v => !v)"
                  class="w-7 h-7 flex items-center justify-center rounded-lg
                         text-slate-400 hover:bg-slate-100 hover:text-slate-600
                         transition-colors border-none bg-transparent cursor-pointer
                         shrink-0"
                  [class.mx-auto]="collapsed()">
            <svg class="w-4 h-4 transition-transform duration-300"
                 [class.rotate-180]="collapsed()"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        <!-- GPS indicator -->
        @if (carrierService.isBroadcasting()) {
          <div class="mx-2 mt-3 rounded-lg overflow-hidden"
               [class]="collapsed()
                 ? 'px-2 py-2 flex justify-center bg-green-50 border border-green-200'
                 : 'px-3 py-2 flex items-center gap-2 bg-green-50 border border-green-200'">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shrink-0"></span>
            @if (!collapsed()) {
              <span class="text-[11px] font-semibold text-green-700">Broadcasting GPS</span>
            }
          </div>
        }

        <!-- Nav links -->
        <nav class="flex-1 px-2 py-4 space-y-1">

          <a routerLink="/carrier/dashboard"
             routerLinkActive="bg-orange-50 text-orange-600"
             [routerLinkActiveOptions]="{ exact: true }"
             [title]="collapsed() ? 'Dashboard' : ''"
             class="flex items-center gap-3 px-2.5 py-2.5 rounded-lg
                    text-[13px] font-semibold text-slate-600
                    hover:bg-slate-50 hover:text-slate-800
                    transition-colors no-underline overflow-hidden"
             [class.justify-center]="collapsed()">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            @if (!collapsed()) {
              <span>Dashboard</span>
            }
          </a>

          <a routerLink="/carrier/deliveries"
             routerLinkActive="bg-orange-50 text-orange-600"
             [title]="collapsed() ? 'Deliveries' : ''"
             class="flex items-center gap-3 px-2.5 py-2.5 rounded-lg
                    text-[13px] font-semibold text-slate-600
                    hover:bg-slate-50 hover:text-slate-800
                    transition-colors no-underline overflow-hidden"
             [class.justify-center]="collapsed()">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
            </svg>
            @if (!collapsed()) {
              <span class="flex items-center gap-2 flex-1">
                Deliveries
                @if (carrierService.shipments().length > 0) {
                  <span class="ml-auto text-[10px] font-bold bg-orange-100
                               text-orange-600 px-1.5 py-0.5 rounded-full">
                    {{ carrierService.shipments().length }}
                  </span>
                }
              </span>
            }
          </a>

        </nav>

        <!-- User + sign out -->
        <div class="px-2 py-4 border-t border-slate-100">
          @if (!collapsed()) {
            <div class="flex items-center gap-2.5 px-2 py-2 mb-1">
              <div class="w-7 h-7 rounded-full bg-orange-100 flex items-center
                          justify-center text-[11px] font-bold text-orange-600 shrink-0">
                {{ currentUser()?.name?.charAt(0) ?? '?' }}
              </div>
              <div class="flex flex-col leading-none min-w-0">
                <span class="text-[12px] font-semibold text-slate-800 truncate">
                  {{ currentUser()?.name ?? 'Carrier' }}
                </span>
                <span class="text-[10px] text-slate-400 truncate">
                  {{ currentUser()?.email }}
                </span>
              </div>
            </div>
          }

          <button (click)="logout()"
                  [title]="collapsed() ? 'Sign out' : ''"
                  class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                         text-[13px] font-semibold text-slate-500
                         hover:bg-red-50 hover:text-red-600
                         transition-colors border-none bg-transparent cursor-pointer"
                  [class.justify-center]="collapsed()">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            @if (!collapsed()) {
              Sign out
            }
          </button>
        </div>

      </aside>

      <!-- ══ PAGE CONTENT ════════════════════════════════════════════════ -->
      <main class="flex-1 min-w-0 overflow-y-auto">
        <router-outlet/>
      </main>

    </div>
  `,
})
export class CarrierShellComponent {
  private readonly authService = inject(AuthService);
  readonly carrierService      = inject(CarrierService);
  readonly currentUser         = this.authService.user;
  readonly collapsed           = signal(false);

  logout(): void {
    this.authService.logout();
  }
}