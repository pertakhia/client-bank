import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth.guard';
import { clientDetailsResolver } from './core/guards/resolver/client-details.resolver';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./core/modules/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'clients',
        loadComponent: () => import('./core/modules/clients/client-list/client-list.component').then(m => m.ClientListComponent),
        canActivate:[ authGuard ]
    },
    {
        path: 'clients/:clientId',
        loadComponent: () => import('./core/modules/clients/client-list/client-details/client-details.component').then(m => m.ClientDetailsComponent),
        canActivate:[ authGuard ],
        resolve: {
            clientDetails:  clientDetailsResolver
        }
    },
    {
        path: 'add-clients',
        loadComponent: () => import('./core/modules/clients/client-form/client-form.component').then(m => m.ClientFormComponent),
        canActivate:[ authGuard ]
    },
    {
        path: 'edit-clients/:clientId',
        loadComponent: () => import('./core/modules/clients/client-update/client-update.component').then(m => m.ClientUpdateComponent),
        canActivate:[ authGuard ]
    },
    {
        path: 'login',
        loadComponent: () => import('./core/modules/auth/login/login.component').then(m => m.LoginComponent)
    }
];
