import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RedirectGuard } from './guards/redirect.guard';
import { RedirectPage } from './pages/redirect/redirect.page';
import { LoginGuard } from './guards/login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: RedirectPage,
    canActivate: [RedirectGuard]
  },
  {
    path: 'form-cosechas',
    loadChildren: () => import('./pages/cosechas/form-cosechas/form-cosechas.module').then( m => m.FormCosechasPageModule)
  },
  {
    path: 'list-cosechas',
    loadChildren: () => import('./pages/cosechas/list-cosechas/list-cosechas.module').then( m => m.ListCosechasPageModule)
  },
  {
    path: 'form-ventas',
    loadChildren: () => import('./pages/ventas/form-ventas/form-ventas.module').then( m => m.FormVentasPageModule)
  },
  {
    path: 'list-ventas',
    loadChildren: () => import('./pages/ventas/list-ventas/list-ventas.module').then( m => m.ListVentasPageModule)
  },

];



@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
