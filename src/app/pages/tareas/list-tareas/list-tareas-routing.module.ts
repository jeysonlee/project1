import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListTareasPage } from './list-tareas.page';

const routes: Routes = [
  {
    path: '',
    component: ListTareasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListTareasPageRoutingModule {}
