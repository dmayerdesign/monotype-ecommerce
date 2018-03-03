import { Routes } from '@angular/router'

import { HomeComponent } from './containers/home/home.component'

export const blogRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
        outlet: 'blog'
    }
]
