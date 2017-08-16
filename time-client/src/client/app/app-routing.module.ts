import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: '', loadChildren: './site/site.module#SiteModule' },
            { path: 'shop', loadChildren: './shop/shop.module#ShopModule' },
            { path: '**', redirectTo: '' },
        ]),
	],
    exports: [RouterModule],
})
export class AppRoutingModule {}