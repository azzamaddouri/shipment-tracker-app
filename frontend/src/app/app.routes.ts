import { Routes } from '@angular/router';
import { publicGuard } from './core/guards/public/public-guard';
import { authGuard } from './core/guards/auth/auth-guard';
import { roleGuard } from './core/guards/role/role-guard';
import { OperatorShellComponent } from './layout/operator-shell/operator-shell.component';
import { OperatorDashboardComponent } from './features/operator/operator-dashboard/operator-dashboard.component';
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
        component: OperatorShellComponent,
        canActivate:[authGuard, roleGuard('OPERATOR')],
        children:[
            {path: '', redirectTo:'dashboard', pathMatch:'full'},
            { path:'dashboard', component:OperatorDashboardComponent}

        ]
        
    },

    {
        path:'carrier',
        component: CarrierShellComponent,
        canActivate:[authGuard, roleGuard('CARRIER')],
        children:[
            {path: '', redirectTo:'dashboard', pathMatch:'full'},
            { path:'dashboard', component:CarrierDashboardComponent}

        ]
        
    },
    {path:'**', redirectTo:'' },

];
