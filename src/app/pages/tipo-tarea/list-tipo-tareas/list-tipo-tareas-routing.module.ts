import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListTipoTareasPage } from './list-tipo-tareas.page';

const routes: Routes = [
  {
    path: '',
    component: ListTipoTareasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListTipoTareasPageRoutingModule {}
