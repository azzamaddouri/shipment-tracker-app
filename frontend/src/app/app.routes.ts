import { Routes } from '@angular/router';
import { publicGuard } from './core/guards/public/public-guard';
import { authGuard } from './core/guards/auth/auth-guard';
import { roleGuard } from './core/guards/role/role-guard';
import { OperatorShell } from './layout/operator-shell/operator-shell';
import { OperatorDashboard } from './features/operator/operator-dashboard/operator-dashboard';
import { CarrierDashboard } from './features/carrier/carrier-dashboard/carrier-dashboard';

export const routes: Routes = [

    {
        path:'',
        loadComponent: ()=>
            import('./features/public/home/home')
        .then(m => m.Home)
    },

    {
        path:'track/:trackingNumber',
        loadComponent : () =>
            import('./features/public/shipment-tracking/shipment-tracking')
        .then(m => m.ShipmentTracking)
    },

    {
        path:'/login',
        canActivate : [publicGuard],
        loadComponent: () =>
            import('./features/public/login/login')
        .then(m => m.Login)

    },

    {
        path:'/operator',
        component: OperatorShell,
        canActivate:[authGuard, roleGuard('OPERATOR')],
        children:[
            {path: '', redirectTo:'dashboard', pathMatch:'full'},
            { path:'dashboard', component:OperatorDashboard}

        ]
        
    },

    {
        path:'/carrier',
        component: OperatorShell,
        canActivate:[authGuard, roleGuard('CARRIER')],
        children:[
            {path: '', redirectTo:'dashboard', pathMatch:'full'},
            { path:'dashboard', component:CarrierDashboard}

        ]
        
    },
    {path:'**', redirectTo:'' },

];
