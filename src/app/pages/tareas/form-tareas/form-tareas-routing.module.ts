import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormTareasPage } from './form-tareas.page';

const routes: Routes = [
  {
    path: '',
    component: FormTareasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormTareasPageRoutingModule {}
