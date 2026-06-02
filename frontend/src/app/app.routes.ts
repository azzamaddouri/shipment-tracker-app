import { Routes } from '@angular/router';
import { publicGuard } from './core/guards/public/public-guard';
import { authGuard } from './core/guards/auth/auth-guard';
import { roleGuard } from './core/guards/role/role-guard';
import { CarrierShellComponent } from './layout/carrier-shell/carrier-shell.component';
import { CarrierDashboardComponent } from './features/carrier/carrier-dashboard/carrier-dashboard.component';
;

export const routes: Routes = [

    {
        path:'',
        loadComponent: ()=>
            import('./features/public/home/home.component')
        .then(m => m.HomeComponent)
    },

    {
        path:'track/:trackingNumber',
        loadComponent : () =>
            import('./features/public/shipment-tracking/shipment-tracking.component')
        .then(m => m.ShipmentTrackingComponent)
    },

    {
        path:'login',
        canActivate : [publicGuard],
        loadComponent: () =>
            import('./features/public/login/login.component')
        .then(m => m.LoginComponent)

    },

    {
        path:'operator',
        loadComponent: () =>
            import('./layout/operator-shell/operator-shell.component')
        .then(m => m.OperatorShellComponent),
        canActivate:[authGuard, roleGuard('OPERATOR')],
        children:[
            {path: '', redirectTo:'dashboard', pathMatch:'full'},
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/operator/operator-dashboard/operator-dashboard.component')
                .then(m => m.OperatorDashboardComponent)
            }

        ]
        
    },

    {
    path: 'carrier',
    component: CarrierShellComponent,
    canActivate: [authGuard, roleGuard('CARRIER')],
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
            path: 'dashboard',
            loadComponent: () =>
                import('./features/carrier/carrier-dashboard/carrier-dashboard.component')
                .then(m => m.CarrierDashboardComponent)
        },
        {
            path: 'deliveries',   // ← add this
            loadComponent: () =>
                import('./features/carrier/carrier-deliveries/carrier-deliveries.component')
                .then(m => m.CarrierDeliveriesComponent)
        }
    ]
},
    
    {path:'**', redirectTo:'' },

];
