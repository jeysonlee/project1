import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule),
        // Puedes agregar canActivate aquí si quieres proteger esta ruta
      },
      // Aquí puedes agregar más rutas hijas para otras pestañas, ej:
      // {
      //   path: 'settings',
      //   loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule),
      // },
        {
          path: 'users',
          loadChildren: () => import('../pages/users/users.module').then( m => m.UsersPageModule)
        },
        {
          path: 'obreros',
          loadChildren: () => import('../pages/obreros/list/list.module').then( m => m.ListPageModule)
        },
          {
            path: 'insumos',
            loadChildren: () => import('../pages/insumos/insumos-list/insumos-list.module').then( m => m.InsumosListPageModule)
          },
            {
          path: 'tipo-tareas',
          loadChildren: () => import('../pages/tipo-tarea/list-tipo-tareas/list-tipo-tareas.module').then( m => m.ListTipoTareasPageModule)
        },
          {
            path: 'parcelas',
            loadChildren: () => import('../pages/parcelas/list-parcelas/list-parcelas.module').then( m => m.ListParcelasPageModule)
          },
          {
          path: 'herramientas',
          loadChildren: () => import('../pages/herramientas/list-herramientas/list-herramientas.module').then( m => m.ListHerramientasPageModule)
        },


          {
            path: 'tareas',
            loadChildren: () => import('../pages/tareas/list-tareas/list-tareas.module').then( m => m.ListTareasPageModule)
          },
        {
          path: 'form-tareas',
          loadChildren: () => import('../pages/tareas/form-tareas/form-tareas.module').then( m => m.FormTareasPageModule)
        },
        {
          path: 'ventas',
          loadChildren: () => import('../pages/ventas/list-ventas/list-ventas.module').then( m => m.ListVentasPageModule)
        },
        {
          path: 'form-ventas',
          loadChildren: () => import('../pages/ventas/form-ventas/form-ventas.module').then( m => m.FormVentasPageModule)
        },
        {
          path: 'form-ventas/:id',
          loadChildren: () => import('../pages/ventas/form-ventas/form-ventas.module').then( m => m.FormVentasPageModule)
        },
        {
          path: 'cosechas',
          loadChildren: () => import('../pages/cosechas/list-cosechas/list-cosechas.module').then( m => m.ListCosechasPageModule)
        },
        {
          path: 'form-cosechas',
          loadChildren: () => import('../pages/cosechas/form-cosechas/form-cosechas.module').then( m => m.FormCosechasPageModule)
        },
        {
          path: 'form-cosechas/:id',
          loadChildren: () => import('../pages/cosechas/form-cosechas/form-cosechas.module').then( m => m.FormCosechasPageModule)
        },





      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
