import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormVentasPage } from './form-ventas.page';

const routes: Routes = [
  {
    path: '',
    component: FormVentasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormVentasPageRoutingModule {}
